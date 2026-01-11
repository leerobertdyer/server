import { Router } from "express";
import { transporter, GMAIL_USER } from "../nodemailer";
import { customerReceiptTemplate } from "./emailTemplates";

const avEmailRouter = Router();

const NOTIFICATION_EMAIL = "lee.dyer.dev@gmail.com";

// Simple contact/notification endpoint (legacy)
avEmailRouter.post("/contact", async (req, res) => {
  const { senderEmail, message } = req.body;
  console.log("Received AV contact request from:", senderEmail);

  try {
    await transporter.sendMail({
      from: `"Aunt Vicki Merch" <${GMAIL_USER}>`,
      to: NOTIFICATION_EMAIL,
      subject: "Aunt Vicki Merch Notification",
      text: message,
      html: `<pre style="font-family: sans-serif; white-space: pre-wrap;">${message}</pre>`,
    });

    console.log("AV notification email sent successfully");
    res.status(200).json({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error("Error sending AV notification: ", error);
    res.status(500).json({ success: false, error: error });
  }
});

// Order confirmation endpoint - sends notification to shop AND receipt to customer
avEmailRouter.post("/order-confirmation", async (req, res) => {
  const { customerName, customerEmail, items, total, shippingAddress, orderSummary } = req.body;
  console.log("Received AV order confirmation for:", customerEmail);

  try {
    // 1. Send notification to shop owner
    await transporter.sendMail({
      from: `"Aunt Vicki Merch" <${GMAIL_USER}>`,
      to: NOTIFICATION_EMAIL,
      subject: "🎉 NEW AUNT VICKI SALE!",
      text: orderSummary,
      html: `<pre style="font-family: sans-serif; white-space: pre-wrap;">${orderSummary}</pre>`,
    });
    console.log("Shop notification sent");

    // 2. Send receipt to customer
    const receipt = customerReceiptTemplate({
      customerName,
      customerEmail,
      items,
      total,
      shippingAddress,
    });

    await transporter.sendMail({
      from: `"Aunt Vicki" <${GMAIL_USER}>`,
      to: customerEmail,
      subject: receipt.subject,
      html: receipt.html,
      text: receipt.text,
    });
    console.log("Customer receipt sent to:", customerEmail);

    res.status(200).json({ success: true, message: "Order confirmation sent" });
  } catch (error) {
    console.error("Error sending order confirmation:", error);
    res.status(500).json({ success: false, error: error });
  }
});

export default avEmailRouter;
