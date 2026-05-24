import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://feesmokjbrhgltguokpi.supabase.co",
  "sb_publishable_q_v1PDLqx1fPQhecCKEipw_S0eDm5cI"
);

// For creating tables we need the service role key, which we don't have
// Instead, let's use the admin API - but first test if we can access it

console.log("Attempting to create schema...");
console.log("(Note: May require admin credentials via Supabase dashboard)");

// Try inserting a record to see if a basic table exists
const { data, error } = await supabase
  .from("reviews")
  .insert([{
    productId: "test",
    rating: 5,
    review_text: "Test",
    reviewer_name: "Test",
    created_at: new Date().toISOString()
  }]);

if (error) {
  console.log("✗ Cannot insert:", error.message);
  console.log("\nSolution: Create tables via Supabase dashboard SQL editor:");
  console.log(`
CREATE TABLE public.reviews (
  id BIGSERIAL PRIMARY KEY,
  productId TEXT NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  review_text TEXT,
  reviewer_name TEXT,
  reviewer_email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public inserts" ON public.reviews
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public reads" ON public.reviews
  FOR SELECT USING (true);
  `);
} else {
  console.log("✓ Table created/record inserted successfully");
  console.log(data);
}
