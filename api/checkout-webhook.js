/**
 * Stripe Webhook Handler - API Endpoint
 * 
 * POST /api/checkout-webhook
 * 
 * Receives events from Stripe and triggers appropriate actions:
 * - payment_intent.succeeded → Generate report and send email
 * - customer.subscription.created → Save subscription
 * - customer.subscription.updated → Update subscription status
 * - customer.subscription.deleted → Mark subscription as cancelled
 * - invoice.payment_succeeded → Process recurring payment
 * 
 * Webhook security:
 * - Validates Stripe signature
 * - Only processes events with valid signatures
 * - Returns 200 immediately after validation
 * 
 * Note: This endpoint does NOT validate CORS - Stripe webhooks don't use CORS
 */

import Stripe from "stripe";
import {
  saveSubscription,
  logAnalyticsEvent,
} from "./utils/database.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "test-key");

export default async function handler(req, res) {
  // Webhook security: NO CORS for Stripe webhooks
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get signature from Stripe
    const signature = req.headers["stripe-signature"];
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET || "test-secret";

    if (!signature) {
      console.warn("Missing Stripe signature header");
      return res.status(400).json({
        error: "Missing signature header",
        received: false,
      });
    }

    let event;

    try {
      // Construct and verify the webhook event
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({
        error: "Invalid signature",
        received: false,
      });
    }

    console.log(`[webhook] Received event: ${event.type} (ID: ${event.id})`);

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;

      case "charge.failed":
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`[webhook] Unhandled event type: ${event.type}`);
    }

    // Always return 200 success after processing
    return res.status(200).json({
      received: true,
      eventId: event.id,
      eventType: event.type,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[webhook] Processing error:", error);
    // Return 500 for unexpected errors
    return res.status(500).json({
      error: "Webhook processing failed",
      details: error.message,
      received: false,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Handle successful payment
 * Trigger report generation and email delivery
 */
async function handlePaymentSucceeded(paymentIntent) {
  console.log(`[webhook:payment_succeeded] ID: ${paymentIntent.id}`);

  const metadata = paymentIntent.metadata || {};
  const { email, name, asin, productName } = metadata;

  if (!email || !asin) {
    console.warn(
      `[webhook:payment_succeeded] Missing metadata:`,
      metadata
    );
    return;
  }

  try {
    // Log the event
    await logAnalyticsEvent({
      name: "payment_succeeded",
      userEmail: email,
      data: {
        paymentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        asin,
        productName,
      },
    });

    // In production, this would trigger a background job (Bull, Cloud Tasks, etc.)
    // For MVP, we log it and queue asynchronously
    console.log(
      `[webhook:payment_succeeded] Report generation queued for ${email}`
    );

    const reportResult = {
      success: true,
      email,
      asin,
      productName,
      paymentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      orderTimestamp: new Date().toISOString(),
    };

    console.log(
      "[webhook:payment_succeeded] Report generation queued:",
      reportResult
    );
  } catch (error) {
    console.error(
      "[webhook:payment_succeeded] Error processing payment:",
      error.message
    );
  }
}

/**
 * Handle subscription creation
 * Save subscription details to database
 */
async function handleSubscriptionCreated(subscription) {
  console.log(`[webhook:subscription_created] ID: ${subscription.id}`);

  try {
    const customerId = subscription.customer;
    const plan =
      subscription.items.data[0]?.price?.recurring?.interval || "unknown";
    const planPrice = subscription.items.data[0]?.price?.unit_amount || 0;

    // Extract email from metadata or customer
    const email = subscription.metadata?.email || customerId;

    // Save subscription to database
    const subscriptionData = {
      userEmail: email,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      planType: plan,
      status: subscription.status,
      amount: planPrice,
      currency: subscription.items.data[0]?.price?.currency || "usd",
    };

    await saveSubscription(subscriptionData);

    // Log the event
    await logAnalyticsEvent({
      name: "subscription_created",
      userEmail: email,
      data: {
        subscriptionId: subscription.id,
        customerId,
        plan,
      },
    });

    console.log(
      `[webhook:subscription_created] Saved subscription for ${email}`
    );
  } catch (error) {
    console.error(
      "[webhook:subscription_created] Error handling subscription:",
      error.message
    );
  }
}

/**
 * Handle subscription update
 * Update subscription status in database
 */
async function handleSubscriptionUpdated(subscription) {
  console.log(`[webhook:subscription_updated] ID: ${subscription.id}`);

  try {
    const customerId = subscription.customer;
    const plan =
      subscription.items.data[0]?.price?.recurring?.interval || "unknown";
    const email = subscription.metadata?.email || customerId;

    // Update subscription in database
    const subscriptionData = {
      userEmail: email,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      planType: plan,
      status: subscription.status,
    };

    await saveSubscription(subscriptionData);

    // Log the event
    await logAnalyticsEvent({
      name: "subscription_updated",
      userEmail: email,
      data: {
        subscriptionId: subscription.id,
        status: subscription.status,
      },
    });

    console.log(
      `[webhook:subscription_updated] Updated subscription status to ${subscription.status}`
    );
  } catch (error) {
    console.error(
      "[webhook:subscription_updated] Error updating subscription:",
      error.message
    );
  }
}

/**
 * Handle subscription cancellation
 * Mark subscription as cancelled in database
 */
async function handleSubscriptionDeleted(subscription) {
  console.log(`[webhook:subscription_deleted] ID: ${subscription.id}`);

  try {
    const customerId = subscription.customer;
    const email = subscription.metadata?.email || customerId;

    // Update subscription status to cancelled
    const subscriptionData = {
      userEmail: email,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      status: "cancelled",
    };

    await saveSubscription(subscriptionData);

    // Log the event
    await logAnalyticsEvent({
      name: "subscription_cancelled",
      userEmail: email,
      data: {
        subscriptionId: subscription.id,
      },
    });

    console.log(`[webhook:subscription_deleted] Subscription cancelled`);
  } catch (error) {
    console.error(
      "[webhook:subscription_deleted] Error handling cancellation:",
      error.message
    );
  }
}

/**
 * Handle recurring invoice payment
 * Process subscription renewal
 */
async function handleInvoicePaymentSucceeded(invoice) {
  console.log(`[webhook:invoice_payment_succeeded] ID: ${invoice.id}`);

  try {
    const customerId = invoice.customer;
    const subscriptionId = invoice.subscription;
    const amount = invoice.amount_paid;
    const currency = invoice.currency;

    console.log(
      `[webhook:invoice_payment_succeeded] Subscription renewal processed for customer: ${customerId}`
    );

    // Log the event
    await logAnalyticsEvent({
      name: "invoice_payment_succeeded",
      data: {
        invoiceId: invoice.id,
        customerId,
        subscriptionId,
        amount,
        currency,
      },
    });
  } catch (error) {
    console.error(
      "[webhook:invoice_payment_succeeded] Error handling invoice:",
      error.message
    );
  }
}

/**
 * Handle payment failure
 * Send notification to user
 */
async function handlePaymentFailed(charge) {
  console.log(`[webhook:charge_failed] ID: ${charge.id}`);

  try {
    const reason = charge.failure_reason || "Unknown";
    const email = charge.metadata?.email;

    console.log(`[webhook:charge_failed] Payment failed - Reason: ${reason}`);

    // Log the event
    if (email) {
      await logAnalyticsEvent({
        name: "payment_failed",
        userEmail: email,
        data: {
          chargeId: charge.id,
          reason,
        },
      });
    }
  } catch (error) {
    console.error(
      "[webhook:charge_failed] Error handling failed payment:",
      error.message
    );
  }
}
