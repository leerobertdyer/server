import { Router } from "express";
import { transporter, GMAIL_USER } from "../nodemailer";
import { nvelopesFeedbackTemplate, inviteUserToUseBudgetTemplate } from "./emailTemplates";
import { admin } from "../edc/firebaseAdmin";

const nvelopesEmailRouter = Router();

const NOTIFICATION_EMAIL = "lee.dyer.dev@gmail.com";

async function isExistingNvelopesUser(email: string): Promise<boolean> {
  try {
    await admin.auth().getUserByEmail(email.trim().toLowerCase());
    return true;
  } catch {
    return false;
  }
}

nvelopesEmailRouter.post("/invite", async (req, res) => {
  const { toEmail, inviterEmail, budgetName } = req.body;

  if (!toEmail || typeof toEmail !== "string" || !toEmail.trim()) {
    return res.status(400).json({ success: false, error: "Recipient email is required" });
  }
  if (!inviterEmail || typeof inviterEmail !== "string" || !inviterEmail.trim()) {
    return res.status(400).json({ success: false, error: "Inviter email is required" });
  }

  const normalizedTo = toEmail.trim().toLowerCase();
  const inviter = inviterEmail.trim();
  const name = typeof budgetName === "string" && budgetName.trim() ? budgetName.trim() : "Budget";

  try {
    const isExistingUser = await isExistingNvelopesUser(normalizedTo);
    const templateData = {
      toEmail: normalizedTo,
      inviterEmail: inviter,
      budgetName: name,
      isExistingUser,
    };
    const { subject, html, text } = inviteUserToUseBudgetTemplate(templateData);

    await transporter.sendMail({
      from: `"Nvelopes" <${GMAIL_USER}>`,
      to: normalizedTo,
      subject,
      html,
      text,
    });

    res.status(200).json({ success: true, message: "Invite email sent" });
  } catch (error) {
    console.error("Error sending Nvelopes invite email:", error);
    res.status(500).json({ success: false, error: "Failed to send invite email" });
  }
});

nvelopesEmailRouter.post("/feedback", async (req, res) => {
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

export default nvelopesEmailRouter;
