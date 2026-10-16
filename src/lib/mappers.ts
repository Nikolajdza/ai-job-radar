import type { CandidateProfileRow, JobRow } from "@/lib/db/schema";
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
