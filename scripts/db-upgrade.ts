import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: process.env.DOTENV_PATH ?? ".env.local" });

type JournalEntry = { idx: number; when: number; tag: string };

const MIGRATIONS_FOLDER = path.resolve("drizzle");

/**
 * Databases created with `drizzle-kit push` have no migration history, so
 * `drizzle-kit migrate` would try to recreate existing tables. This script
 * detects how far the schema already is, records those migrations as applied,
 * then runs the remaining ones in a single transaction.
 */
async function upgrade() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing.");

  const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
  const db = drizzle(client);

  const journal = JSON.parse(
    readFileSync(path.join(MIGRATIONS_FOLDER, "meta/_journal.json"), "utf8"),
  ) as { entries: JournalEntry[] };

  await client`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await client`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )`;

  const [{ count }] = await client<{ count: number }[]>`
    SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations`;

  if (count === 0) {
    const appliedThrough = await detectAppliedThrough(client);
    const baseline = journal.entries.filter((entry) => entry.idx <= appliedThrough);

    for (const entry of baseline) {
      const sql = readFileSync(path.join(MIGRATIONS_FOLDER, `${entry.tag}.sql`), "utf8");
      const hash = createHash("sha256").update(sql).digest("hex");
      await client`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES (${hash}, ${entry.when})`;
    }

    console.log(
      baseline.length > 0
        ? `Baselined existing schema through ${baseline.at(-1)?.tag}.`
        : "Empty database — applying all migrations.",
    );
  }

  console.log("Applying pending migrations…");
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

  // Pre-auth rows have no owner and can never be shown to anyone.
  const analyses = await client`DELETE FROM job_analyses WHERE user_id IS NULL`;
  const profiles = await client`DELETE FROM candidate_profiles WHERE user_id IS NULL`;
  if (analyses.count || profiles.count) {
    console.log(
      `Removed ${analyses.count} legacy analyses and ${profiles.count} legacy profiles without an owner.`,
    );
  }

  await client.end();
  console.log("Database is up to date.");
}

async function detectAppliedThrough(client: postgres.Sql): Promise<number> {
  const tables = await client<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
  const names = new Set(tables.map((row) => row.table_name));

  if (names.has("user")) return 5;
  if (!names.has("jobs")) return -1;

  const columns = await client<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'jobs'`;
  const hasTrackingColumns = columns.some(
    (column) => column.column_name === "application_status",
  );

  return hasTrackingColumns ? 3 : 4;
}

upgrade().catch((error) => {
  console.error(error);
  process.exit(1);
});
