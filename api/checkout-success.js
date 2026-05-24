/**
 * Checkout Success Page
 * 
 * GET /api/checkout-success
 * 
 * User is redirected here after successful Stripe payment
 */

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sessionId = req.query.session_id;
  const asin = req.query.asin;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful - ReviewIntel</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #3366cc 0%, #2952a3 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 60px 40px;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    }
    .checkmark {
      width: 80px;
      height: 80px;
      background: #22c55e;
      border-radius: 50%;
      margin: 0 auto 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
    }
    h1 {
      font-size: 32px;
      color: #333;
      margin-bottom: 15px;
    }
    p {
      color: #666;
      font-size: 16px;
      margin-bottom: 10px;
      line-height: 1.6;
    }
    .info-box {
      background: #f0f4ff;
      border-left: 4px solid #3366cc;
      padding: 20px;
      margin: 30px 0;
      text-align: left;
      border-radius: 4px;
    }
    .info-box strong {
      color: #3366cc;
      display: block;
      margin-bottom: 5px;
    }
    .cta-button {
      background: #3366cc;
      color: white;
      padding: 15px 40px;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 20px;
      text-decoration: none;
      display: inline-block;
      transition: background 0.3s;
    }
    .cta-button:hover {
      background: #2952a3;
    }
    .secondary-button {
      background: transparent;
      color: #3366cc;
      border: 2px solid #3366cc;
      margin-left: 10px;
    }
    .secondary-button:hover {
      background: #f0f4ff;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="checkmark">✓</div>
    <h1>Payment Successful! 🎉</h1>
    <p>Thank you for your purchase. Your report is being generated now.</p>
    
    <div class="info-box">
      <strong>What happens next:</strong>
      <p>We're analyzing the reviews for ASIN: <strong>${asin || 'N/A'}</strong></p>
      <p>Your report will be emailed to you within 2-5 minutes with a detailed analysis including:</p>
      <ul style="text-align: left; padding-left: 20px; margin-top: 10px;">
        <li>✓ Top positive & negative themes</li>
        <li>✓ Sentiment breakdown</li>
        <li>✓ Actionable recommendations</li>
        <li>✓ Competitive insights</li>
      </ul>
    </div>

    <p style="font-size: 14px; color: #999;">Session ID: ${sessionId || 'N/A'}</p>

    <div>
      <a href="https://reviewintels.com" class="cta-button">Back to ReviewIntel</a>
      <a href="mailto:support@reviewintels.com" class="cta-button secondary-button">Need Help?</a>
    </div>
  </div>

  <script>
    // Log success event
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'checkout_success',
        sessionId: '${sessionId}',
        asin: '${asin}'
      })
    }).catch(e => console.log('Log sent'));
  </script>
</body>
</html>
  `;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
