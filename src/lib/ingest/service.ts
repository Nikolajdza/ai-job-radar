import {
  analyzeJob,
  getAnalysisForJob,
} from "@/lib/ai/service";
import type { StoredJobAnalysis } from "@/lib/ai/schema";
import { STRONG_MATCH_THRESHOLD } from "@/lib/dashboard-stats";
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
 */
export async function ingestJob(input: IngestJobInput): Promise<IngestJobResult> {
  const { analyze, forceAnalyze, ...jobInput } = input;

  const { job, created } = await createJobIdempotent({
    ...jobInput,
    source: "n8n",
    notes: null,
    applicationStatus: jobInput.saved === false ? null : "interesting",
  });

  let analysis = await getAnalysisForJob(job.id);
  let analyzed = false;

  const shouldAnalyze =
    analyze && (forceAnalyze || created || analysis === null);

  if (shouldAnalyze) {
    analysis = await analyzeJob(job.id);
    analyzed = true;
  }

  const score = analysis?.matchScore ?? job.matchScore;
  const strongMatch =
    typeof score === "number" && score >= STRONG_MATCH_THRESHOLD;

  return {
    job: {
      ...job,
      matchScore: score ?? job.matchScore,
    },
    analysis,
    created,
    analyzed,
    strongMatch,
    duplicatePrevented: !created,
  };
}
