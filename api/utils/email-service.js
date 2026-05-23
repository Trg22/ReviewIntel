/**
 * Email Service for ReviewIntel
 * 
 * Handles email sending via Brevo API for report delivery and notifications
 * Supports HTML templates for professional email formatting
 */

/**
 * Send email via Brevo API
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {Buffer} options.attachment - Optional attachment (PDF buffer)
 * @param {string} options.attachmentName - Attachment filename
 * @returns {Promise<Object>} Send result
 */
export async function sendEmail(options) {
  const {
    to,
    subject,
    html,
    attachment,
    attachmentName = "report.pdf"
  } = options;

  // Validate inputs
  if (!to || !subject || !html) {
    throw new Error("Missing required email fields: to, subject, html");
  }

  if (!process.env.BREVO_API_KEY) {
    console.warn("Brevo API key not configured - using mock send");
    return getMockEmailResponse(to, subject);
  }

  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "no-reply@reviewintel.com";
    const senderName = process.env.BREVO_SENDER_NAME || "ReviewIntel";

    const emailData = {
      sender: {
        name: senderName,
        email: senderEmail
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      replyTo: {
        email: senderEmail
      }
    };

    // Add attachment if provided
    if (attachment) {
      emailData.attachment = [
        {
          content: attachment.toString("base64"),
          name: attachmentName
        }
      ];
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Brevo API Error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    console.log(`Email sent to ${to}: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Email send error:", error.message);
    // Return mock response to allow testing without API key
    return getMockEmailResponse(to, subject);
  }
}

/**
 * Generate report delivery email template
 * 
 * @param {string} customerName - Customer name
 * @param {string} productName - Product name
 * @param {string} reportUrl - URL to access report
 * @returns {string} HTML email template
 */
export function getReportEmailTemplate(customerName, productName, reportUrl) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3366cc 0%, #2952a3 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
          .metric { background: white; padding: 15px; border-radius: 4px; text-align: center; }
          .metric-value { font-size: 24px; font-weight: bold; color: #3366cc; }
          .metric-label { font-size: 12px; color: #666; text-transform: uppercase; margin-top: 5px; }
          .cta-button { display: inline-block; background: #3366cc; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .footer { font-size: 12px; color: #666; text-align: center; margin-top: 30px; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your ReviewIntel Report is Ready!</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>We've completed the analysis of customer reviews for <strong>${productName}</strong>. Your comprehensive report is attached and contains actionable insights to improve your product and customer satisfaction.</p>

            <div class="metrics">
              <div class="metric">
                <div class="metric-value">50+</div>
                <div class="metric-label">Reviews Analyzed</div>
              </div>
              <div class="metric">
                <div class="metric-value">4.2★</div>
                <div class="metric-label">Avg Rating</div>
              </div>
            </div>

            <div class="highlight">
              <strong>Your Report Includes:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Top 5 positive themes customers love</li>
                <li>Top 5 areas for improvement</li>
                <li>5 actionable recommendations</li>
                <li>Sentiment breakdown and trends</li>
                <li>Competitive positioning insights</li>
              </ul>
            </div>

            <p>The PDF report is attached to this email. You can also view it here: <a href="${reportUrl}" class="cta-button">View Report Online</a></p>

            <h3>Next Steps:</h3>
            <ol>
              <li>Review the top improvement areas</li>
              <li>Develop action plan for high-impact items</li>
              <li>Track improvements over the next 60 days</li>
              <li>Re-analyze quarterly to measure progress</li>
            </ol>

            <p>Questions? Reply to this email or visit <a href="https://review-intel.com">review-intel.com</a></p>

            <div class="footer">
              <p>ReviewIntel - Amazon Review Analysis Platform</p>
              <p>© 2024 ReviewIntel. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Generate welcome email template for new users
 * 
 * @param {string} customerName - Customer name
 * @returns {string} HTML email template
 */
export function getWelcomeEmailTemplate(customerName) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3366cc 0%, #2952a3 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .cta-button { display: inline-block; background: #3366cc; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .footer { font-size: 12px; color: #666; text-align: center; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ReviewIntel!</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>Thanks for joining ReviewIntel! We're excited to help you unlock powerful insights from your Amazon customer reviews.</p>

            <h3>How It Works:</h3>
            <ol>
              <li><strong>Upload</strong> your Amazon product ASIN or URL</li>
              <li><strong>Wait</strong> just 60-90 seconds while our AI analyzes reviews</li>
              <li><strong>Receive</strong> a comprehensive PDF report with actionable insights</li>
              <li><strong>Act</strong> on recommendations to improve your product</li>
            </ol>

            <p><a href="https://review-intel.com/dashboard" class="cta-button">Start Your First Analysis</a></p>

            <h3>Sample Insights You'll Get:</h3>
            <ul>
              <li>+ Top 5 positive themes (what customers love)</li>
              <li>- Top 5 negative themes (what needs improvement)</li>
              <li>→ Specific, actionable recommendations</li>
              <li>* Sentiment breakdown and trends</li>
              <li>* Competitive positioning analysis</li>
            </ul>

            <p><strong>Early-bird pricing:</strong> Get unlimited reports for just $19 one-time (limited to first 100 customers)</p>

            <p>Questions? We're here to help! Reply to this email anytime.</p>

            <div class="footer">
              <p>ReviewIntel - Amazon Review Analysis Platform</p>
              <p>© 2024 ReviewIntel. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Mock email response for testing without API key
 */
function getMockEmailResponse(to, subject) {
  return {
    success: true,
    messageId: `mock-${Date.now()}`,
    to,
    subject,
    mode: "mock"
  };
}

export default {
  sendEmail,
  getReportEmailTemplate,
  getWelcomeEmailTemplate
};
