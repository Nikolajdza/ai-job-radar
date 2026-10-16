import { and, eq } from "drizzle-orm";
import { getAnalysisProvider } from "@/lib/ai/providers";
import type { StoredJobAnalysis } from "@/lib/ai/schema";
import { getDb } from "@/lib/db";
import { jobAnalyses } from "@/lib/db/schema";
import { ProfileIncompleteError } from "@/lib/errors";
import { JobNotFoundError, getJobById } from "@/lib/jobs/service";
import { mapAnalysisRow } from "@/lib/mappers";
import { hasAiReadyProfile } from "@/lib/profile/completeness";
import { getProfileByUserId } from "@/lib/profile/service";

const inFlight = new Set<string>();

export class AnalysisInProgressError extends Error {
  constructor(message = "An analysis is already running for this job") {
    super(message);
    this.name = "AnalysisInProgressError";
  }
}

export async function getAnalysisForJob(
  jobId: string,
  userId: string,
): Promise<StoredJobAnalysis | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(jobAnalyses)
    .where(and(eq(jobAnalyses.jobId, jobId), eq(jobAnalyses.userId, userId)))
    .limit(1);

  return row ? mapAnalysisRow(row) : null;
}

export async function analyzeJob(
  jobId: string,
  userId: string,
): Promise<StoredJobAnalysis> {
  const key = `${userId}:${jobId}`;
  if (inFlight.has(key)) {
    throw new AnalysisInProgressError();
  }

  inFlight.add(key);

  try {
    const job = await getJobById(jobId, userId);
    if (!job) {
      throw new JobNotFoundError();
    }

    const profile = await getProfileByUserId(userId);
    if (!profile || !hasAiReadyProfile(profile)) {
      throw new ProfileIncompleteError();
    }

    const provider = getAnalysisProvider();
    const result = await provider.analyze({ profile, job });

    const db = getDb();
    const now = new Date();
    const values = {
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
    };

    const [row] = await db
      .insert(jobAnalyses)
      .values({ jobId, userId, createdAt: now, ...values })
      .onConflictDoUpdate({
        target: [jobAnalyses.jobId, jobAnalyses.userId],
        set: values,
      })
      .returning();

    return mapAnalysisRow(row);
  } finally {
    inFlight.delete(key);
  }
}
