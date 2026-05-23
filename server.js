import express from "express";
import { LANDING_HTML } from "./landing-template.js";

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
      "GET /api/generate-sample?page=1&limit=10",
      "POST /api/generate-sample",
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
app.listen(PORT, "0.0.0.0", () => {
  console.log(`ReviewIntel server running on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  /api/status`);
  console.log(`  GET  /api/health`);
  console.log(`  GET  /api/dashboard?email=user@example.com`);
  console.log(`  GET  /api/generate-sample?page=1&limit=10`);
  console.log(`  POST /api/generate-sample`);
  console.log(`  POST /api/checkout-webhook`);
});

export default app;
