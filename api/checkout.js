import Stripe from "stripe";

let stripe = null;

function getStripe() {
  if (!stripe) {
    // Use env var if available
    const key = (process.env.STRIPE_SECRET_KEY || "").trim();
    
    if (!key) {
      console.warn("[CHECKOUT] Stripe key not configured - checkout will fail");
      return null;
    }
    
    try {
      stripe = new Stripe(key);
      console.log("[CHECKOUT] ✅ Stripe client initialized");
    } catch (error) {
      console.error("[CHECKOUT] Failed to initialize Stripe:", error.message);
      return null;
    }
  }
  return stripe;
}

console.log("[CHECKOUT] Stripe initialization deferred (lazy-loaded on first request)");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items, email, successUrl, cancelUrl } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Items array is required and cannot be empty" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Check if Stripe key is available
    const stripeClient = getStripe();
    if (!stripeClient) {
      console.log("[CHECKOUT] Returning demo checkout (Stripe key not set)");
      // Return a demo session for testing/development
      return res.status(200).json({
        success: true,
        mode: "demo",
        message: "This is a demo checkout. Configure STRIPE_SECRET_KEY environment variable for real payments.",
        sessionId: `demo_session_${Date.now()}`,
        demoUrl: "https://checkout.stripe.com/c/pay/demo",
        items,
        email,
        total,
        itemCount: items.length,
      });
    }

    // Create Stripe checkout session
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      customer_email: email,
      success_url:
        successUrl || `${process.env.APP_URL || "https://reviewintel.onrender.com"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        cancelUrl || `${process.env.APP_URL || "https://reviewintel.onrender.com"}/cancel`,
      metadata: {
        email,
        total,
      },
    });

    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url,
      total,
      itemCount: items.length,
    });
  } catch (error) {
    console.error("Checkout handler error:", error);
    res.status(500).json({
      error: "Failed to create checkout session",
      details: error.message,
    });
  }
}
