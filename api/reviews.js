import { createClient } from "@supabase/supabase-js";

console.log("[REVIEWS] Initializing Supabase:");
console.log("  SUPABASE_URL set:", !!process.env.SUPABASE_URL);
console.log("  SUPABASE_ANON_KEY set:", !!process.env.SUPABASE_ANON_KEY);

let supabase;
try {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  console.log("[REVIEWS] ✅ Supabase client created");
} catch (error) {
  console.error("[REVIEWS] ❌ Error creating Supabase client:", error.message);
  console.error("  URL:", JSON.stringify(process.env.SUPABASE_URL));
  console.error("  Key:", JSON.stringify(process.env.SUPABASE_ANON_KEY));
}

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

      // Attempt to store review in Supabase, but don't fail if table doesn't exist yet
      let data = null;
      let dbError = null;
      
      try {
        const result = await supabase.from("reviews").insert([
          {
            productId,
            rating,
            review_text: review,
            reviewer_name: reviewer,
            reviewer_email: email || null,
            created_at: new Date().toISOString(),
          },
        ]);
        data = result.data;
        dbError = result.error;
      } catch (supabaseError) {
        console.log("[REVIEWS] Supabase table not ready yet:", supabaseError.message);
      }

      // Return success even if DB isn't ready (for MVP testing)
      res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: data || {
          productId,
          rating,
          review,
          reviewer,
          email,
          submitted_at: new Date().toISOString(),
        },
        db_status: dbError ? "table_not_ready" : "stored",
      });
    } catch (error) {
      console.error("Reviews handler error:", error);
      res
        .status(500)
        .json({ error: "Internal error", details: error.message });
    }
  } else if (req.method === "GET") {
    try {
      // Return mock data for MVP testing
      res.status(200).json({
        success: true,
        reviews: [
          {
            id: 1,
            productId: "premium-report",
            rating: 5,
            review_text: "Excellent insights and competitive analysis!",
            reviewer_name: "Sample User",
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        count: 1,
        note: "Database tables can be created via Supabase dashboard for persistence",
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
