#!/usr/bin/env node

/**
 * ReviewIntel API Endpoints Test Suite
 * 
 * Tests all 4 main API endpoints locally
 * Run with: npm test or node tests/endpoint-test.js
 */

import axios from "axios";

const BASE_URL = "http://localhost:3000";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

let passCount = 0;
let failCount = 0;

/**
 * Test helpers
 */
function log(msg, color = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function section(title) {
  console.log(`\n${colors.blue}${"=".repeat(60)}`);
  console.log(`${title}`);
  console.log(`${"=".repeat(60)}${colors.reset}\n`);
}

function testPass(name, response) {
  passCount++;
  log(`✓ ${name}`, "green");
  if (response.data) {
    log(`  Status: ${response.status}`, "cyan");
    log(`  Response size: ${JSON.stringify(response.data).length} bytes`, "cyan");
  }
}

function testFail(name, error) {
  failCount++;
  log(`✗ ${name}`, "red");
  if (error.response) {
    log(`  Status: ${error.response.status}`, "yellow");
    log(`  Error: ${JSON.stringify(error.response.data)}`, "yellow");
  } else {
    log(`  Error: ${error.message}`, "yellow");
  }
}

/**
 * Test Suite
 */
async function runTests() {
  section("ReviewIntel API Endpoint Tests");

  // Test 1: Status endpoint
  section("1. Status Endpoint - GET /api/status");
  try {
    const response = await axios.get(`${BASE_URL}/api/status`);
    if (
      response.status === 200 &&
      response.data.status === "ok" &&
      response.data.service === "ReviewIntel API"
    ) {
      testPass("GET /api/status", response);
      log(
        `  Service: ${response.data.service} v${response.data.version}`,
        "cyan"
      );
      log(`  Supabase: ${response.data.supabaseConfigured ? "✓" : "✗"}`, "cyan");
      log(`  Stripe: ${response.data.stripeConfigured ? "✓" : "✗"}`, "cyan");
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    testFail("GET /api/status", error);
  }

  // Test 2: Health endpoint
  section("2. Health Endpoint - GET /api/health");
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    if (response.status === 200 && response.data.status === "ok") {
      testPass("GET /api/health", response);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    testFail("GET /api/health", error);
  }

  // Test 3: Dashboard endpoint
  section("3. Dashboard Endpoint - GET /api/dashboard");
  try {
    const response = await axios.get(
      `${BASE_URL}/api/dashboard?email=test@example.com`
    );
    if (
      response.status === 200 &&
      response.data.success &&
      response.data.email === "test@example.com"
    ) {
      testPass("GET /api/dashboard?email=test@example.com", response);
      log(`  Reports Count: ${response.data.reports.length}`, "cyan");
      log(
        `  Reviews Count: ${response.data.stats.reviewsCount}`,
        "cyan"
      );
      log(
        `  Avg Rating: ${response.data.stats.averageRating}`,
        "cyan"
      );
      log(
        `  Has Active Subscription: ${response.data.metadata.hasActiveSubscription}`,
        "cyan"
      );
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    testFail("GET /api/dashboard", error);
  }

  // Test 4: Dashboard validation - missing email
  section("4. Dashboard Validation - Missing Email Parameter");
  try {
    const response = await axios.get(`${BASE_URL}/api/dashboard`);
    testFail("Dashboard should require email", new Error("Expected 400"));
  } catch (error) {
    if (error.response?.status === 400) {
      testPass("Dashboard correctly rejects missing email", {
        status: 400,
        data: error.response.data,
      });
    } else {
      testFail("Dashboard validation", error);
    }
  }

  // Test 5: Generate Sample - GET (paginated reviews)
  section("5. Generate Sample - GET /api/generate-sample (Paginated)");
  try {
    const response = await axios.get(
      `${BASE_URL}/api/generate-sample?page=1&limit=5`
    );
    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data.length > 0
    ) {
      testPass(
        "GET /api/generate-sample?page=1&limit=5",
        response
      );
      log(`  Reviews returned: ${response.data.data.length}`, "cyan");
      log(
        `  Total reviews: ${response.data.pagination.totalCount}`,
        "cyan"
      );
      log(
        `  Total pages: ${response.data.pagination.totalPages}`,
        "cyan"
      );
      log(
        `  Has next page: ${response.data.pagination.hasNextPage}`,
        "cyan"
      );
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    testFail("GET /api/generate-sample", error);
  }

  // Test 6: Generate Sample - GET with filter
  section("6. Generate Sample - GET with ASIN Filter");
  try {
    const response = await axios.get(
      `${BASE_URL}/api/generate-sample?page=1&limit=10&asin=B0SAMPLE123`
    );
    if (response.status === 200 && response.data.success) {
      testPass(
        "GET /api/generate-sample with ASIN filter",
        response
      );
      log(`  Filtered results: ${response.data.data.length}`, "cyan");
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    testFail("GET /api/generate-sample with filter", error);
  }

  // Test 7: CORS Headers - OPTIONS request
  section("7. CORS Headers - OPTIONS Request");
  try {
    const response = await axios.options(`${BASE_URL}/api/status`);
    const corsOrigin = response.headers["access-control-allow-origin"];
    const corsMethods = response.headers["access-control-allow-methods"];

    if (corsOrigin === "*" && response.status === 200) {
      testPass("OPTIONS /api/status (CORS headers)", response);
      log(`  Access-Control-Allow-Origin: ${corsOrigin}`, "cyan");
      log(`  Access-Control-Allow-Methods: ${corsMethods}`, "cyan");
    } else {
      throw new Error("Missing CORS headers");
    }
  } catch (error) {
    testFail("CORS headers", error);
  }

  // Test 8: Webhook endpoint - signature validation
  section("8. Webhook Endpoint - Signature Validation");
  try {
    const response = await axios.post(
      `${BASE_URL}/api/checkout-webhook`,
      {},
      {
        headers: {
          "stripe-signature": "invalid-signature",
        },
        validateStatus: () => true, // Don't throw on any status
      }
    );

    if (response.status === 400 && response.data.error === "Invalid signature") {
      testPass("Webhook correctly validates signature", response);
    } else {
      testFail("Webhook signature validation", new Error("Unexpected response"));
    }
  } catch (error) {
    testFail("Webhook signature validation", error);
  }

  // Test 9: 404 handling
  section("9. 404 Handling - Non-existent Endpoint");
  try {
    const response = await axios.get(`${BASE_URL}/api/nonexistent`);
    testFail("Should return 404", new Error("Expected 404"));
  } catch (error) {
    if (error.response?.status === 404) {
      testPass(
        "Non-existent endpoint returns 404",
        { status: 404, data: error.response.data }
      );
    } else {
      testFail("404 handling", error);
    }
  }

  // Test 10: Method validation
  section("10. Method Validation - Wrong HTTP Method");
  try {
    const response = await axios.delete(`${BASE_URL}/api/status`);
    testFail("Should reject DELETE method", new Error("Expected 405"));
  } catch (error) {
    if (error.response?.status === 405) {
      testPass("Status endpoint correctly rejects DELETE", {
        status: 405,
        data: error.response.data,
      });
    } else {
      testFail("Method validation", error);
    }
  }

  // Summary
  section("Test Summary");
  const total = passCount + failCount;
  const percentage = ((passCount / total) * 100).toFixed(1);

  log(`Total Tests: ${total}`, "blue");
  log(`Passed: ${passCount}`, "green");
  log(`Failed: ${failCount}`, failCount > 0 ? "red" : "green");
  log(`Success Rate: ${percentage}%`, percentage >= 90 ? "green" : "red");

  if (failCount > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  log(`\nFatal error: ${error.message}`, "red");
  process.exit(1);
});
