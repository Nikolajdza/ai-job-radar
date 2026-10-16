import type { StoredJobAnalysis } from "@/lib/ai/schema";
import type {
  CandidateProfileRow,
  JobAnalysisRow,
  JobRow,
} from "@/lib/db/schema";
import type { JobListing, WorkFormat } from "@/lib/types/job";
import type { CandidateProfile } from "@/lib/types/profile";

export function mapJobRow(row: JobRow): JobListing {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    workFormat: row.workFormat,
    salary: row.salary,
    description: row.description,
    sourceUrl: row.sourceUrl,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
    applicationStatus: row.applicationStatus,
    matchScore: row.matchScore,
    saved: row.saved,
    notes: row.notes,
  };
}

export function mapProfileRow(row: CandidateProfileRow): CandidateProfile {
  return {
    id: row.id,
    fullName: row.fullName,
    headline: row.headline,
    experienceSummary: row.experienceSummary,
    skills: row.skills ?? [],
    preferredTechnologies: row.preferredTechnologies ?? [],
    targetRoles: row.targetRoles ?? [],
    locationPreferences: row.locationPreferences ?? [],
    workFormatPreferences: (row.workFormatPreferences ?? []) as WorkFormat[],
    salaryExpectation: row.salaryExpectation,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapAnalysisRow(row: JobAnalysisRow): StoredJobAnalysis {
  return {
    id: row.id,
    jobId: row.jobId,
    matchScore: row.matchScore,
    matchingSkills: row.matchingSkills ?? [],
    missingSkills: row.missingSkills ?? [],
    requiredQualifications: row.requiredQualifications ?? [],
    preferredQualifications: row.preferredQualifications ?? [],
    seniorityCompatibility: row.seniorityCompatibility,
    concerns: row.concerns ?? [],
    uncertainties: row.uncertainties ?? [],
    explanation: row.explanation,
    cvSuggestions: row.cvSuggestions ?? [],
    provider: row.provider,
    model: row.model,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
