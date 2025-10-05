// lib/db.ts
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

// Fail fast with a helpful message if missing
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local at the project root, then restart `npm run dev`."
  );
}

// Safely parse URL to decide SSL
let ssl: false | { rejectUnauthorized: boolean } = false;
try {
  const u = new URL(connectionString);
  const host = u.hostname;
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host === "::1";

  // Enable SSL if:
  // - sslmode=require in the URL, or
  // - it looks like a hosted DB (non-local)
  const sslmode = u.searchParams.get("sslmode");
  if (sslmode === "require" || !isLocal) {
    ssl = { rejectUnauthorized: false };
  }
} catch (e) {
  // If the URL is invalid, tell the user clearly
  throw new Error(
    `Invalid DATABASE_URL. Received: ${connectionString}\n` +
    `Original error: ${(e as Error).message}`
  );
}

export const pool = new Pool({
  connectionString,
  ssl, // either false or { rejectUnauthorized: false }
});
