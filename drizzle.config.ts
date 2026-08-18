import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DIRECT_URL) {
  throw new Error(
    "DIRECT_URL is not set. Add the Supabase direct Postgres URL",
  );
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL,
  },
  strict: true,
  verbose: true,
});
