import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "@/env";
import * as schema from "./schema";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: Client | undefined;
};

export const client =
  globalForDb.client ??
  createClient({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN });
if (env.NODE_ENV !== "production") globalForDb.client = client;

let configExecuted = false;

if (!configExecuted) {
  configExecuted = true;
  try {
    // switch to WAL
    await client.execute("PRAGMA journal_mode=WAL;");
  } catch (err) {
    console.error(err);
  }
}

export const db = drizzle(client, { schema });
