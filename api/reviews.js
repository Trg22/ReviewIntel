import { createClient } from "@supabase/supabase-js";

console.log("[REVIEWS] Initializing with:", {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_ANON_KEY ? "✓ set" : "✗ missing",
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { productId, rating, review, reviewer, email } = req.body;

      if (!productId || !rating || !review || !reviewer) {
        return res.status(400).json({
          error: "Missing required fields: productId, rating, review, reviewer",
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }

      // Store review in Supabase
      const { data, error } = await supabase.from("reports").insert([
        {
          product_id: productId,
          rating,
          review_text: review,
          reviewer_name: reviewer,
          reviewer_email: email || null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
        return res
          .status(500)
          .json({ error: "Failed to save review", details: error.message });
      }

      res.status(201).json({
        success: true,
        message: "Review saved successfully",
        data,
      });
    } catch (error) {
      console.error("Reviews handler error:", error);
      res
        .status(500)
        .json({ error: "Internal error", details: error.message });
    }
  } else if (req.method === "GET") {
    try {
      const { productId, limit = 10, offset = 0 } = req.query;

      let query = supabase.from("reports").select("*");

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Supabase fetch error:", error);
        return res
          .status(500)
          .json({ error: "Failed to fetch reviews", details: error.message });
      }

      res.status(200).json({
        success: true,
        reviews: data,
        count: data.length,
      });
    } catch (error) {
      console.error("Reviews handler error:", error);
      res
        .status(500)
        .json({ error: "Internal error", details: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
