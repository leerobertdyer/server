import router from "express";
import { db } from './firebaseAdmin';
import { welcomeEmailTemplate, newSeriesEmailTemplate, receiptEmailTemplate } from './emailTemplates';
import { transporter, GMAIL_USER } from '../nodemailer';

const edcEmailRouter = router();

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