import router from "express";
import admin from "firebase-admin";
import fs from "fs";
import { db } from './firebaseAdmin';
import { welcomeEmailTemplate, newSeriesEmailTemplate, receiptEmailTemplate, dailyReportEmailTemplate } from './emailTemplates';
import { transporter, GMAIL_USER } from '../nodemailer';

const edcEmailRouter = router();

/** Start of today UTC and start of next day (exclusive end) for daily report window */
function getTodayUTC(): { start: Date; endExclusive: Date } {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const endExclusive = new Date(start);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);
  return { start, endExclusive };
}

type GA4Traffic = { users: number; sessions: number; pageViews: number };

function parseTrafficRow(row: { metricValues?: Array<{ value?: string | null }> | null } | undefined): GA4Traffic {
  const vals = row?.metricValues;
  const users = vals?.[0]?.value != null ? Number(vals[0].value) : 0;
  const sessions = vals?.[1]?.value != null ? Number(vals[1].value) : 0;
  const pageViews = vals?.[2]?.value != null ? Number(vals[2].value) : 0;
  return { users, sessions, pageViews };
}

/** GA4 traffic for today and last 7 days in one API call. Returns both or null on failure. */
async function getGA4DailyAndLast7Traffic(
  dateLabel: string
): Promise<{ trafficToday: GA4Traffic; trafficLast7: GA4Traffic } | null> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId || !propertyId.trim()) return null;
  try {
    const last7Start = new Date(dateLabel + "T00:00:00Z");
    last7Start.setUTCDate(last7Start.getUTCDate() - 6);
    const last7StartLabel = last7Start.toISOString().slice(0, 10);

    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
    let creds: { client_email?: string; private_key?: string } | undefined;
    const credsJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (credsJson) {
      creds = JSON.parse(credsJson) as { client_email?: string; private_key?: string };
    } else {
      const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (keyPath && fs.existsSync(keyPath)) {
        const raw = fs.readFileSync(keyPath, "utf8");
        creds = JSON.parse(raw) as { client_email?: string; private_key?: string };
      }
    }
    const client =
      creds?.client_email && creds?.private_key
        ? new BetaAnalyticsDataClient({
            credentials: { client_email: creds.client_email, private_key: creds.private_key },
          })
        : new BetaAnalyticsDataClient();

    const [response] = await client.runReport({
      property: `properties/${propertyId.trim()}`,
      dateRanges: [
        { startDate: dateLabel, endDate: dateLabel },
        { startDate: last7StartLabel, endDate: dateLabel },
      ],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
    });
    const rows = response.rows ?? [];
    const trafficLast7 = parseTrafficRow(rows[0]);
    const trafficToday = parseTrafficRow(rows[1]);
    return { trafficToday, trafficLast7 };
  } catch (err) {
    console.error("GA4 traffic fetch failed:", err);
    return null;
  }
}

// Gmail SMTP Setup
const businessEmails = [
    "lee.dyer.dev@gmail.com",
    "erin.d.campbell@gmail.com"
];

edcEmailRouter.post("/send-sale-notification-email", async (req, res) => {
    const { customerName, customerEmail, shippingAddressString, itemsSold, soldPhotoLinks } = req.body;
    console.log('Received email request:', {customerName, customerEmail, shippingAddressString, itemsSold});
    
    try {
        // Send emails to all recipients
        const adminEmails = businessEmails.map(email => {
            return transporter.sendMail({
                from: `"Erin Dawn Sales" <${GMAIL_USER}>`,
                to: email,
                subject: "Sale made on erindawncampbell.com!",
                text: `${customerName} Just bought: \n ${itemsSold.join("\n")} \n\nThe order was added to your admin panel as unshipped. Here is the address: \n\n ${shippingAddressString}`
            });
        });

        // Send receipt to customer
        const receiptEmailData = receiptEmailTemplate(customerName, soldPhotoLinks)
        const customerResults = await transporter.sendMail({
            from: `"Erin Dawn" <${GMAIL_USER}>`,
            to: customerEmail,
            subject: "Purchase Details From ErinDawnCampbell.com",
            html: receiptEmailData.html,
            text: receiptEmailData.text
        })
        
        // Wait for all emails to be sent
        const adminResults = await Promise.all(adminEmails);
        const count = adminResults.length + (customerResults.accepted?.length ?? 0);
        console.log(`Successfully sent ${count} emails`);
        
        // Send success response
        res.status(200).json({ success: true, message: 'Emails sent successfully' });
        
    } catch (error) {
        console.error("Error sending email: ", error);
        res.status(500).json({ success: false, error: error });
    }
})

edcEmailRouter.post("/email-signup", async (req, res) => {
    const { email, firstName, lastName } = req.body;
    console.log('Received email signup request:', { email, firstName, lastName });
    
    try {
        // Add subscriber to Firestore
        const subscriberRef = db.collection('subscribers').doc(email);
        await subscriberRef.set({
            email,
            firstName: firstName || '',
            lastName: lastName || '',
            subscribedAt: new Date().toISOString()
        }, { merge: true }); // merge: true allows updating existing subscribers
        
        console.log(`Subscriber ${email} added to Firestore`);
        
        // Send welcome email via Gmail
        const welcomeEmail = welcomeEmailTemplate(firstName, email);
        await transporter.sendMail({
            from: `"Erin Dawn Campbell" <${GMAIL_USER}>`,
            to: email,
            subject: welcomeEmail.subject,
            html: welcomeEmail.html,
            text: welcomeEmail.text
        });
        
        console.log(`Welcome email sent to ${email}`);

        // Send success response
        res.status(200).json({ success: true, message: 'Subscribed successfully' });
        
    } catch (error) {
        console.error("Error in email signup: ", error);
        res.status(500).json({ success: false, error: error });
    }
})

edcEmailRouter.post("/send-new-series-email", async (req, res) => {
    const { featureName, featurePhoto1, featurePhoto2, featurePhoto3 } = req.body;
    console.log('Received new series email request:', featureName);
    
    try {
        // Get all subscribers from Firestore
        const subscribersSnapshot = await db.collection('subscribers').get();
        const subscribers = subscribersSnapshot.docs.map(doc => doc.data());
        
        console.log(`Sending email to ${subscribers.length} subscribers`);
        
        if (subscribers.length === 0) {
            return res.status(400).json({ success: false, message: 'No subscribers found' });
        }
        
        // Send email to each subscriber
        const emailPromises = subscribers.map(subscriber => {
            const recipientName = subscriber.firstName || '';
            const emailContent = newSeriesEmailTemplate({
                featureName,
                featurePhoto1,
                featurePhoto2,
                featurePhoto3,
                recipientName,
                recipientEmail: subscriber.email
            });
            
            return transporter.sendMail({
                from: `"Erin Dawn Campbell" <${GMAIL_USER}>`,
                to: subscriber.email,
                subject: emailContent.subject,
                html: emailContent.html,
                text: emailContent.text
            });
        });
        
        await Promise.all(emailPromises);

        console.log(`Email sent successfully to ${subscribers.length} subscribers`);
        // Send success response
        res.status(200).json({ success: true, message: `Email sent to ${subscribers.length} subscribers` });
        
    } catch (error) {
        console.error("Error sending email: ", error);
        res.status(500).json({ success: false, error: error });
    }
})

// Daily report: POST from cron; requires x-daily-report-secret header to match DAILY_REPORT_SECRET
edcEmailRouter.post("/send-daily-report", async (req, res) => {
  const secret = process.env.DAILY_REPORT_SECRET;
  if (!secret || req.headers["x-daily-report-secret"] !== secret) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const { start, endExclusive } = getTodayUTC();
    const dateLabel = start.toISOString().slice(0, 10);

    const subscribersSnap = await db
      .collection("subscribers")
      .where("subscribedAt", ">=", start.toISOString())
      .where("subscribedAt", "<", endExclusive.toISOString())
      .get();
    const newSubscribers = subscribersSnap.docs.map((d) => d.data());

    const salesSnap = await db
      .collection("sales")
      .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(start))
      .where("createdAt", "<", admin.firestore.Timestamp.fromDate(endExclusive))
      .get();
    const salesToday = salesSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as {
      id: string;
      customerName?: string;
      grandTotal?: number;
      itemsSold?: string[];
    }[];

    const totalSubscribersSnap = await db.collection("subscribers").get();
    const totalSubscribers = totalSubscribersSnap.size;

    const trafficReport = await getGA4DailyAndLast7Traffic(dateLabel);
    const trafficToday = trafficReport?.trafficToday ?? null;
    const trafficLast7 = trafficReport?.trafficLast7 ?? null;
    const propertyId = process.env.GA4_PROPERTY_ID?.trim();
    const ga4ReportUrl =
      propertyId != null && propertyId !== ""
        ? `https://analytics.google.com/analytics/web/#/p${propertyId}`
        : null;
    const { subject, html, text } = dailyReportEmailTemplate({
      dateLabel,
      trafficToday,
      trafficLast7,
      ga4ReportUrl,
      newSubscribers,
      salesToday,
      totalSubscribers,
    });

    const emailPromises = businessEmails.map((to) =>
      transporter.sendMail({
        from: `"Erin Dawn" <${GMAIL_USER}>`,
        to,
        subject,
        html,
        text,
      })
    );
    await Promise.all(emailPromises);

    console.log(`Daily report sent for ${dateLabel} to ${businessEmails.length} recipients`);
    res.status(200).json({
      success: true,
      message: `Report sent for ${dateLabel}`,
      newSubscribers: newSubscribers.length,
      salesToday: salesToday.length,
    });
  } catch (error) {
    console.error("Error sending daily report:", error);
    const msg = String(error);
    if (msg.includes("DECODER routines::unsupported") || msg.includes("Getting metadata from plugin failed")) {
      res.status(500).json({
        success: false,
        error: msg,
        hint: "Firebase private key invalid on Render. Use FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY (not FIREBASE_SERVICE_ACCOUNT). For FIREBASE_PRIVATE_KEY paste the PEM as one line with \\n for each newline. Unset GOOGLE_APPLICATION_CREDENTIALS if set.",
      });
      return;
    }
    res.status(500).json({ success: false, error: msg });
  }
});

// Unsubscribe route - GET so users can click the link directly
edcEmailRouter.get("/unsubscribe", async (req, res) => {
    const { email } = req.query;
    console.log('Received unsubscribe request for:', email);
    
    if (!email || typeof email !== "string") {
        return res.status(400).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Unsubscribe Error</title>
            </head>
            <body style="font-family: 'Georgia', serif; margin: 0; padding: 40px; background-color: #faf8f5; text-align: center;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <h1 style="color: #c75050; margin: 0 0 20px 0;">Oops!</h1>
                    <p style="color: #4a4a4a; line-height: 1.8;">No email address was provided. Please use the unsubscribe link from your email.</p>
                </div>
            </body>
            </html>
        `);
    }
    
    try {
        // Delete subscriber from Firestore
        const subscriberRef = db.collection('subscribers').doc(email);
        const doc = await subscriberRef.get();
        
        if (!doc.exists) {
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Not Found</title>
                </head>
                <body style="font-family: 'Georgia', serif; margin: 0; padding: 40px; background-color: #faf8f5; text-align: center;">
                    <div style="max-width: 500px; margin: 0 auto; background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                        <h1 style="color: #6b5b7a; margin: 0 0 20px 0;">Already Unsubscribed</h1>
                        <p style="color: #4a4a4a; line-height: 1.8;">This email address is not on our mailing list.</p>
                        <p style="margin-top: 30px;">
                            <a href="https://erindawncampbell.com" style="color: #6b5b7a;">Visit the website</a>
                        </p>
                    </div>
                </body>
                </html>
            `);
        }
        
        await subscriberRef.delete();
        console.log(`Successfully unsubscribed: ${email}`);
        
        // Return a nice HTML page
        res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Unsubscribed</title>
            </head>
            <body style="font-family: 'Georgia', serif; margin: 0; padding: 40px; background-color: #faf8f5; text-align: center;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <h1 style="color: #6b5b7a; margin: 0 0 20px 0;">You've been unsubscribed</h1>
                    <p style="color: #4a4a4a; line-height: 1.8;">We're sorry to see you go! You will no longer receive emails from Erin Dawn Campbell.</p>
                    <p style="color: #888; font-size: 14px; margin-top: 30px;">Changed your mind? You can always sign up again at:</p>
                    <p style="margin-top: 10px;">
                        <a href="https://erindawncampbell.com" style="color: #6b5b7a; font-size: 16px;">erindawncampbell.com</a>
                    </p>
                </div>
            </body>
            </html>
        `);
        
    } catch (error) {
        console.error("Error unsubscribing: ", error);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Error</title>
            </head>
            <body style="font-family: 'Georgia', serif; margin: 0; padding: 40px; background-color: #faf8f5; text-align: center;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                    <h1 style="color: #c75050; margin: 0 0 20px 0;">Something went wrong</h1>
                    <p style="color: #4a4a4a; line-height: 1.8;">We couldn't process your unsubscribe request. Please try again later or contact us directly.</p>
                </div>
            </body>
            </html>
        `);
    }
})

export default edcEmailRouter;