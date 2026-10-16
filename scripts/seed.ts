import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sampleJobs } from "../src/data/sample-jobs";
import { sampleProfile } from "../src/data/sample-profile";
import { candidateProfiles, jobs } from "../src/lib/db/schema";
import { buildJobDedupeKey } from "../src/lib/jobs/dedupe";

config({ path: ".env.local" });

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is missing. Copy .env.example to .env.local.");
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  console.log("Clearing existing seed tables…");
  await db.delete(jobs);
  await db.delete(candidateProfiles);

  console.log("Inserting candidate profile…");
  await db.insert(candidateProfiles).values({
    fullName: sampleProfile.fullName,
    headline: sampleProfile.headline,
    experienceSummary: sampleProfile.experienceSummary,
    skills: sampleProfile.skills,
    preferredTechnologies: sampleProfile.preferredTechnologies,
    targetRoles: sampleProfile.targetRoles,
    locationPreferences: sampleProfile.locationPreferences,
    workFormatPreferences: sampleProfile.workFormatPreferences,
    salaryExpectation: sampleProfile.salaryExpectation,
    cvText: sampleProfile.cvText,
  });

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
      applicationStatus: job.applicationStatus,
      matchScore: job.matchScore,
      saved: job.saved,
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
