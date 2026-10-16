import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/lib/env";
import * as schema from "@/lib/db/schema";

/**
 * Lazy singleton DB client for the Next.js server runtime.
 * Avoid creating a new pool on every hot reload in development.
 */
const globalForDb = globalThis as unknown as {
  postgresClient: ReturnType<typeof postgres> | undefined;
};

function createClient() {
  const { DATABASE_URL } = getEnv();
  return postgres(DATABASE_URL, {
    max: 10,
    prepare: false,
  });
}

export function getDb() {
  const client = globalForDb.postgresClient ?? createClient();

  if (process.env.NODE_ENV !== "production") {
    globalForDb.postgresClient = client;
  }

  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof getDb>;
