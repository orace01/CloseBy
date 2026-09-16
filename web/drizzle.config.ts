import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

// Migrations need a session connection: set DATABASE_URL_MIGRATIONS to the
// Supabase "session pooler" (or direct) URL when migrating a hosted database.
const url = process.env.DATABASE_URL_MIGRATIONS ?? process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL (or DATABASE_URL_MIGRATIONS) before running drizzle-kit.");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: { url },
});
