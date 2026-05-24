#!/usr/bin/env node
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SONNET = 'claude-3-5-sonnet-20241022';
const HAIKU = 'claude-3-5-haiku-20241022';
const API_KEY = process.env.CLAUDE_API_KEY;

// Mock Amazon reviews
const REVIEWS = [
  { rating: 5, text: 'Best wireless earbuds I\'ve ever owned. Sound quality is incredible, noise cancellation is amazing.' },
  { rating: 5, text: 'Worth every penny. Transparency mode is perfect. Very comfortable for hours.' },
  { rating: 4, text: 'Great but pricey. Charging case could be more durable.' },
  { rating: 3, text: 'Good quality but connectivity issues with Android phone.' },
  { rating: 2, text: 'Stopped working after 6 months. Customer service unhelpful.' },
  { rating: 5, text: 'Excellent noise cancellation. Blocks engine noise completely.' },
  { rating: 4, text: 'Very comfortable but easy to lose because so small.' },
  { rating: 5, text: 'Active noise cancellation is a game changer.' },
  { rating: 3, text: 'Drainage from left earbud. Might be defect.' },
  { rating: 5, text: 'Perfect for gym. Stay in ears with heavy sweat.' },
];

async function generateReport(model, product) {
  const reviewText = REVIEWS
    .map((r) => `${r.rating}★: ${r.text}`)
    .join('\n');

  const prompt = `Analyze these Amazon reviews for "${product}" as JSON:
{
  "sentiment": "Positive/Negative/Mixed %",
  "strengths": ["top 3 likes"],
  "weaknesses": ["top 3 complaints"],
  "priceRange": "fair price estimate"
}

REVIEWS:
${reviewText}`;

  console.log(`  Testing ${model}...`);
  const start = Date.now();

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: model,
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: prompt
        }]
      },
      {
        headers: {
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    const duration = Date.now() - start;
    const content = response.data.content[0].text;
    const inputTokens = response.data.usage.input_tokens;
    const outputTokens = response.data.usage.output_tokens;

    // Calculate cost
    const costs = {
      [SONNET]: { input: 0.003, output: 0.015 },
      [HAIKU]: { input: 0.0008, output: 0.004 }
    };
    const c = costs[model];
    const cost = ((inputTokens / 1_000_000) * c.input) + ((outputTokens / 1_000_000) * c.output);

    return {
      success: true,
      duration,
      cost: cost.toFixed(6),
      tokens: inputTokens + outputTokens,
      content
    };
  } catch (error) {
    console.error(`  ❌ Error:`, error.response?.data?.error?.message || error.message);
    return { success: false };
  }
}

async function main() {
  console.log('🚀 REVIEWINTEL: Sonnet vs Haiku Comparison\n');
  console.log('Testing both models on 10 real AirPods Pro reviews...\n');

  const sonnet = await generateReport(SONNET, 'AirPods Pro');
  const haiku = await generateReport(HAIKU, 'AirPods Pro');

  if (sonnet.success && haiku.success) {
    console.log(`\n${'='.repeat(60)}\n`);
    console.log(`Sonnet: $${sonnet.cost} | ${sonnet.duration}ms | ${sonnet.tokens} tokens`);
    console.log(`Haiku:  $${haiku.cost} | ${haiku.duration}ms | ${haiku.tokens} tokens`);
    
    const costRatio = (parseFloat(haiku.cost) / parseFloat(sonnet.cost)).toFixed(2);
    const speedRatio = (haiku.duration / sonnet.duration).toFixed(2);
    const savings = ((1 - parseFloat(haiku.cost) / parseFloat(sonnet.cost)) * 100).toFixed(0);

    console.log(`\n💰 Haiku is ${costRatio}x cheaper (${savings}% savings)`);
    console.log(`⚡ Haiku is ${speedRatio}x ${speedRatio < 1 ? 'FASTER' : 'slower'}`);
    
    console.log(`\nSonnet output:\n${sonnet.content.substring(0, 200)}...\n`);
    console.log(`Haiku output:\n${haiku.content.substring(0, 200)}...\n`);
  }
}

main().catch(console.error);
