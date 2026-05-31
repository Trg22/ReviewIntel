// Render Force-Rebuild v2
import express from "express";
import { LANDING_HTML } from "./landing-template.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

// Set known-good Supabase credentials
process.env.SUPABASE_URL = "https://feesmokjbrhgltguokpi.supabase.co";
process.env.SUPABASE_ANON_KEY = "sb_publishable_q_v1PDLqx1fPQhecCKEipw_S0eDm5cI";

// Stripe key loaded from env

console.log("[STARTUP] ReviewIntel server loading...");
console.log("[STARTUP] PORT:", process.env.PORT);
console.log("[STARTUP] SUPABASE_URL:", process.env.SUPABASE_URL ? "✓" : "✗");
console.log("[STARTUP] STRIPE_KEY:", process.env.STRIPE_SECRET_KEY ? "✓" : "✗");

const app = express();

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.static("public", { extensions: ["html", "htm"], index: "index.html" }));

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Stripe-Signature");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "ReviewIntel API", timestamp: new Date().toISOString() });
});

app.get("/api/status", async (req, res) => {
  try {
    const { default: handler } = await import("./api/status.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const { default: handler } = await import("./api/dashboard.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const { default: handler } = await import("./api/reviews.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/reviews", async (req, res) => {
  try {
    const { default: handler } = await import("./api/reviews.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/checkout", async (req, res) => {
  try {
    const { default: handler } = await import("./api/checkout.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/generate-sample", async (req, res) => {
  try {
    const { default: handler } = await import("./api/generate-sample.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-sample", async (req, res) => {
  try {
    const { default: handler } = await import("./api/generate-sample.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-report", async (req, res) => {
  try {
    const { default: handler } = await import("./api/generate-report.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/stripe-checkout", async (req, res) => {
  try {
    const { default: handler } = await import("./api/stripe-checkout.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/reports/:id", async (req, res) => {
  try {
    const { default: handler } = await import("./api/reports/view.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).send(`<html><body><h1>Error</h1><p>${error.message}</p></body></html>`);
  }
});

app.post("/api/checkout-webhook", async (req, res) => {
  try {
    const { default: handler } = await import("./api/checkout-webhook.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/test-apify", async (req, res) => {
  try {
    const { default: handler } = await import("./api/test-apify.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/test-report-direct", async (req, res) => {
  try {
    const { default: handler } = await import("./api/test-report-direct.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(LANDING_HTML);
});

app.use((req, res) => res.status(404).json({ error: "Not found", path: req.path }));

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ error: err.message });
});

process.on("unhandledRejection", (reason) => console.error("Unhandled Rejection:", reason));
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`[STARTUP] ReviewIntel running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
  process.exit(1);
});

export default app;

app.get("/api/checkout-success", async (req, res) => {
  try {
    const { default: handler } = await import("./api/checkout-success.js");
    return handler(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
