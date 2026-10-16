import type { WorkFormat } from "@/lib/types/job";

export type CandidateProfile = {
  id: string;
  userId: string | null;
  fullName: string;
  headline: string;
  bio: string | null;
  avatarUrl: string | null;
  currentLocation: string | null;
  yearsOfExperience: number | null;
  openToWork: boolean;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  experienceSummary: string;
  skills: string[];
  preferredTechnologies: string[];
  targetRoles: string[];
  locationPreferences: string[];
  workFormatPreferences: WorkFormat[];
  salaryExpectation: string | null;
  /** Optional plain-text CV used by AI analysis. */
  cvText: string | null;
  cvFileName: string | null;
  createdAt: string;
  updatedAt: string;
};
