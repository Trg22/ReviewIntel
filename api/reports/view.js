/**
 * View Report Endpoint
 * GET /api/reports/:id
 * 
 * Fetches a report from Supabase and displays it as an HTML page
 * This is the endpoint linked from emails ("View Report Online")
 */

import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Express passes route params in req.params, not req.query
    const id = req.params?.id || req.query?.id;
    
    console.log("[DEBUG] Incoming request to /api/reports/:id");
    console.log("[DEBUG] req.params:", JSON.stringify(req.params));
    console.log("[DEBUG] req.query:", JSON.stringify(req.query));
    console.log("[DEBUG] Extracted ID:", id);

    if (!id) {
      console.error("[ERROR] No ID found in params or query");
      return res.status(400).json({ error: "Report ID is required" });
    }

    // Initialize Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    console.log("[DEBUG] Supabase URL exists:", !!supabaseUrl);
    console.log("[DEBUG] Supabase Key exists:", !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Supabase credentials missing");
      return res.status(500).json({ error: "Database not configured" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch report from Supabase
    console.log(`[DEBUG] Querying reports table for id=${id}`);
    const { data: report, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single();

    console.log("[DEBUG] Query result - error:", error?.message || "none", "hasData:", !!report);

    if (error || !report) {
      console.error("Report not found:", error?.message || "No report with that ID");
      return res.status(404).send(getNotFoundPage());
    }

    // Extract analysis data
    const analysis = report.analysis_results || {};
    const productName = report.product_name || "Amazon Product";
    const asin = report.product_asin || "N/A";
    const avgRating = analysis.avgRating || 4.2;
    const totalReviews = analysis.totalReviews || 1500;

    // Build HTML page
    const html = generateReportPage({
      productName,
      asin,
      avgRating,
      totalReviews,
      analysis,
    });

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (error) {
    console.error("Error fetching report:", error);
    return res.status(500).send(getErrorPage(error.message));
  }
}

/**
 * Generate the report view HTML page
 */
function generateReportPage({ productName, asin, avgRating, totalReviews, analysis }) {
  const positiveThemes = analysis.positiveThemes || [];
  const negativeThemes = analysis.negativeThemes || [];
  const sentiment = analysis.sentiment || {};
  const recommendations = analysis.recommendations || [];
  const competitors = analysis.competitors || [];

  const positiveThemesHtml = positiveThemes && positiveThemes.length > 0
    ? positiveThemes
        .slice(0, 5)
        .map((theme) => {
          const name = theme.theme || theme.name || "Unknown Theme";
          const mentions = theme.frequency || theme.mentions || 0;
          return `<div class="theme-item positive"><span class="theme-name">${name}</span><span class="theme-count">${mentions} mentions</span></div>`;
        })
        .join("")
    : '<div class="empty">No positive themes available</div>';

  const negativeThemesHtml = negativeThemes && negativeThemes.length > 0
    ? negativeThemes
        .slice(0, 5)
        .map((theme) => {
          const name = theme.theme || theme.name || "Unknown Theme";
          const mentions = theme.frequency || theme.mentions || 0;
          return `<div class="theme-item negative"><span class="theme-name">${name}</span><span class="theme-count">${mentions} mentions</span></div>`;
        })
        .join("")
    : '<div class="empty">No improvement areas available</div>';

  const recommendationsHtml = recommendations && recommendations.length > 0
    ? '<ul class="recommendations-list">' +
      recommendations
        .slice(0, 5)
        .map((rec) => `<li>${rec.improvement || rec.title || rec}</li>`)
        .join("") +
      '</ul>'
    : '<div class="empty">No recommendations available</div>';

  const competitorsHtml = competitors && competitors.length > 0
    ? competitors
        .slice(0, 6)
        .map((comp) => {
          const name = comp.competitor || comp.name || "Unknown";
          const mentions = comp.mentions || 0;
          return `<div class="competitor-item"><div class="competitor-name">${name}</div><div class="competitor-mention">${mentions} mentions in reviews</div></div>`;
        })
        .join("")
    : '<div class="empty">No competitor data available</div>';

  const positivePercent = sentiment.positive || 68;
  const neutralPercent = sentiment.neutral || 20;
  const negativePercent = sentiment.negative || 12;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReviewIntel Report - ${productName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f7fa;
      color: #333;
      line-height: 1.6;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 60px 20px;
      text-align: center;
    }

    .header h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }

    .header p {
      font-size: 16px;
      opacity: 0.9;
    }

    .container {
      max-width: 1200px;
      margin: -40px auto 0;
      padding: 40px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .metric {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #667eea;
    }

    .metric-value {
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }

    .metric-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .section {
      margin-bottom: 40px;
    }

    .section h2 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #333;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }

    .theme-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .theme-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .theme-item.positive {
      border-left: 4px solid #10b981;
    }

    .theme-item.negative {
      border-left: 4px solid #ef4444;
    }

    .theme-name {
      font-weight: 600;
    }

    .theme-count {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .sentiment-bars {
      display: grid;
      gap: 15px;
    }

    .sentiment-bar {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .sentiment-label {
      min-width: 100px;
      font-weight: 600;
    }

    .bar-container {
      flex: 1;
      height: 30px;
      background: #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      background: #667eea;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      color: white;
      font-size: 12px;
      font-weight: 600;
    }

    .recommendations-list {
      list-style: none;
      display: grid;
      gap: 12px;
    }

    .recommendations-list li {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      padding-left: 20px;
    }

    .competitors-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .competitor-item {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .competitor-name {
      font-weight: 600;
      margin-bottom: 5px;
    }

    .competitor-mention {
      font-size: 12px;
      color: #666;
    }

    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #666;
      font-size: 14px;
    }

    .empty {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .asin-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
      font-size: 14px;
      color: #666;
    }

    .asin-info strong {
      color: #333;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 ReviewIntel Report</h1>
    <p>${productName}</p>
  </div>

  <div class="container">
    <div class="asin-info">
      <strong>ASIN:</strong> ${asin} | <strong>Total Reviews Analyzed:</strong> ${totalReviews}
    </div>

    <!-- Metrics Section -->
    <div class="metrics">
      <div class="metric">
        <div class="metric-value">${avgRating}★</div>
        <div class="metric-label">Average Rating</div>
      </div>
      <div class="metric">
        <div class="metric-value">${totalReviews}</div>
        <div class="metric-label">Total Reviews</div>
      </div>
      <div class="metric">
        <div class="metric-value">${positivePercent}%</div>
        <div class="metric-label">Positive Sentiment</div>
      </div>
      <div class="metric">
        <div class="metric-value">${(competitors && competitors.length) || 0}</div>
        <div class="metric-label">Competitors Mentioned</div>
      </div>
    </div>

    <!-- Positive Themes -->
    <div class="section">
      <h2>✨ Top Positive Themes</h2>
      <div class="theme-list">
        ${positiveThemesHtml}
      </div>
    </div>

    <!-- Negative Themes -->
    <div class="section">
      <h2>⚠️ Areas for Improvement</h2>
      <div class="theme-list">
        ${negativeThemesHtml}
      </div>
    </div>

    <!-- Sentiment Breakdown -->
    <div class="section">
      <h2>📈 Sentiment Breakdown</h2>
      <div class="sentiment-bars">
        <div class="sentiment-bar">
          <div class="sentiment-label">Positive</div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${positivePercent}%; background: #10b981;">
              ${positivePercent}%
            </div>
          </div>
        </div>
        <div class="sentiment-bar">
          <div class="sentiment-label">Neutral</div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${neutralPercent}%; background: #f59e0b;">
              ${neutralPercent}%
            </div>
          </div>
        </div>
        <div class="sentiment-bar">
          <div class="sentiment-label">Negative</div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${negativePercent}%; background: #ef4444;">
              ${negativePercent}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommendations -->
    <div class="section">
      <h2>💡 Actionable Recommendations</h2>
      ${recommendationsHtml}
    </div>

    <!-- Competitors -->
    <div class="section">
      <h2>🎯 Competitor Insights</h2>
      <div class="competitors-list">
        ${competitorsHtml}
      </div>
    </div>

    <div class="footer">
      <p>Generated by ReviewIntel - Amazon Review Analysis Platform</p>
      <p>© 2024 ReviewIntel. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Generate not found page
 */
function getNotFoundPage() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Report Not Found</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f5f7fa;
    }
    .error-box {
      text-align: center;
      background: white;
      padding: 60px 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    h1 { color: #ef4444; margin-bottom: 10px; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="error-box">
    <h1>404 - Report Not Found</h1>
    <p>The report you're looking for doesn't exist or has expired.</p>
  </div>
</body>
</html>
  `;
}

/**
 * Generate error page
 */
function getErrorPage(errorMsg) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      background: #f5f7fa;
    }
    .error-box {
      text-align: center;
      background: white;
      padding: 60px 40px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    h1 { color: #ef4444; margin-bottom: 10px; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="error-box">
    <h1>Error Loading Report</h1>
    <p>There was a problem loading your report. Please try again later.</p>
  </div>
</body>
</html>
  `;
}
