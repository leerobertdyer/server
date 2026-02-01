// Email templates for Nvelopes

export interface NvelopesFeedbackData {
  email: string;
  message: string;
  rating: number;
}

export const nvelopesFeedbackTemplate = (data: NvelopesFeedbackData) => ({
  subject: `Nvelopes Feedback – ${data.rating} star${data.rating === 1 ? "" : "s"} – ${data.email}`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nvelopes Feedback</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #1a1a1a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%); border-radius: 12px; padding: 40px; border: 2px solid #4CAF50;">
      <h1 style="color: #4CAF50; margin: 0 0 24px 0; font-size: 24px; text-align: center;">
        Nvelopes Feedback
      </h1>
      <p style="color: #cccccc; margin: 0 0 8px 0; font-size: 14px;">
        <strong style="color: #ffffff;">From:</strong>
        <a href="mailto:${data.email}" style="color: #4CAF50;">${data.email}</a>
      </p>
      <p style="color: #cccccc; margin: 0 0 20px 0; font-size: 14px;">
        <strong style="color: #ffffff;">Rating:</strong>
        <span style="color: #ffc107;">${"★".repeat(data.rating)}${"☆".repeat(5 - data.rating)}</span>
        (${data.rating}/5)
      </p>
      <div style="background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <h3 style="color: #4CAF50; margin: 0 0 10px 0; font-size: 16px;">Message</h3>
        <p style="color: #cccccc; margin: 0; line-height: 1.6; white-space: pre-wrap;">${(data.message || "(No message)").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      </div>
      <p style="color: #888; font-size: 12px; text-align: center; margin: 0;">
        Sent from Nvelopes feedback form
      </p>
    </div>
  </div>
</body>
</html>
  `,
  text: `Nvelopes Feedback

From: ${data.email}
Rating: ${data.rating}/5

Message:
${data.message || "(No message)"}

---
Sent from Nvelopes feedback form
`,
});
