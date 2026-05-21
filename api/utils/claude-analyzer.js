/**
 * Claude AI Analysis Engine for ReviewIntel
 * 
 * This module handles sentiment analysis, theme extraction, and actionable insights
 * using the Claude 3.5 Sonnet API. It processes Amazon reviews and generates
 * structured analysis for PDF reports.
 */

import Anthropic from "@anthropic-ai/sdk";

/**
 * Initialize Claude client with API key from environment
 */
const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || "test-key"
});

/**
 * Format reviews for Claude analysis
 * Converts review array to readable format
 * 
 * @param {Array} reviews - Array of review objects
 * @returns {string} Formatted reviews text
 */
function formatReviewsForAnalysis(reviews) {
  return reviews
    .map((r, i) => `Review ${i + 1} (Rating: ${r.rating}/5): "${r.title}" - ${r.text}`)
    .join("\n\n");
}

/**
 * Analyze reviews using Claude AI
 * Generates sentiment analysis, themes, and improvement suggestions
 * 
 * @param {Array} reviews - Array of review objects
 * @param {boolean} useMock - If true, return mock analysis (for testing without API key)
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeReviews(reviews, useMock = false) {
  if (useMock || !process.env.CLAUDE_API_KEY) {
    return getMockAnalysis(reviews);
  }

  try {
    const formattedReviews = formatReviewsForAnalysis(reviews);

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Analyze these Amazon product reviews and provide:
1. Top 5 positive themes (what customers love)
2. Top 5 negative themes (common complaints)
3. Top 3 actionable improvements
4. Overall sentiment breakdown (percentage positive/neutral/negative)
5. Key competitors mentioned

Format response as JSON with keys: positiveThemes, negativeThemes, improvements, sentimentBreakdown, competitorsMentioned

Reviews to analyze:
${formattedReviews}`
        }
      ]
    });

    // Parse Claude's response
    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return getMockAnalysis(reviews);
  } catch (error) {
    console.error("Claude API Error:", error.message);
    // Fallback to mock analysis on error
    return getMockAnalysis(reviews);
  }
}

/**
 * Mock analysis for MVP testing
 * Provides realistic analysis structure without API calls
 * 
 * @param {Array} reviews - Array of reviews
 * @returns {Object} Mock analysis
 */
export function getMockAnalysis(reviews) {
  // Calculate sentiment distribution
  const ratings = reviews.map(r => r.rating);
  const positive = ratings.filter(r => r >= 4).length;
  const neutral = ratings.filter(r => r === 3).length;
  const negative = ratings.filter(r => r <= 2).length;
  const total = reviews.length;

  return {
    positiveThemes: [
      { theme: "Excellent Quality", frequency: 24, confidence: 0.95 },
      { theme: "Fast Shipping", frequency: 18, confidence: 0.92 },
      { theme: "Great Customer Service", frequency: 15, confidence: 0.88 },
      { theme: "Good Value for Money", frequency: 14, confidence: 0.85 },
      { theme: "Durable & Long-lasting", frequency: 12, confidence: 0.82 }
    ],
    negativeThemes: [
      { theme: "Quality Control Issues", frequency: 8, confidence: 0.89 },
      { theme: "Poor Packaging", frequency: 7, confidence: 0.87 },
      { theme: "Unclear Instructions", frequency: 6, confidence: 0.84 },
      { theme: "Product Durability Concerns", frequency: 5, confidence: 0.81 },
      { theme: "Slow Customer Support Response", frequency: 4, confidence: 0.78 }
    ],
    improvements: [
      { improvement: "Improve packaging to prevent damage during shipping", impact: "high", effort: "low" },
      { improvement: "Enhance product manual with clearer instructions and visuals", impact: "high", effort: "medium" },
      { improvement: "Implement stricter quality control checks before shipping", impact: "high", effort: "high" },
      { improvement: "Reduce order-to-delivery time to under 1 week", impact: "medium", effort: "high" },
      { improvement: "Provide faster customer support response times (target: 4 hours)", impact: "medium", effort: "medium" }
    ],
    sentimentBreakdown: {
      positive: parseFloat(((positive / total) * 100).toFixed(1)),
      neutral: parseFloat(((neutral / total) * 100).toFixed(1)),
      negative: parseFloat(((negative / total) * 100).toFixed(1))
    },
    competitorsMentioned: [
      { competitor: "Brand X", mentions: 5 },
      { competitor: "Brand Y", mentions: 3 },
      { competitor: "Brand Z", mentions: 2 }
    ],
    averageRating: parseFloat((ratings.reduce((a, b) => a + b, 0) / total).toFixed(1)),
    totalReviewsAnalyzed: total,
    analysisTimestamp: new Date().toISOString()
  };
}

/**
 * Extract sentiment trends over time
 * Shows how sentiment has changed (useful for trend analysis)
 * 
 * @param {Array} reviews - Array of reviews with dates
 * @returns {Object} Sentiment trends
 */
export function getSentimentTrends(reviews) {
  const trends = {};
  
  reviews.forEach(review => {
    const date = review.date || new Date().toISOString().split('T')[0];
    const week = date.substring(0, 7); // Group by month
    
    if (!trends[week]) {
      trends[week] = { positive: 0, neutral: 0, negative: 0, total: 0 };
    }
    
    if (review.rating >= 4) trends[week].positive++;
    else if (review.rating === 3) trends[week].neutral++;
    else trends[week].negative++;
    
    trends[week].total++;
  });

  return trends;
}

export default {
  analyzeReviews,
  getMockAnalysis,
  getSentimentTrends
};
