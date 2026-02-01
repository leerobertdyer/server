import { Router } from "express";
import { transporter, GMAIL_USER } from "../nodemailer";
import { nvelopesFeedbackTemplate } from "./emailTemplates";

const nvEmailRouter = Router();

const NOTIFICATION_EMAIL = "lee.dyer.dev@gmail.com";

nvEmailRouter.post("/feedback", async (req, res) => {
  const { email, message, rating } = req.body;

  if (!email || typeof email !== "string" || !email.trim()) {
    return res.status(400).json({ success: false, error: "Email is required" });
  }

  const normalizedRating = Math.min(5, Math.max(0, Number(rating) || 0));

  try {
    const { subject, html, text } = nvelopesFeedbackTemplate({
      email: email.trim(),
      message: typeof message === "string" ? message.trim() : "",
      rating: normalizedRating,
    });

    await transporter.sendMail({
      from: `"Nvelopes" <${GMAIL_USER}>`,
      to: NOTIFICATION_EMAIL,
      subject,
      html,
      text,
    });

    res.status(200).json({ success: true, message: "Feedback sent" });
  } catch (error) {
    console.error("Error sending Nvelopes feedback:", error);
    res.status(500).json({ success: false, error: "Failed to send feedback" });
  }
});

export default nvEmailRouter;
