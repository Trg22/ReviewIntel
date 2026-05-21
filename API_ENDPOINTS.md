# ReviewIntel MVP - API Endpoints Documentation

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-project.vercel.app`

## Authentication
- MVP uses email-based identification (no auth yet)
- Future: JWT tokens recommended

---

## Endpoints

### 1. Generate Sample Report

**Endpoint**: `POST /api/generate-sample`

**Description**: Generate and send a free sample report to demonstrate platform capabilities

**Request Body**:
```json
{
  "email": "customer@example.com",
  "name": "John Doe"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Sample report generated and sent to your email",
  "email": "customer@example.com",
  "messageId": "mock-1716248450123"
}
```

**Response (Error)**:
```json
{
  "error": "Failed to generate sample report",
  "details": "Missing email or name"
}
```

**Status Codes**:
- `200` - Success
- `400` - Missing required fields
- `405` - Method not allowed
- `500` - Server error

**Rate Limiting**: 10 per hour per email address (recommended)

**Use Case**: Marketing lead capture, freemium model

---

### 2. Generate Full Report

**Endpoint**: `POST /api/generate-report`

**Description**: Generate a complete analysis report for a specific Amazon product

**Request Body**:
```json
{
  "email": "customer@example.com",
  "name": "Jane Smith",
  "asin": "B0EXAMPLE123",
  "productName": "Premium Wireless Headphones",
  "paymentId": "pi_1234567890abcdef"
}
```

**Request Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | ✅ | Customer email address |
| name | string | ✅ | Customer name for personalization |
| asin | string | ✅ | Amazon Standard Identification Number (10 char) |
| productName | string | ✅ | Product name for report header |
| paymentId | string | ✅ | Stripe payment intent ID |

**Response (Success)**:
```json
{
  "success": true,
  "message": "Report generated and sent successfully",
  "report": {
    "reportId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "customer@example.com",
    "asin": "B0EXAMPLE123",
    "productName": "Premium Wireless Headphones",
    "analysisTimestamp": "2024-05-20T14:30:45.000Z",
    "reviewsAnalyzed": 50
  }
}
```

**Response (Error)**:
```json
{
  "error": "Failed to generate report",
  "details": "Missing required fields: email, asin, productName"
}
```

**Status Codes**:
- `200` - Success
- `400` - Missing required fields
- `405` - Method not allowed
- `500` - Server error

**Processing Time**: 60-90 seconds (MVP: <2 seconds with mock data)

**Timeout**: 10 seconds on Vercel (recommended async queue for production)

**Trigger**: Typically called after Stripe webhook confirmation

---

### 3. Stripe Webhook Handler

**Endpoint**: `POST /api/checkout-webhook`

**Description**: Receive and process webhook events from Stripe

**Headers Required**:
```
stripe-signature: t=1234567890,v1=abc123...
```

**Webhook Events Handled**:

#### 3.1 payment_intent.succeeded
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "status": "succeeded",
      "metadata": {
        "email": "customer@example.com",
        "name": "Jane Smith",
        "asin": "B0EXAMPLE123",
        "productName": "Premium Wireless Headphones"
      }
    }
  }
}
```

**Action Taken**:
- Trigger `/api/generate-report` asynchronously
- Log payment success
- Save to database

#### 3.2 customer.subscription.created
```json
{
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_1234567890",
      "customer": "cus_1234567890",
      "status": "active",
      "items": {
        "data": [
          {
            "price": {
              "recurring": { "interval": "month" }
            }
          }
        ]
      }
    }
  }
}
```

**Action Taken**:
- Save subscription to database
- Email welcome message
- Grant access to features

#### 3.3 invoice.payment_succeeded
```json
{
  "type": "invoice.payment_succeeded",
  "data": {
    "object": {
      "id": "in_1234567890",
      "customer": "cus_1234567890"
    }
  }
}
```

**Action Taken**:
- Log recurring payment
- Update subscription status

#### 3.4 charge.failed
```json
{
  "type": "charge.failed",
  "data": {
    "object": {
      "id": "ch_1234567890",
      "failure_reason": "insufficient_funds"
    }
  }
}
```

**Action Taken**:
- Log failure
- Send retry notification
- Update subscription status

**Response (Success)**:
```json
{
  "received": true
}
```

**Response (Error)**:
```json
{
  "error": "Invalid signature"
}
```

**Status Codes**:
- `200` - Success (Stripe requires this to not retry)
- `400` - Invalid signature
- `405` - Method not allowed
- `500` - Processing error

**Important Notes**:
- Stripe will retry failed webhooks for 3 days
- Always return 200 even if processing fails (log error separately)
- Verify signature before processing
- Idempotent implementation recommended

---

### 4. Dashboard / Report History

**Endpoint**: `GET /api/dashboard`

**Description**: Retrieve user's report history and subscription information

**Query Parameters**:
```
GET /api/dashboard?email=customer@example.com
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| email | string | ✅ | User email address |

**Response (Success)**:
```json
{
  "success": true,
  "email": "customer@example.com",
  "reports": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_email": "customer@example.com",
      "product_asin": "B0EXAMPLE123",
      "product_name": "Premium Wireless Headphones",
      "analysis_results": {
        "positiveThemes": [
          { "theme": "Sound Quality", "frequency": 24, "confidence": 0.95 },
          { "theme": "Comfort", "frequency": 18, "confidence": 0.92 }
        ],
        "negativeThemes": [
          { "theme": "Battery Life", "frequency": 8, "confidence": 0.89 }
        ],
        "improvements": [
          { "improvement": "Extend battery life to 40+ hours", "impact": "high", "effort": "high" }
        ],
        "sentimentBreakdown": { "positive": 56, "neutral": 28, "negative": 16 },
        "averageRating": 4.2,
        "totalReviewsAnalyzed": 50
      },
      "pdf_url": "https://example.com/report.pdf",
      "created_at": "2024-05-20T14:30:45.000Z",
      "updated_at": "2024-05-20T14:30:45.000Z"
    }
  ],
  "subscription": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "user_email": "customer@example.com",
    "stripe_customer_id": "cus_1234567890",
    "stripe_subscription_id": "sub_1234567890",
    "plan_type": "monthly",
    "status": "active",
    "created_at": "2024-05-20T12:00:00.000Z",
    "updated_at": "2024-05-20T12:00:00.000Z"
  },
  "reportCount": 1,
  "hasActiveSubscription": true
}
```

**Response (No Reports)**:
```json
{
  "success": true,
  "email": "customer@example.com",
  "reports": [],
  "subscription": null,
  "reportCount": 0,
  "hasActiveSubscription": false
}
```

**Response (Error)**:
```json
{
  "error": "Failed to fetch dashboard data",
  "details": "Missing email parameter"
}
```

**Status Codes**:
- `200` - Success
- `400` - Missing email parameter
- `405` - Method not allowed
- `500` - Server error

**Use Case**: User dashboard display, report history

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error explanation"
}
```

### Common Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| Method not allowed | 405 | Wrong HTTP method | Use correct method (POST/GET) |
| Missing required fields | 400 | Incomplete request | Check all fields are provided |
| Invalid signature | 400 | Stripe webhook verification | Check webhook secret in Vercel |
| Database error | 500 | Supabase connection issue | Verify credentials and network |
| API key missing | 500 | Environment variable not set | Add key to Vercel environment |
| Rate limited | 429 | Too many requests | Implement exponential backoff |
| Timeout | 504 | Long-running operation | Use async queue in production |

---

## Request Examples

### Using curl

**Generate Sample Report**:
```bash
curl -X POST https://your-project.vercel.app/api/generate-sample \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User"
  }'
```

**Generate Full Report**:
```bash
curl -X POST https://your-project.vercel.app/api/generate-report \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "asin": "B0EXAMPLE123",
    "productName": "Test Product",
    "paymentId": "pi_test123"
  }'
```

**Get Dashboard**:
```bash
curl "https://your-project.vercel.app/api/dashboard?email=test@example.com"
```

### Using JavaScript (Fetch)

**Generate Sample**:
```javascript
const response = await fetch('/api/generate-sample', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    name: 'Test User'
  })
});

const data = await response.json();
if (data.success) {
  console.log('Report sent to:', data.email);
} else {
  console.error('Error:', data.error);
}
```

**Get Dashboard**:
```javascript
const email = 'test@example.com';
const response = await fetch(`/api/dashboard?email=${email}`);
const data = await response.json();

console.log(`Total reports: ${data.reportCount}`);
console.log(`Active subscription: ${data.hasActiveSubscription}`);
```

### Using Python (requests)

```python
import requests
import json

# Generate Sample Report
url = "https://your-project.vercel.app/api/generate-sample"
payload = {
    "email": "test@example.com",
    "name": "Test User"
}
response = requests.post(url, json=payload)
print(response.json())

# Get Dashboard
email = "test@example.com"
url = f"https://your-project.vercel.app/api/dashboard?email={email}"
response = requests.get(url)
print(response.json())
```

---

## Rate Limiting (Recommended for Production)

| Endpoint | Limit | Window |
|----------|-------|--------|
| /api/generate-sample | 10 | 1 hour |
| /api/generate-report | 100 | 1 day |
| /api/checkout-webhook | 1000 | 1 minute |
| /api/dashboard | 100 | 1 minute |

---

## Response Codes Cheatsheet

```
200 OK                 ✅ Request successful
201 Created           ✅ Resource created
204 No Content        ✅ Success, no content
400 Bad Request       ❌ Invalid input
401 Unauthorized      ❌ Authentication required
403 Forbidden         ❌ Access denied
404 Not Found         ❌ Resource not found
405 Method Not Allowed ❌ Wrong HTTP method
429 Too Many Requests ❌ Rate limit exceeded
500 Server Error      ❌ Internal error
502 Bad Gateway       ❌ Upstream error
503 Unavailable       ❌ Service down
504 Gateway Timeout   ❌ Took too long
```

---

## CORS Configuration

Current CORS settings (from code):
```javascript
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

For production, restrict to specific domains:
```javascript
Access-Control-Allow-Origin: https://yourdomain.com
```

---

## Authentication (Future)

Currently: Email-based (MVP)
Planned: JWT tokens

Expected JWT payload:
```json
{
  "sub": "user-email@example.com",
  "iat": 1234567890,
  "exp": 1234571490,
  "tier": "premium"
}
```

---

## Versioning

Current API Version: **v1** (MVP)

Future versions will support:
```
GET /api/v1/...
GET /api/v2/...
```

---

**Last Updated**: May 20, 2024
**Version**: 1.0.0
**Status**: MVP Ready
