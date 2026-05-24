/**
 * Stripe Checkout Session Creator
 * 
 * POST /api/stripe-checkout
 * 
 * Creates a Stripe Checkout session for tier purchase
 * Returns session ID for frontend redirect to Stripe
 */

import Stripe from "stripe";

// Tier pricing configuration (matches frontend)
const TIER_CONFIG = {
  'early_bird': {
    name: 'Early Bird',
    price: 1900, // cents ($19)
    reports: 5,
    description: '5 Amazon review analyses'
  },
  'pro': {
    name: 'Pro',
    price: 9900, // cents ($99)
    reports: 20,
    description: '20 Amazon review analyses'
  },
  'professional': {
    name: 'Professional',
    price: 19900, // cents ($199)
    reports: 50,
    description: '50 Amazon review analyses'
  }
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { tier, email, successUrl, cancelUrl } = req.body;

    // Validate inputs
    if (!tier || !email) {
      return res.status(400).json({
        error: "Missing required fields: tier, email"
      });
    }

    if (!TIER_CONFIG[tier]) {
      return res.status(400).json({
        error: "Invalid tier. Must be: early_bird, pro, or professional"
      });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: "Invalid email format"
      });
    }

    // Initialize Stripe
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY not set");
      return res.status(500).json({
        error: "Payment service not configured"
      });
    }

    const stripe = new Stripe(stripeKey);
    const tierData = TIER_CONFIG[tier];

    // Create Stripe product (or use existing)
    const product = await stripe.products.create({
      name: `ReviewIntel ${tierData.name}`,
      description: tierData.description,
      metadata: {
        tier,
        reports: tierData.reports.toString()
      }
    });

    // Create price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: tierData.price,
      currency: 'usd'
    });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1
        }
      ],
      mode: 'payment',
      customer_email: email,
      success_url: successUrl || `https://reviewintels.com?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `https://reviewintels.com`,
      metadata: {
        tier,
        email,
        reports: tierData.reports.toString()
      }
    });

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      tier,
      amount: tierData.price / 100,
      reports: tierData.reports
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({
      error: "Failed to create checkout session",
      details: error.message
    });
  }
}
