import { Router } from "express";
import { stripe, FRONT_END } from "./config";

const edcStripeRouter = Router();

edcStripeRouter.post('/create-product', async (req, res) => {
    try {
        const { name, description, price } = req.body;

        // Create a product
        const product = await stripe.products.create({
            name,
            description,
        });

        // Create a price for the product
        const productPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(price * 100), // Price in cents
            currency: 'usd',
        });

        res.json({ stripeProductId: product.id, stripePriceId: productPrice.id });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

edcStripeRouter.put('/edit-product', async (req, res) => {
    try {
        const { stripeProductId, name, description, newPrice } = req.body;
        console.log("Edit-product called: ", { stripeProductId, name, description, newPrice });
        
        // Update the product
        const product = await stripe.products.update(stripeProductId, {
            name,
            description,
        });

        // Convert price to cents, handling decimals properly
        const priceInCents = Math.round(newPrice * 100);

        const newProductPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: priceInCents,
            currency: 'usd',
        });

        res.json({ stripeProductId: product.id, stripePriceId: newProductPrice.id });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

edcStripeRouter.post('/create-checkout-session', async (req, res) => {
    const { salesItems } = req.body;
    console.log("Sales Items: ", salesItems);

    if (!Array.isArray(salesItems) || salesItems.length === 0) {
        return res.status(400).json({ error: 'Invalid sale items' });
    }

    const session = await stripe.checkout.sessions.create({
        shipping_address_collection: {
            allowed_countries: ['US', 'CA'],
          },
          shipping_options: [
            { shipping_rate_data: {
                type: 'fixed_amount',
                fixed_amount: { amount: 999, currency: 'usd' }, // amount is in cents
                display_name: 'Flat Shipping & Handling Anywhere In US/Canada',
                delivery_estimate: { minimum: { unit: 'business_day', value: 5 }, maximum: { unit: 'business_day', value: 7 } }
              }
            }
          ],
        line_items: salesItems.map(item => ({
            price: item.stripePriceId,
            quantity: item.quantity
        })),
        mode: 'payment',
        success_url: `${FRONT_END}/cart/success?session={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONT_END}/cart`,
        automatic_tax: { enabled: true },
        metadata: {
            items: salesItems.map(item => item.title).join(','),
            saleTotal: salesItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toString()
        }
    });

    res.json({ sessionId: session.id });
});

edcStripeRouter.get('/checkout-session/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    if (!sessionId) {
        return res.status(400).json({ error: 'Invalid session ID' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json(session); 
});


export default edcStripeRouter;
