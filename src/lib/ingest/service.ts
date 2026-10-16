import { eq } from "drizzle-orm";
import { analyzeJob, getAnalysisForJob } from "@/lib/ai/service";
import type { StoredJobAnalysis } from "@/lib/ai/schema";
import { STRONG_MATCH_THRESHOLD } from "@/lib/dashboard-stats";
import { getDb } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { createJobIdempotent } from "@/lib/jobs/service";
import type { JobListing } from "@/lib/types/job";
import type { IngestJobInput } from "@/lib/validation/ingest";

export type IngestJobResult = {
  job: JobListing;
  analysis: StoredJobAnalysis | null;
  created: boolean;
  analyzed: boolean;
  strongMatch: boolean;
  duplicatePrevented: boolean;
};

/**
 * Idempotent ingest path used by n8n:
 * validate → persist (or reuse) → optional AI analysis → report strong match.
 *
 * Analysis is per user, so it only runs when INGEST_USER_EMAIL points at an
 * existing account.
 */
export async function ingestJob(input: IngestJobInput): Promise<IngestJobResult> {
  const { analyze, forceAnalyze, ...jobInput } = input;

  const { job, created } = await createJobIdempotent({
    ...jobInput,
    source: "n8n",
    notes: null,
    applicationStatus: null,
    saved: false,
  });

  const ingestUserId = await resolveIngestUserId();
  let analysis = ingestUserId
    ? await getAnalysisForJob(job.id, ingestUserId)
    : null;
  let analyzed = false;

  const shouldAnalyze =
    Boolean(ingestUserId) &&
    analyze &&
    (forceAnalyze || created || analysis === null);

  if (shouldAnalyze && ingestUserId) {
    analysis = await analyzeJob(job.id, ingestUserId);
    analyzed = true;
  }

  const score = analysis?.matchScore ?? null;
  const strongMatch =
    typeof score === "number" && score >= STRONG_MATCH_THRESHOLD;

  return {
    job: { ...job, matchScore: score },
    analysis,
    created,
    analyzed,
    strongMatch,
    duplicatePrevented: !created,
  };
}

async function resolveIngestUserId(): Promise<string | null> {
  const email = process.env.INGEST_USER_EMAIL?.trim().toLowerCase();
  if (!email) return null;
  const db = getDb();
  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return row?.id ?? null;
}
