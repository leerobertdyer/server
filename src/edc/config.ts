import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const isDev = process.env.NODE_ENV !== 'production'; // true if not production

const STRIPE_SECRET = isDev
  ? process.env.STRIPE_TEST_SECRET_KEY
  : process.env.STRIPE_PROD_SECRET_KEY;

if (!STRIPE_SECRET) {
    console.error('Missing Stripe secret');
    process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET)

const FRONT_END = process.env.FRONT_END_URL

export { stripe, FRONT_END };