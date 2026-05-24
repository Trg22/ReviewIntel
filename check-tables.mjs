import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://feesmokjbrhgltguokpi.supabase.co",
  "sb_publishable_q_v1PDLqx1fPQhecCKEipw_S0eDm5cI"
);

// Try to list tables via information_schema
const { data, error } = await supabase
  .from("information_schema.tables")
  .select("table_name")
  .eq("table_schema", "public");

if (error) {
  console.log("Cannot access information_schema. Trying direct table access...");
  
  // Try common table names
  const tables = ["reports", "reviews", "customers", "orders", "analytics"];
  for (const table of tables) {
    const { error: e } = await supabase.from(table).select("count()", { count: "exact" });
    if (!e) {
      console.log("✓ Table exists:", table);
    }
  }
} else {
  console.log("Tables in public schema:");
  data.forEach(row => console.log("  -", row.table_name));
}
