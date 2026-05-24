import express from "express";
import { LANDING_HTML } from "./landing-template.js";
import dotenv from "dotenv";

// Load environment variables from .env or Render dashboard
dotenv.config({ path: ".env.local" });
dotenv.config();

// Fallback env vars for testing (will be overridden by actual env vars if set)
if (!process.env.SUPABASE_URL) {
  process.env.SUPABASE_URL = "https://feesmokjbrhgltguokpi.supabase.co";
}
if (!process.env.SUPABASE_ANON_KEY) {
  process.env.SUPABASE_ANON_KEY = "sb_publishable_q_v1PDLqx1fPQhecCKEipw_S0eDm5cI";
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
