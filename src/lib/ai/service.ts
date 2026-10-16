import { eq } from "drizzle-orm";
import { getAnalysisProvider } from "@/lib/ai/providers";
import type { StoredJobAnalysis } from "@/lib/ai/schema";
import { getDb } from "@/lib/db";
import { jobAnalyses, jobs } from "@/lib/db/schema";
import { JobNotFoundError, getJobById } from "@/lib/jobs/service";
import { mapAnalysisRow } from "@/lib/mappers";
import { getCandidateProfile } from "@/lib/profile/service";

const inFlight = new Set<string>();

export class AnalysisInProgressError extends Error {
  constructor(message = "An analysis is already running for this job") {
    super(message);
    this.name = "AnalysisInProgressError";
  }
}

export async function getAnalysisForJob(
  jobId: string,
): Promise<StoredJobAnalysis | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(jobAnalyses)
    .where(eq(jobAnalyses.jobId, jobId))
    .limit(1);

  return row ? mapAnalysisRow(row) : null;
}

export async function analyzeJob(jobId: string): Promise<StoredJobAnalysis> {
  if (inFlight.has(jobId)) {
    throw new AnalysisInProgressError();
  }

  inFlight.add(jobId);

  try {
    const job = await getJobById(jobId);
    if (!job) {
      throw new JobNotFoundError();
    }

    const profile = await getCandidateProfile();
    const provider = getAnalysisProvider();
    const result = await provider.analyze({ profile, job });

    const db = getDb();
    const now = new Date();

    const [row] = await db
      .insert(jobAnalyses)
      .values({
        jobId,
        matchScore: result.analysis.matchScore,
        matchingSkills: result.analysis.matchingSkills,
        missingSkills: result.analysis.missingSkills,
        requiredQualifications: result.analysis.requiredQualifications,
        preferredQualifications: result.analysis.preferredQualifications,
        seniorityCompatibility: result.analysis.seniorityCompatibility,
        concerns: result.analysis.concerns,
        uncertainties: result.analysis.uncertainties,
        explanation: result.analysis.explanation,
        cvSuggestions: result.analysis.cvSuggestions,
        provider: result.provider,
        model: result.model,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: jobAnalyses.jobId,
        set: {
          matchScore: result.analysis.matchScore,
          matchingSkills: result.analysis.matchingSkills,
          missingSkills: result.analysis.missingSkills,
          requiredQualifications: result.analysis.requiredQualifications,
          preferredQualifications: result.analysis.preferredQualifications,
          seniorityCompatibility: result.analysis.seniorityCompatibility,
          concerns: result.analysis.concerns,
          uncertainties: result.analysis.uncertainties,
          explanation: result.analysis.explanation,
          cvSuggestions: result.analysis.cvSuggestions,
          provider: result.provider,
          model: result.model,
          updatedAt: now,
        },
      })
      .returning();

    await db
      .update(jobs)
      .set({
        matchScore: result.analysis.matchScore,
        updatedAt: now,
      })
      .where(eq(jobs.id, jobId));

    return mapAnalysisRow(row);
  } finally {
    inFlight.delete(jobId);
  }
}
