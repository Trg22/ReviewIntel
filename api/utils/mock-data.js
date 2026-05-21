/**
 * Mock Amazon Reviews Data for MVP Testing
 * 
 * This module provides realistic mock Amazon review data for testing the ReviewIntel pipeline
 * without making real API calls to Apify. Data includes positive, negative, and neutral reviews
 * with authentic sentiment patterns and improvement suggestions.
 * 
 * In production (Days 6-7), this will be replaced with actual Apify calls.
 */

export const mockReviewsData = [
  {
    id: "1",
    title: "Excellent quality and fast shipping!",
    text: "This product exceeded my expectations. The build quality is outstanding and it arrived faster than expected. Highly recommend!",
    rating: 5,
    author: "Sarah M.",
    date: "2024-05-15",
    helpful: 234,
    verified: true
  },
  {
    id: "2",
    title: "Great value for money",
    text: "Amazing product for the price. Works exactly as described. Will definitely purchase again.",
    rating: 5,
    author: "John D.",
    date: "2024-05-14",
    helpful: 156,
    verified: true
  },
  {
    id: "3",
    title: "Packaging could be better",
    text: "Good product but the packaging was damaged on arrival. Item was fine though. Customer service was helpful.",
    rating: 4,
    author: "Maria K.",
    date: "2024-05-13",
    helpful: 89,
    verified: true
  },
  {
    id: "4",
    title: "Disappointed with durability",
    text: "Stopped working after 3 weeks. Tried to get a refund but process was slow. Not worth the money.",
    rating: 2,
    author: "Alex T.",
    date: "2024-05-12",
    helpful: 567,
    verified: true
  },
  {
    id: "5",
    title: "Outstanding customer service!",
    text: "Had a problem with my order and the support team was incredibly responsive and helpful. Product quality is also top-notch.",
    rating: 5,
    author: "Emma W.",
    date: "2024-05-11",
    helpful: 345,
    verified: true
  },
  {
    id: "6",
    title: "Not as described",
    text: "The color is different from the listing photos. Quality is okay but not what I expected.",
    rating: 3,
    author: "David L.",
    date: "2024-05-10",
    helpful: 234,
    verified: true
  },
  {
    id: "7",
    title: "Perfect! Just what I needed",
    text: "Arrived quickly, well packaged, and works perfectly. This is now my go-to product for this type of thing.",
    rating: 5,
    author: "Lisa R.",
    date: "2024-05-09",
    helpful: 198,
    verified: true
  },
  {
    id: "8",
    title: "Poor quality material",
    text: "Materials feel cheap and flimsy. For the price, I expected better quality. Regret this purchase.",
    rating: 2,
    author: "Robert M.",
    date: "2024-05-08",
    helpful: 412,
    verified: true
  },
  {
    id: "9",
    title: "Good but needs improvement",
    text: "Product is decent but the user manual is poorly written and hard to follow. Some features are confusing.",
    rating: 3,
    author: "Jennifer H.",
    date: "2024-05-07",
    helpful: 167,
    verified: true
  },
  {
    id: "10",
    title: "Absolutely love it!",
    text: "This is the best purchase I've made this year. Quality, durability, and customer service are all exceptional.",
    rating: 5,
    author: "Michael S.",
    date: "2024-05-06",
    helpful: 523,
    verified: true
  },
  {
    id: "11",
    title: "Good product, slow shipping",
    text: "Item quality is great but it took almost a month to arrive. Would have been 5 stars with faster delivery.",
    rating: 4,
    author: "Patricia G.",
    date: "2024-05-05",
    helpful: 289,
    verified: true
  },
  {
    id: "12",
    title: "Waste of money",
    text: "Stopped working after a few weeks. Tried to return but was outside the return window. Very disappointed.",
    rating: 1,
    author: "Christopher P.",
    date: "2024-05-04",
    helpful: 678,
    verified: true
  },
  {
    id: "13",
    title: "Better than expected!",
    text: "Exceeded expectations in every way. Build quality is superior to similar products. Highly satisfied.",
    rating: 5,
    author: "Lauren V.",
    date: "2024-05-03",
    helpful: 234,
    verified: true
  },
  {
    id: "14",
    title: "Average product",
    text: "Does what it's supposed to do but nothing special. Plenty of similar options available.",
    rating: 3,
    author: "Kevin J.",
    date: "2024-05-02",
    helpful: 145,
    verified: true
  },
  {
    id: "15",
    title: "Excellent support and quality",
    text: "Had a question and support responded within hours. Product quality is outstanding and very durable.",
    rating: 5,
    author: "Nicole B.",
    date: "2024-05-01",
    helpful: 389,
    verified: true
  },
  {
    id: "16",
    title: "Broke easily",
    text: "Fragile packaging and the product broke on arrival. Replacement also had issues. Poor quality control.",
    rating: 1,
    author: "Brian F.",
    date: "2024-04-30",
    helpful: 445,
    verified: true
  },
  {
    id: "17",
    title: "Very satisfied customer",
    text: "Everything about this purchase was great. Fast shipping, excellent product quality, fair price.",
    rating: 5,
    author: "Susan C.",
    date: "2024-04-29",
    helpful: 267,
    verified: true
  },
  {
    id: "18",
    title: "Instructions unclear",
    text: "Product itself is fine but the instructions are confusing and incomplete. Took me too long to figure it out.",
    rating: 3,
    author: "Daniel R.",
    date: "2024-04-28",
    helpful: 156,
    verified: true
  },
  {
    id: "19",
    title: "Best purchase ever",
    text: "Highest quality I've seen. Wish I had found this earlier. Will tell all my friends about it.",
    rating: 5,
    author: "Angela N.",
    date: "2024-04-27",
    helpful: 534,
    verified: true
  },
  {
    id: "20",
    title: "Defective unit received",
    text: "Product arrived defective. Return process was tedious and took weeks. Very frustrating experience.",
    rating: 1,
    author: "Mark A.",
    date: "2024-04-26",
    helpful: 389,
    verified: true
  },
  {
    id: "21",
    title: "Great value",
    text: "Excellent quality for the price point. Comparable products cost much more. Very happy with purchase.",
    rating: 5,
    author: "Sandra E.",
    date: "2024-04-25",
    helpful: 212,
    verified: true
  },
  {
    id: "22",
    title: "Packaging damaged",
    text: "Item arrived with damaged packaging though product inside was okay. Shipping could be improved.",
    rating: 4,
    author: "James T.",
    date: "2024-04-24",
    helpful: 134,
    verified: true
  },
  {
    id: "23",
    title: "Terrible experience",
    text: "Product failed immediately. Support was unresponsive. Would not recommend. Complete waste of money.",
    rating: 1,
    author: "Linda O.",
    date: "2024-04-23",
    helpful: 523,
    verified: true
  },
  {
    id: "24",
    title: "Meets expectations",
    text: "Decent product that does what it claims. Fair price. Nothing exceptional but reliable.",
    rating: 4,
    author: "Paul K.",
    date: "2024-04-22",
    helpful: 98,
    verified: true
  },
  {
    id: "25",
    title: "Fantastic quality and service",
    text: "Impressed with everything about this purchase. Fast delivery, excellent build quality, great support.",
    rating: 5,
    author: "Karen S.",
    date: "2024-04-21",
    helpful: 456,
    verified: true
  }
];

/**
 * Generate synthetic Amazon reviews with realistic patterns
 * Simulates what Apify would return for a given ASIN
 * 
 * @param {number} count - Number of reviews to generate
 * @returns {Array} Array of review objects
 */
export function generateMockReviews(count = 50) {
  const reviews = [];
  const sentiments = [
    { rating: 5, prefix: "Excellent", texts: ["exceeded expectations", "outstanding quality", "highly recommend", "best purchase", "perfect product"] },
    { rating: 4, prefix: "Good", texts: ["pretty good", "meets expectations", "quite happy", "would recommend", "solid product"] },
    { rating: 3, prefix: "Okay", texts: ["average", "decent", "nothing special", "could be better", "mixed feelings"] },
    { rating: 2, prefix: "Poor", texts: ["disappointed", "quality issues", "not as described", "breaks easily", "regret purchase"] },
    { rating: 1, prefix: "Terrible", texts: ["waste of money", "defective", "failed immediately", "terrible experience", "avoid this"] }
  ];

  const authors = ["Sarah", "John", "Maria", "Alex", "Emma", "David", "Lisa", "Robert", "Jennifer", "Michael"];
  
  for (let i = 0; i < count; i++) {
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const author = authors[Math.floor(Math.random() * authors.length)];
    const text = sentiment.texts[Math.floor(Math.random() * sentiment.texts.length)];
    
    reviews.push({
      id: String(i + 1),
      title: `${sentiment.prefix}: ${text}`,
      text: `This product ${text}. Quality is good and delivery was fast. ${text}.`,
      rating: sentiment.rating,
      author: `${author} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      helpful: Math.floor(Math.random() * 500),
      verified: Math.random() > 0.2
    });
  }

  return reviews;
}

/**
 * Mock Apify response structure
 * @param {string} asin - Amazon product ASIN
 * @returns {Object} Apify-like response
 */
export function getMockApifyResponse(asin = "B0EXAMPLE123") {
  return {
    asin,
    title: "Example Amazon Product",
    rating: 4.2,
    reviewCount: 2547,
    reviews: generateMockReviews(50),
    timestamp: new Date().toISOString()
  };
}

export default {
  mockReviewsData,
  generateMockReviews,
  getMockApifyResponse
};
