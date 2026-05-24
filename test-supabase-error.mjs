import { createClient } from "@supabase/supabase-js";

const url = "https://feesmokjbrhgltguokpi.supabase.co";
const key = "sb_publishable_q_v1PDLqx1fPQhecCKEipw_S0eDm5cI";

console.log("Creating Supabase client:");
console.log("  URL:", url);
console.log("  Key:", key);

try {
  const supabase = createClient(url, key);
  console.log("✅ Client created successfully");
  
  // Try a simple query
  const result = await supabase.from("test_table").select("*").limit(1);
  console.log("Result:", result);
} catch (error) {
  console.error("Error details:");
  console.error("  Message:", error.message);
  console.error("  Stack:", error.stack);
}
