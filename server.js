import express from "express";
import { LANDING_HTML } from "./landing-template.js";
import dotenv from "dotenv";

// Load environment variables from .env or Render dashboard
dotenv.config({ path: ".env.local" });
dotenv.config();

// **CRITICAL FIX**: Render sometimes corrupts multiline env vars
// Force set Supabase credentials to known-good values
process.env.SUPABASE_URL = "https://feesmokjbrhgltguokpi.supabase.co";
process.env.SUPABASE_ANON_KEY = "sb_publishable_q_v1PDLqx1fPQhecCKEipw_S0eDm5cI";

// Trim Stripe key if set
if (process.env.STRIPE_SECRET_KEY) {
  process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY.trim();
}

console.log("[STARTUP] server.js loaded successfully");
console.log("[STARTUP] PORT env:", process.env.PORT);
console.log("[STARTUP] NODE_ENV:", process.env.NODE_ENV);
console.log("[STARTUP] Environment Check:");
console.log("  - STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? `✓ (${process.env.STRIPE_SECRET_KEY.slice(0, 20)}...)` : "✗ MISSING");
console.log("  - SUPABASE_URL:", process.env.SUPABASE_URL ? `✓` : "✗ MISSING");
console.log("  - SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? `✓` : "✗ MISSING");
console.log("  - BREVO_API_KEY:", process.env.BREVO_API_KEY ? `✓` : "✗ MISSING");
console.log("  - CLAUDE_API_KEY:", process.env.CLAUDE_API_KEY ? `✓` : "✗ MISSING");
console.log("  - APIFY_TOKEN:", process.env.APIFY_TOKEN ? `✓` : "✗ MISSING");

const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.raw({ type: "application/octet-stream", limit: "50mb" }));

// Serve static files from public directory
app.use(express.static("public", {
  extensions: ["html", "htm"],
  index: "index.html"
}));

// CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Stripe-Signature"
  );
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "ReviewIntel API",
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      STRIPE_KEY_SET: !!process.env.STRIPE_SECRET_KEY,
      SUPABASE_URL_SET: !!process.env.SUPABASE_URL,
      SUPABASE_KEY_SET: !!process.env.SUPABASE_ANON_KEY,
    }
  });
});

// Status endpoint - dynamic import for ES modules
app.get("/api/status", async (req, res) => {
  try {
    const { default: statusHandler } = await import("./api/status.js");
    return statusHandler(req, res);
  } catch (error) {
    console.error("Error loading status handler:", error);
    res.status(500).json({ error: "Internal error", details: error.message });
  }
});

// Dashboard endpoint
app.get("/api/dashboard", async (req, res) => {
  try {
    const { default: dashboardHandler } = await import("./api/dashboard.js");
    return dashboardHandler(req, res);
  } catch (error) {
    console.error("Error loading dashboard handler:", error);
    res.status(500).json({ error: "Internal error", details: error.message });
  }
});

// Reviews endpoint
app.post("/api/reviews", async (req, res) => {
  try {
    const { default: reviewsHandler } = await import("./api/reviews.js");
    return reviewsHandler(req, res);
  } catch (error) {
    console.error("Error loading reviews handler:", error);
    res.status(500).json({ error: "Internal error", details: error.message });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const { default: reviewsHandler } = await import("./api/reviews.js");
    return reviewsHandler(req, res);
  } catch (error) {
    console.error("Error loading reviews handler:", error);
    res.status(500).json({ error: "Internal error", details: error.message });
  }
});

// Checkout endpoint
app.post("/api/checkout", async (req, res) => {
  try {
    const { default: checkoutHandler } = await import("./api/checkout.js");
    return checkoutHandler(req, res);
  } catch (error) {
    console.error("Error loading checkout handler:", error);
    res.status(500).json({ error: "Internal error", details: error.message });
  }
});

// Generate sample endpoint
app.get("/api/generate-sample", async (req, res) => {
  try {
    const { default: generateSampleHandler } = await import(
      "./api/generate-sample.js"
    );
    return generateSampleHandler(req, res);
  } catch (error) {
    console.error("Error loading generate-sample handler:", error);
    res.status(500).json({ error: "Internal error", details: error.message });
  }
});

app.post("/api/generate-sample", async (req, res) => {
  try {
    const { default: generateSampleHandler } = await import(
      "./api/generate-sample.js"
    );
    return generateSampleHandler(req, res);
  } catch (error) {
    console.error("Error loading generate-sample handler:", error);
    res.status(500).json({ error: "Internal error", details: error.message });
  }
});

// Generate full paid report endpoint
app.post("/api/generate-report", async (req, res) => {
  try {
    const { default: generateReportHandler } = await import(
      "./api/generate-report.js"
    );
    return generateReportHandler(req, res);
  } catch (error) {
    console.error("Error loading generate-report handler:", error);
    res.status(500).json({ error: "Internal error", details: error.message });
  }
});

// Stripe checkout endpoint
app.post("/api/stripe-checkout", async (req, res) => {
  try {
    const { default: stripeCheckoutHandler } = await import(
      "./api/stripe-checkout.js"
    );
    return stripeCheckoutHandler(req, res);
  } catch (error) {
    console.error("Error loading stripe-checkout handler:", error);
    res.status(500).json({ error: "Internal error", details: error.message });
  }
});


// Report viewing endpoint
app.get("/api/reports/:id", async (req, res) => {
  try {
    const { default: reportHandler } = await import(
      "./api/reports/view.js"
    );
    return reportHandler(req, res);
  } catch (error) {
    console.error("Error loading report handler:", error);
    res.status(500).send(`<html><body><h1>Error Loading Report</h1><p>${error.message}</p></body></html>`);
  }
});

// Checkout webhook endpoint
app.post("/api/checkout-webhook", async (req, res) => {
  try {
    const { default: webhookHandler } = await import(
      "./api/checkout-webhook.js"
    );
    return webhookHandler(req, res);
  } catch (error) {
    console.error("Error loading webhook handler:", error);
    res.status(500).json({ error: "Internal error", details: error.message });
  }
});

// Health check endpoint for monitoring
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve landing page for root
app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(LANDING_HTML);
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
    method: req.method,
    availableEndpoints: [
      "GET /api/status",
      "GET /api/health",
      "GET /api/dashboard?email=user@example.com",
      "GET /api/reviews?productId=X&limit=10&offset=0",
      "POST /api/reviews",
      "GET /api/generate-sample?page=1&limit=10",
      "POST /api/generate-sample",
      "POST /api/generate-report",
      "GET /api/reports/:id",
      "POST /api/checkout",
      "POST /api/checkout-webhook",
    ],
  });
});

// Global error handler for async errors
app.use((err, req, res, next) => {
  console.error("Express error handler caught:", err);
  res.status(err.status || 500).json({
    error: "Server error",
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

// Catch unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Catch uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Start server on all environments (required for Railway)
const PORT = process.env.PORT || 3000;
console.log("[STARTUP] Attempting to bind to port", PORT);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`[STARTUP] ReviewIntel server running on port ${PORT}`);
  console.log(`[STARTUP] Server object ready:`, server.address());
  console.log(`Available endpoints:`);
  console.log(`  GET  /api/status`);
  console.log(`  GET  /api/health`);
  console.log(`  GET  /api/dashboard?email=user@example.com`);
  console.log(`  GET  /api/reviews?productId=X&limit=10&offset=0`);
  console.log(`  POST /api/reviews`);
  console.log(`  GET  /api/generate-sample?page=1&limit=10`);
  console.log(`  POST /api/generate-sample`);
  console.log(`  POST /api/generate-report`);
  console.log(`  POST /api/checkout`);
  console.log(`  POST /api/checkout-webhook`);
});

// Server error handlers
server.on("error", (error) => {
  console.error("[ERROR] Server error:", error);
  process.exit(1);
});

server.on("clientError", (error, socket) => {
  console.error("[ERROR] Client error:", error);
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

export default app;

// Checkout success page
app.get("/api/checkout-success", async (req, res) => {
  try {
    const { default: successHandler } = await import(
      "./api/checkout-success.js"
    );
    return successHandler(req, res);
  } catch (error) {
    console.error("Error loading checkout-success handler:", error);
    res.status(500).json({ error: "Internal error", details: error.message });
  }
});
