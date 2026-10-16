import { config } from "dotenv";
import { isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sampleJobs } from "../src/data/sample-jobs";
import { jobs } from "../src/lib/db/schema";
import { buildJobDedupeKey } from "../src/lib/jobs/dedupe";

config({ path: ".env.local" });

/**
 * Seeds the public job catalog only. Profiles, tracking, analyses, and
 * cover letters belong to real users and are never touched here.
 */
async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is missing. Copy .env.example to .env.local.");
  }

  const client = postgres(url, { max: 1, prepare: false });
  const db = drizzle(client);

  console.log("Clearing public catalog jobs…");
  await db.delete(jobs).where(isNull(jobs.ownerUserId));

  console.log(`Inserting ${sampleJobs.length} jobs…`);
  await db.insert(jobs).values(
    sampleJobs.map((job) => ({
      title: job.title,
      company: job.company,
      location: job.location,
      workFormat: job.workFormat,
      salary: job.salary,
      description: job.description,
      sourceUrl: job.sourceUrl,
      source: job.source,
      dedupeKey: buildJobDedupeKey({
        company: job.company,
        title: job.title,
        sourceUrl: job.sourceUrl,
      }),
      createdAt: new Date(job.createdAt),
      updatedAt: new Date(job.createdAt),
    })),
  );

  await client.end();
  console.log("Seed complete.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
