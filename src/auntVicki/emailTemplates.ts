// Email templates for Aunt Vicki

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface ReceiptData {
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  shippingAddress: string;
}

// Helper to format item name with variants
const formatItemName = (item: OrderItem): string => {
  let name = item.name;
  if (item.selectedSize || item.selectedColor) {
    const variants = [item.selectedSize, item.selectedColor]
      .filter(Boolean)
      .join(", ");
    name += ` (${variants})`;
  }
  return name;
};

export const customerReceiptTemplate = (data: ReceiptData) => ({
  subject: "💋 Your Aunt Vicki Order Confirmation!",
  html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - Aunt Vicki</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #1a1a1a;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%); border-radius: 12px; padding: 40px; border: 2px solid #ff6b6b;">
            
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #ff6b6b; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 2px;">
                    AUNT VICKI
                </h1>
            </div>

            <!-- Thank You -->
            <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
                Thanks for your order${data.customerName ? `, ${data.customerName}` : ""}! 💋
            </h2>
            
            <p style="color: #cccccc; line-height: 1.8; font-size: 16px; text-align: center; margin: 0 0 30px 0;">
                We're stoked you're repping Aunt Vicki! Your order is being packed up and will be shipped soon.
            </p>

            <!-- Order Details -->
            <div style="background-color: rgba(255, 107, 107, 0.1); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h3 style="color: #ff6b6b; margin: 0 0 15px 0; font-size: 18px; border-bottom: 1px solid #444; padding-bottom: 10px;">
                    Order Details
                </h3>
                ${data.items
                  .map(
                    (item) => `
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #333;">
                    <div style="color: #ffffff;">
                        <span style="font-weight: bold;">${formatItemName(item)}</span>
                        <span style="color: #888;"> × ${item.quantity}</span>
                    </div>
                    <div style="color: #4CAF50; font-weight: bold;">
                        $${(item.price * item.quantity).toFixed(2)}
                    </div>
                </div>
                `
                  )
                  .join("")}
                <div style="display: flex; justify-content: space-between; padding-top: 15px; margin-top: 10px;">
                    <span style="color: #ffffff; font-size: 18px; font-weight: bold;">TOTAL</span>
                    <span style="color: #4CAF50; font-size: 18px; font-weight: bold;">$${data.total.toFixed(2)}</span>
                </div>
            </div>

            <!-- Shipping Info -->
            <div style="background-color: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <h3 style="color: #ff69b4; margin: 0 0 10px 0; font-size: 16px;">
                    📦 Shipping To:
                </h3>
                <p style="color: #cccccc; margin: 0; line-height: 1.6;">
                    ${data.shippingAddress.replace(/\n/g, "<br>")}
                </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center; border-top: 1px solid #444; padding-top: 30px;">
                <p style="color: #888; font-size: 14px; margin: 0 0 10px 0;">
                    Questions? Hit us up at
                </p>
                <a href="mailto:mgmt@auntvicki.rocks" style="color: #ff6b6b; text-decoration: none; font-weight: bold;">
                    mgmt@auntvicki.rocks
                </a>
                <p style="color: #ff69b4; font-size: 16px; margin: 30px 0 0 0;">
                    XO XO XO XO XO XO! 💋 🤘<br>
                    <strong style="color: #ff6b6b;">— Aunt Vicki</strong>
                </p>
            </div>
        </div>
        
        <p style="color: #666; font-size: 12px; text-align: center; margin-top: 20px;">
            <a href="https://auntvicki.rocks" style="color: #ff6b6b;">auntvicki.rocks</a>
        </p>
    </div>
</body>
</html>
  `,
  text: `AUNT VICKI - Order Confirmation

Thanks for your order${data.customerName ? `, ${data.customerName}` : ""}!

We're stoked you're repping Aunt Vicki! Your order is being packed up and will be shipped soon.

ORDER DETAILS:
${data.items.map((item) => `${formatItemName(item)} × ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join("\n")}

TOTAL: $${data.total.toFixed(2)}

SHIPPING TO:
${data.shippingAddress}

Questions? Hit us up at mgmt@auntvicki.rocks

Rock on! 🤘
— Aunt Vicki

https://auntvicki.rocks
`,
});

