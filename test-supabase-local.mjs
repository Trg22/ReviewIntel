import { createClient } from "@supabase/supabase-js";

const url = "https://feesmokjbrhgltguokpi.supabase.co";
const key = "sb_publishable_q_v1PDLqx1fPQhecCKEipw_S0eDm5cI";

console.log("Testing Supabase connection:");
try {
  const supabase = createClient(url, key);
  console.log("✅ Client created");
  
  // Try to fetch something
  const { data, error } = await supabase.from("reports").select("count()", { count: "exact" });
  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("✅ Reports table accessible");
  }
} catch (error) {
  console.error("❌ Error:", error.message);
}
