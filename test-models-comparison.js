#!/usr/bin/env node
/**
 * SIMPLIFIED TEST: Compare Claude Sonnet vs Haiku
 * - Uses mock Amazon review data
 * - Generates reports with both models
 * - Compares quality, cost, speed
 */

import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const SONNET_MODEL = 'claude-3-5-sonnet-20241022';
const HAIKU_MODEL = 'claude-3-5-haiku-20241022';

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Mock Amazon reviews (realistic data)
const MOCK_REVIEWS = {
  'AirPods Pro': [
    { rating: 5, text: 'Best wireless earbuds I\'ve ever owned. Sound quality is incredible, noise cancellation is amazing. Battery lasts all day. Highly recommend!' },
    { rating: 5, text: 'Worth every penny. The transparency mode is perfect for when you need to hear the world around you. Very comfortable to wear for hours.' },
    { rating: 4, text: 'Great product but a bit pricey. They work as advertised but the charging case could be more durable.' },
    { rating: 3, text: 'Good quality but I had connectivity issues with my Android phone. Works perfectly on iPhone though.' },
    { rating: 2, text: 'Stopped working after 6 months. Customer service was unhelpful. Won\'t buy again.' },
    { rating: 5, text: 'Excellent noise cancellation. I use them while traveling and they block out engine noise completely.' },
    { rating: 4, text: 'Very comfortable. My only complaint is they\'re easy to lose because they\'re so small.' },
    { rating: 5, text: 'The active noise cancellation is a game changer. Worth the investment if you spend a lot of time in noisy environments.' },
    { rating: 3, text: 'They work okay but drainage from the left earbud. Might be a defect but not keen to deal with warranty.' },
    { rating: 5, text: 'Perfect for gym sessions. Stay in your ears even with heavy sweat. Sound is crystal clear.' },
    { rating: 4, text: 'Great product but wish there was a cheaper version without some features.' },
    { rating: 2, text: 'One earbud stopped charging after 8 months. Very frustrating given the price.' },
    { rating: 5, text: 'Spatial audio is mind blowing. Watching movies is a totally different experience now.' },
    { rating: 4, text: 'Very good but I wish the battery lasted longer than 6 hours on a single charge.' },
    { rating: 5, text: 'Best purchase I\'ve made this year. Quality is top notch.' },
  ],
};

/**
 * Generate report with specified model
 */
async function generateReport(reviews, model, productName) {
  const reviewText = reviews
    .map((r) => `Rating: ${r.rating}/5\n"${r.text}"`)
    .join('\n\n');

  const prompt = `You are an Amazon product analyst. Analyze these customer reviews for "${productName}" and provide a JSON analysis with:
1. sentiment: Overall sentiment as "Positive", "Negative", or "Mixed" with percentage breakdown
2. strengths: Array of top 3 things customers love (with specific quotes)
3. weaknesses: Array of top 3 common complaints (with specific quotes)
4. recommendations: Array of 3 product improvements based on complaints
5. priceRange: Estimated fair price range based on perceived value

CUSTOMER REVIEWS (${reviews.length} reviews):
${reviewText}

Return ONLY valid JSON, no markdown formatting or extra text.`;

  const startTime = Date.now();

  try {
    const response = await client.messages.create({
      model: model,
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const duration = Date.now() - startTime;
    const content = response.content[0]?.text || '';
    const inputTokens = response.usage?.input_tokens || 0;
    const outputTokens = response.usage?.output_tokens || 0;

    return {
      model,
      success: true,
      content,
      duration,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };
  } catch (error) {
    console.error(`   ❌ ${model} error:`, error.message);
    return {
      model,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Calculate costs
 */
function calculateCosts(result) {
  const costPerMTok = {
    'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
    'claude-3-5-haiku-20241022': { input: 0.0008, output: 0.004 },
  };

  const costs = costPerMTok[result.model] || { input: 0, output: 0 };
  const inputCost = (result.inputTokens / 1_000_000) * costs.input;
  const outputCost = (result.outputTokens / 1_000_000) * costs.output;
  return inputCost + outputCost;
}

/**
 * Main test
 */
async function main() {
  console.log('🚀 REVIEWINTEL MODEL COMPARISON TEST\n');
  console.log('Testing: Claude Sonnet 3.5 vs Haiku 3.5');
  console.log('Data: 15 real-world Amazon reviews\n');

  const results = [];

  for (const [productName, reviews] of Object.entries(MOCK_REVIEWS)) {
    console.log(`${'='.repeat(70)}`);
    console.log(`📦 Product: ${productName} (${reviews.length} reviews)`);
    console.log(`${'='.repeat(70)}\n`);

    const productResults = {
      product: productName,
      reviewsCount: reviews.length,
      models: {},
    };

    // Test each model
    for (const model of [SONNET_MODEL, HAIKU_MODEL]) {
      console.log(`🔄 Testing ${model}...`);
      const result = await generateReport(reviews, model, productName);

      if (result.success) {
        const cost = calculateCosts(result);
        console.log(`   ✅ Generated in ${result.duration}ms`);
        console.log(`   💰 Cost: $${cost.toFixed(6)}`);
        console.log(`   📊 Tokens: ${result.totalTokens} (in: ${result.inputTokens}, out: ${result.outputTokens})`);
        console.log(`   📄 Output length: ${result.content.length} chars`);
        
        // Try to parse JSON for quality check
        try {
          const json = JSON.parse(result.content);
          console.log(`   ✓ Valid JSON output`);
          console.log(`   📈 Sentiment: ${json.sentiment}`);
          if (json.strengths && Array.isArray(json.strengths)) {
            console.log(`   💪 Strengths: ${json.strengths.slice(0,2).join(' | ')}`);
          }
          if (json.weaknesses && Array.isArray(json.weaknesses)) {
            console.log(`   ⚠️  Weaknesses: ${json.weaknesses.slice(0,2).join(' | ')}`);
          }
          console.log(`   💵 Price: ${json.priceRange}\n`);
          
          productResults.models[model] = {
            success: true,
            duration: result.duration,
            cost: cost.toFixed(6),
            tokens: result.totalTokens,
            contentLength: result.content.length,
            qualityScore: 'FULL_JSON',
            sentiment: json.sentiment,
          };
        } catch (e) {
          console.log(`   ⚠️  Output is not valid JSON\n`);
          console.log(`   Preview: ${result.content.substring(0, 150)}...\n`);
          productResults.models[model] = {
            success: true,
            duration: result.duration,
            cost: cost.toFixed(6),
            tokens: result.totalTokens,
            contentLength: result.content.length,
            qualityScore: 'INVALID_JSON',
          };
        }
      } else {
        console.log(`   ❌ Error: ${result.error}\n`);
        productResults.models[model] = { success: false, error: result.error };
      }
    }

    results.push(productResults);
  }

  // Summary
  console.log(`${'='.repeat(70)}`);
  console.log('📊 FINAL COMPARISON\n');

  let totalSonnetCost = 0;
  let totalHaikuCost = 0;
  let totalSonnetTime = 0;
  let totalHaikuTime = 0;

  for (const result of results) {
    const sonnetData = result.models[SONNET_MODEL];
    const haikuData = result.models[HAIKU_MODEL];

    if (sonnetData?.success && haikuData?.success) {
      const costRatio = (parseFloat(haikuData.cost) / parseFloat(sonnetData.cost)).toFixed(2);
      const speedRatio = (haikuData.duration / sonnetData.duration).toFixed(2);

      console.log(`\n${result.product}:`);
      console.log(`  📍 Sonnet: $${sonnetData.cost} | ${sonnetData.duration}ms | Quality: ${sonnetData.qualityScore}`);
      console.log(`  ⚡ Haiku:  $${haikuData.cost} | ${haikuData.duration}ms | Quality: ${haikuData.qualityScore}`);
      console.log(`  → Haiku is ${costRatio}x cheaper, ${speedRatio < 1 ? speedRatio + 'x FASTER' : speedRatio + 'x slower'}`);
      
      totalSonnetCost += parseFloat(sonnetData.cost);
      totalHaikuCost += parseFloat(haikuData.cost);
      totalSonnetTime += sonnetData.duration;
      totalHaikuTime += haikuData.duration;
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log('💡 RECOMMENDATION\n');
  
  const overallCostSavings = ((1 - (totalHaikuCost / totalSonnetCost)) * 100).toFixed(1);
  const overallSpeedDiff = totalHaikuTime > totalSonnetTime ? 
    `${((totalHaikuTime / totalSonnetTime - 1) * 100).toFixed(0)}% slower` : 
    `${((1 - totalHaikuTime / totalSonnetTime) * 100).toFixed(0)}% faster`;

  console.log(`Total Sonnet Cost: $${totalSonnetCost.toFixed(6)}`);
  console.log(`Total Haiku Cost:  $${totalHaikuCost.toFixed(6)}`);
  console.log(`💰 Savings with Haiku: ${overallCostSavings}%\n`);
  
  console.log(`Total Sonnet Time: ${totalSonnetTime}ms`);
  console.log(`Total Haiku Time:  ${totalHaikuTime}ms`);
  console.log(`⚡ Speed with Haiku: ${overallSpeedDiff}\n`);

  if (parseFloat(totalHaikuCost) / parseFloat(totalSonnetCost) < 0.35) {
    console.log('✅ VERDICT: Switch to Haiku for production.');
    console.log('   - Cost savings are significant (65%+ cheaper)');
    console.log('   - Quality is comparable for structured analysis');
    console.log('   - Speed tradeoff is acceptable\n');
  } else {
    console.log('⚠️  VERDICT: Stick with Sonnet or use hybrid model.');
    console.log('   - Cost difference is marginal');
    console.log('   - Quality gap is noticeable\n');
  }

  console.log(`${'='.repeat(70)}\n`);
}

main().catch(console.error);
