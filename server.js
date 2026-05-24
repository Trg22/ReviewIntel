     1|import express from "express";
     2|import { LANDING_HTML } from "./landing-template.js";
     3|import dotenv from "dotenv";
     4|
     5|// Load environment variables from .env or Render dashboard
     6|dotenv.config({ path: ".env.local" });
     7|dotenv.config();
     8|
     9|// **CRITICAL FIX**: Render sometimes corrupts multiline env vars
    10|// Force set Supabase credentials to known-good values
    11|process.env.SUPABASE_URL = "https://feesmokjbrhgltguokpi.supabase.co";
    12|process.env.SUPABASE_ANON_KEY = "sb_publishable_q_v1PDLqx1fPQhecCKEipw_S0eDm5cI";
    13|
    14|// Trim Stripe key if set
    15|if (process.env.STRIPE_SECRET_KEY) {
    16|  process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY.trim();
    17|}
    18|
    19|console.log("[STARTUP] server.js loaded successfully");
    20|console.log("[STARTUP] PORT env:", process.env.PORT);
    21|console.log("[STARTUP] NODE_ENV:", process.env.NODE_ENV);
    22|console.log("[STARTUP] Environment Check:");
    23|console.log("  - STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? `✓ (${process.env.STRIPE_SECRET_KEY.slice(0, 20)}...)` : "✗ MISSING");
    24|console.log("  - SUPABASE_URL:", process.env.SUPABASE_URL ? `✓` : "✗ MISSING");
    25|console.log("  - SUPABASE_ANON_KEY:", process.env.SUPABASE_ANON_KEY ? `✓` : "✗ MISSING");
    26|console.log("  - BREVO_API_KEY:", process.env.BREVO_API_KEY ? `✓` : "✗ MISSING");
    27|console.log("  - CLAUDE_API_KEY:", process.env.CLAUDE_API_KEY ? `✓` : "✗ MISSING");
    28|console.log("  - APIFY_TOKEN:", process.env.APIFY_TOKEN ? `✓` : "✗ MISSING");
    29|
    30|const app = express();
    31|
    32|// Middleware
    33|app.use(express.json({ limit: "50mb" }));
    34|app.use(express.raw({ type: "application/octet-stream", limit: "50mb" }));
    35|
    36|// Serve static files from public directory
    37|app.use(express.static("public", {
    38|  extensions: ["html", "htm"],
    39|  index: "index.html"
    40|}));
    41|
    42|// CORS middleware
    43|app.use((req, res, next) => {
    44|  res.setHeader("Access-Control-Allow-Origin", "*");
    45|  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    46|  res.setHeader(
    47|    "Access-Control-Allow-Headers",
    48|    "Content-Type, Authorization, Stripe-Signature"
    49|  );
    50|  if (req.method === "OPTIONS") {
    51|    return res.status(200).end();
    52|  }
    53|  next();
    54|});
    55|
    56|// Health check endpoint
    57|app.get("/api/health", (req, res) => {
    58|  res.status(200).json({
    59|    status: "ok",
    60|    service: "ReviewIntel API",
    61|    timestamp: new Date().toISOString(),
    62|    environment: {
    63|      NODE_ENV: process.env.NODE_ENV,
    64|      STRIPE_KEY_SET: !!process.env.STRIPE_SECRET_KEY,
    65|      SUPABASE_URL_SET: !!process.env.SUPABASE_URL,
    66|      SUPABASE_KEY_SET: !!process.env.SUPABASE_ANON_KEY,
    67|    }
    68|  });
    69|});
    70|
    71|// Status endpoint - dynamic import for ES modules
    72|app.get("/api/status", async (req, res) => {
    73|  try {
    74|    const { default: statusHandler } = await import("./api/status.js");
    75|    return statusHandler(req, res);
    76|  } catch (error) {
    77|    console.error("Error loading status handler:", error);
    78|    res.status(500).json({ error: "Internal error", details: error.message });
    79|  }
    80|});
    81|
    82|// Dashboard endpoint
    83|app.get("/api/dashboard", async (req, res) => {
    84|  try {
    85|    const { default: dashboardHandler } = await import("./api/dashboard.js");
    86|    return dashboardHandler(req, res);
    87|  } catch (error) {
    88|    console.error("Error loading dashboard handler:", error);
    89|    res.status(500).json({ error: "Internal error", details: error.message });
    90|  }
    91|});
    92|
    93|// Reviews endpoint
    94|app.post("/api/reviews", async (req, res) => {
    95|  try {
    96|    const { default: reviewsHandler } = await import("./api/reviews.js");
    97|    return reviewsHandler(req, res);
    98|  } catch (error) {
    99|    console.error("Error loading reviews handler:", error);
   100|    res.status(500).json({ error: "Internal error", details: error.message });
   101|  }
   102|});
   103|
   104|app.get("/api/reviews", async (req, res) => {
   105|  try {
   106|    const { default: reviewsHandler } = await import("./api/reviews.js");
   107|    return reviewsHandler(req, res);
   108|  } catch (error) {
   109|    console.error("Error loading reviews handler:", error);
   110|    res.status(500).json({ error: "Internal error", details: error.message });
   111|  }
   112|});
   113|
   114|// Checkout endpoint
   115|app.post("/api/checkout", async (req, res) => {
   116|  try {
   117|    const { default: checkoutHandler } = await import("./api/checkout.js");
   118|    return checkoutHandler(req, res);
   119|  } catch (error) {
   120|    console.error("Error loading checkout handler:", error);
   121|    res.status(500).json({ error: "Internal error", details: error.message });
   122|  }
   123|});
   124|
   125|// Generate sample endpoint
   126|app.get("/api/generate-sample", async (req, res) => {
   127|  try {
   128|    const { default: generateSampleHandler } = await import(
   129|      "./api/generate-sample.js"
   130|    );
   131|    return generateSampleHandler(req, res);
   132|  } catch (error) {
   133|    console.error("Error loading generate-sample handler:", error);
   134|    res.status(500).json({ error: "Internal error", details: error.message });
   135|  }
   136|});
   137|
   138|app.post("/api/generate-sample", async (req, res) => {
   139|  try {
   140|    const { default: generateSampleHandler } = await import(
   141|      "./api/generate-sample.js"
   142|    );
   143|    return generateSampleHandler(req, res);
   144|  } catch (error) {
   145|    console.error("Error loading generate-sample handler:", error);
   146|    res.status(500).json({ error: "Internal error", details: error.message });
   147|  }
   148|});
   149|
   150|// Generate full paid report endpoint
   151|app.post("/api/generate-report", async (req, res) => {
   152|  try {
   153|    const { default: generateReportHandler } = await import(
   154|      "./api/generate-report.js"
   155|    );
   156|    return generateReportHandler(req, res);
   157|  } catch (error) {
   158|    console.error("Error loading generate-report handler:", error);
   159|    res.status(500).json({ error: "Internal error", details: error.message });
   160|  }
   161|});
   162|
   163|// Stripe checkout endpoint
   164|app.post("/api/stripe-checkout", async (req, res) => {
   165|  try {
   166|    const { default: stripeCheckoutHandler } = await import(
   167|      "./api/stripe-checkout.js"
   168|    );
   169|    return stripeCheckoutHandler(req, res);
   170|  } catch (error) {
   171|    console.error("Error loading stripe-checkout handler:", error);
   172|    res.status(500).json({ error: "Internal error", details: error.message });
   173|  }
   174|});
   175|
   176|
   177|// Report viewing endpoint
   178|app.get("/api/reports/:id", async (req, res) => {
   179|  try {
   180|    const { default: reportHandler } = await import(
   181|      "./api/reports/view.js"
   182|    );
   183|    return reportHandler(req, res);
   184|  } catch (error) {
   185|    console.error("Error loading report handler:", error);
   186|    res.status(500).send(`<html><body><h1>Error Loading Report</h1><p>${error.message}</p></body></html>`);
   187|  }
   188|});
   189|
   190|// Checkout webhook endpoint
   191|app.post("/api/checkout-webhook", async (req, res) => {
   192|  try {
   193|    const { default: webhookHandler } = await import(
   194|      "./api/checkout-webhook.js"
   195|    );
   196|    return webhookHandler(req, res);
   197|  } catch (error) {
   198|    console.error("Error loading webhook handler:", error);
   199|    res.status(500).json({ error: "Internal error", details: error.message });
   200|  }
   201|});
   202|
   203|// Health check endpoint for monitoring
   204|app.get("/health", (req, res) => {
   205|  res.json({ status: "ok" });
   206|});
   207|
   208|// Serve landing page for root
   209|app.get("/", (req, res) => {
   210|  res.setHeader("Content-Type", "text/html; charset=utf-8");
   211|  res.send(LANDING_HTML);
   212|});
   213|
   214|// 404 fallback
   215|app.use((req, res) => {
   216|  res.status(404).json({
   217|    error: "Not found",
   218|    path: req.path,
   219|    method: req.method,
   220|    availableEndpoints: [
   221|      "GET /api/status",
   222|      "GET /api/health",
   223|      "GET /api/dashboard?email=user@example.com",
   224|      "GET /api/reviews?productId=X&limit=10&offset=0",
   225|      "POST /api/reviews",
   226|      "GET /api/generate-sample?page=1&limit=10",
   227|      "POST /api/generate-sample",
   228|      "POST /api/generate-report",
   229|      "GET /api/reports/:id",
   230|      "POST /api/checkout",
   231|      "POST /api/checkout-webhook",
   232|    ],
   233|  });
   234|});
   235|
   236|// Global error handler for async errors
   237|app.use((err, req, res, next) => {
   238|  console.error("Express error handler caught:", err);
   239|  res.status(err.status || 500).json({
   240|    error: "Server error",
   241|    message: err.message,
   242|    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
   243|  });
   244|});
   245|
   246|// Catch unhandled promise rejections
   247|process.on("unhandledRejection", (reason, promise) => {
   248|  console.error("Unhandled Rejection at:", promise, "reason:", reason);
   249|});
   250|
   251|// Catch uncaught exceptions
   252|process.on("uncaughtException", (error) => {
   253|  console.error("Uncaught Exception:", error);
   254|  process.exit(1);
   255|});
   256|
   257|// Start server on all environments (required for Railway)
   258|const PORT = process.env.PORT || 3000;
   259|console.log("[STARTUP] Attempting to bind to port", PORT);
   260|
   261|const server = app.listen(PORT, "0.0.0.0", () => {
   262|  console.log(`[STARTUP] ReviewIntel server running on port ${PORT}`);
   263|  console.log(`[STARTUP] Server object ready:`, server.address());
   264|  console.log(`Available endpoints:`);
   265|  console.log(`  GET  /api/status`);
   266|  console.log(`  GET  /api/health`);
   267|  console.log(`  GET  /api/dashboard?email=user@example.com`);
   268|  console.log(`  GET  /api/reviews?productId=X&limit=10&offset=0`);
   269|  console.log(`  POST /api/reviews`);
   270|  console.log(`  GET  /api/generate-sample?page=1&limit=10`);
   271|  console.log(`  POST /api/generate-sample`);
   272|  console.log(`  POST /api/generate-report`);
   273|  console.log(`  POST /api/checkout`);
   274|  console.log(`  POST /api/checkout-webhook`);
   275|});
   276|
   277|// Server error handlers
   278|server.on("error", (error) => {
   279|  console.error("[ERROR] Server error:", error);
   280|  process.exit(1);
   281|});
   282|
   283|server.on("clientError", (error, socket) => {
   284|  console.error("[ERROR] Client error:", error);
   285|  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
   286|});
   287|
   288|export default app;
   289|
   290|// Checkout success page
   291|app.get("/api/checkout-success", async (req, res) => {
   292|  try {
   293|    const { default: successHandler } = await import(
   294|      "./api/checkout-success.js"
   295|    );
   296|    return successHandler(req, res);
   297|  } catch (error) {
   298|    console.error("Error loading checkout-success handler:", error);
   299|    res.status(500).json({ error: "Internal error", details: error.message });
   300|  }
   301|});
   302|