// Email templates for Erin Dawn Campbell

const BACKEND_URL = process.env.BACKEND_URL || "https://api.leedyer.com";
type EmailTemplate = (
  firstName: any,
  email: any
) => {
  subject: string;
  html: string;
  text: string;
};

export const welcomeEmailTemplate: EmailTemplate = (firstName, email) => ({
  subject: "Welcome to Erin Dawn Campbell's Mailing List!",
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome!</title>
</head>
<body style="font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #faf8f5;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h1 style="color: #6b5b7a; margin: 0 0 20px 0; font-size: 28px; font-weight: normal;">
                Welcome${firstName ? `, ${firstName}` : ""}!
            </h1>
            <p style="color: #4a4a4a; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0;">
                Thank you for joining my mailing list! I'm so excited to share my handmade creations with you.
            </p>
            <p style="color: #4a4a4a; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0;">
                You'll be the first to know about new collections, special pieces, and exclusive updates from my studio.
            </p>
            <p style="color: #4a4a4a; line-height: 1.8; font-size: 16px; margin: 0 0 30px 0;">
                Each piece I create is made with love and care, designed to be unique and special just for you.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://erindawncampbell.com/shop" 
                   style="display: inline-block; background-color: #6b5b7a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px;">
                    Browse the Shop
                </a>
            </div>
            <p style="color: #888; font-size: 14px; margin-top: 40px; text-align: center;">
                xoxo,<br>
                <strong style="color: #6b5b7a;">Erin Dawn Campbell</strong>
            </p>
        </div>
        <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 20px;">
            You received this email because you signed up at erindawncampbell.com
        </p>
        <p style="text-align: center; margin-top: 10px;">
            <a href="${BACKEND_URL}/unsubscribe?email=${encodeURIComponent(
    email
  )}" 
               style="color: #999; font-size: 12px; text-decoration: underline;">
                Unsubscribe
            </a>
        </p>
    </div>
</body>
</html>
    `,
  text: `Welcome${firstName ? `, ${firstName}` : ""}!

Thank you for joining my mailing list! I'm so excited to share my handmade creations with you.

You'll be the first to know about new collections, special pieces, and exclusive updates from my studio.

Each piece I create is made with love and care, designed to be unique and special just for you.

Visit the shop: https://erindawncampbell.com/shop

With love,
Erin Dawn Campbell

---
Unsubscribe: ${BACKEND_URL}/unsubscribe?email=${encodeURIComponent(email)}`,
});

type NewSeriesEmailTemplate = ({
  featureName,
  featurePhoto1,
  featurePhoto2,
  featurePhoto3,
  recipientName,
  recipientEmail,
}: {
  featureName: any;
  featurePhoto1: any;
  featurePhoto2: any;
  featurePhoto3: any;
  recipientName: any;
  recipientEmail: any;
}) => {
  subject: string;
  html: string;
  text: string;
};

export const newSeriesEmailTemplate: NewSeriesEmailTemplate = ({
  featureName,
  featurePhoto1,
  featurePhoto2,
  featurePhoto3,
  recipientName,
  recipientEmail,
}) => ({
  subject: `New Collection: ${featureName}`,
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Collection: ${featureName}</title>
</head>
<body style="font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #faf8f5;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <h1 style="color: #6b5b7a; margin: 0 0 20px 0; font-size: 28px; font-weight: normal; text-align: center;">
                ✨ New Collection ✨
            </h1>
            <h2 style="color: #4a4a4a; margin: 0 0 30px 0; font-size: 24px; font-weight: normal; text-align: center;">
                ${featureName}
            </h2>
            ${
              recipientName
                ? `<p style="color: #4a4a4a; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0;">Hi ${recipientName},</p>`
                : ""
            }
            <p style="color: #4a4a4a; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0;">
                I'm thrilled to share my latest collection with you! Each piece has been lovingly handcrafted in my studio.
            </p>
            <div style="margin: 30px 0;">
                ${
                  featurePhoto1
                    ? `<img src="${featurePhoto1}" alt="Featured piece" style="width: 100%; max-width: 500px; border-radius: 8px; margin-bottom: 15px; display: block;">`
                    : ""
                }
                ${
                  featurePhoto2
                    ? `<img src="${featurePhoto2}" alt="Featured piece" style="width: 100%; max-width: 500px; border-radius: 8px; margin-bottom: 15px; display: block;">`
                    : ""
                }
                ${
                  featurePhoto3
                    ? `<img src="${featurePhoto3}" alt="Featured piece" style="width: 100%; max-width: 500px; border-radius: 8px; margin-bottom: 15px; display: block;">`
                    : ""
                }
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://erindawncampbell.com/shop" 
                   style="display: inline-block; background-color: #6b5b7a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px;">
                    Shop the Collection
                </a>
            </div>
            <p style="color: #888; font-size: 14px; margin-top: 40px; text-align: center;">
                With love,<br>
                <strong style="color: #6b5b7a;">Erin Dawn Campbell</strong>
            </p>
        </div>
        <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 20px;">
            You received this email because you signed up at erindawncampbell.com
        </p>
        <p style="text-align: center; margin-top: 10px;">
            <a href="${BACKEND_URL}/unsubscribe?email=${encodeURIComponent(
    recipientEmail
  )}" 
               style="color: #999; font-size: 12px; text-decoration: underline;">
                Unsubscribe
            </a>
        </p>
    </div>
</body>
</html>
    `,
  text: `New Collection: ${featureName}

${recipientName ? `Hi ${recipientName},` : ""}

I'm thrilled to share my latest collection with you! Each piece has been lovingly handcrafted in my studio.

Visit the shop to see the new pieces: https://erindawncampbell.com/shop

With love,
Erin Dawn Campbell

---
Unsubscribe: ${BACKEND_URL}/unsubscribe?email=${encodeURIComponent(
    recipientEmail
  )}`,
});
