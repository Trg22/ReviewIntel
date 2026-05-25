import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

console.log("STRIPE_SECRET_KEY length:", process.env.STRIPE_SECRET_KEY?.length);
console.log("STRIPE_SECRET_KEY first 30 chars:", process.env.STRIPE_SECRET_KEY?.slice(0, 30));
console.log("STRIPE_SECRET_KEY last 20 chars:", process.env.STRIPE_SECRET_KEY?.slice(-20));
console.log("STRIPE_SECRET_KEY hex:", Buffer.from(process.env.STRIPE_SECRET_KEY || "").toString("hex").slice(0, 100));
