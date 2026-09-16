import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
  // `prepare: false` keeps queries compatible with transaction poolers
  // (Supabase pooler on port 6543), which serverless deployments should use.
  const client = postgres(url, { max: process.env.VERCEL ? 5 : 10, prepare: false });
  return drizzle(client, { schema, casing: "snake_case" });
}

export type Database = ReturnType<typeof connect>;

// Reuse one connection pool across hot reloads in development.
const globalForDb = globalThis as unknown as { db?: Database };

function instance() {
  globalForDb.db ??= connect();
  return globalForDb.db;
}

/**
 * Connects on first use rather than on import, so the app can be built
 * (e.g. on Vercel) before the database variables are configured.
 */
export const db = new Proxy({} as Database, {
  get(_target, property) {
    const real = instance();
    const value = Reflect.get(real, property, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
