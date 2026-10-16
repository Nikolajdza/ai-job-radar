import type { WorkFormat } from "@/lib/types/job";

export type CandidateProfile = {
  id: string;
  fullName: string;
  headline: string;
  experienceSummary: string;
  skills: string[];
  preferredTechnologies: string[];
  targetRoles: string[];
  locationPreferences: string[];
  workFormatPreferences: WorkFormat[];
  salaryExpectation: string | null;
  createdAt: string;
  updatedAt: string;
};
