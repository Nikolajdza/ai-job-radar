import type { StoredJobAnalysis } from "@/lib/ai/schema";
import type {
  CandidateProfileRow,
  CoverLetterRow,
  JobAnalysisRow,
  JobRow,
  JobTrackingRow,
} from "@/lib/db/schema";
import type { StoredCoverLetter } from "@/lib/cover-letters/types";
import type { JobListing, WorkFormat } from "@/lib/types/job";
import type { CandidateProfile } from "@/lib/types/profile";

export function mapJobRow(
  row: JobRow,
  tracking?: Pick<JobTrackingRow, "applicationStatus" | "saved" | "notes"> | null,
  matchScore?: number | null,
): JobListing {
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
    ownerUserId: row.ownerUserId,
    createdAt: row.createdAt.toISOString(),
    applicationStatus: tracking?.applicationStatus ?? null,
    matchScore: matchScore ?? null,
    saved: tracking?.saved ?? false,
    notes: tracking?.notes ?? null,
  };
}

export function mapProfileRow(row: CandidateProfileRow): CandidateProfile {
  return {
    id: row.id,
    userId: row.userId,
    fullName: row.fullName,
    headline: row.headline,
    bio: row.bio,
    avatarUrl: row.avatarUrl,
    currentLocation: row.currentLocation,
    yearsOfExperience: row.yearsOfExperience,
    openToWork: row.openToWork,
    linkedinUrl: row.linkedinUrl,
    githubUrl: row.githubUrl,
    portfolioUrl: row.portfolioUrl,
    experienceSummary: row.experienceSummary,
    skills: row.skills ?? [],
    preferredTechnologies: row.preferredTechnologies ?? [],
    targetRoles: row.targetRoles ?? [],
    locationPreferences: row.locationPreferences ?? [],
    workFormatPreferences: (row.workFormatPreferences ?? []) as WorkFormat[],
    salaryExpectation: row.salaryExpectation,
    cvText: row.cvText,
    cvFileName: row.cvFileName,
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

export function mapCoverLetterRow(row: CoverLetterRow): StoredCoverLetter {
  return {
    id: row.id,
    jobId: row.jobId,
    subject: row.subject,
    content: row.content,
    highlights: row.highlights ?? [],
    tone: row.tone,
    language: row.language,
    provider: row.provider,
    model: row.model,
    updatedAt: row.updatedAt.toISOString(),
  };
}
