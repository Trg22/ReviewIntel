console.log("SUPABASE_URL:");
console.log("  Length:", (process.env.SUPABASE_URL || "").length);
console.log("  Value:", JSON.stringify(process.env.SUPABASE_URL));
console.log("  First 50 chars:", (process.env.SUPABASE_URL || "").substring(0, 50));

console.log("\nSTRIPE_SECRET_KEY:");
console.log("  Length:", (process.env.STRIPE_SECRET_KEY || "").length);
console.log("  Value:", JSON.stringify(process.env.STRIPE_SECRET_KEY));
console.log("  First 50 chars:", (process.env.STRIPE_SECRET_KEY || "").substring(0, 50));
