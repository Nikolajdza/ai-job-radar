import type { JobListing } from "@/lib/types/job";
import type { CandidateProfile } from "@/lib/types/profile";

export function makeProfile(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
  return {
    id: "profile-1",
    userId: "user-1",
    fullName: "Nikola Buljčik",
    headline: "Frontend Engineer",
    bio: null,
    avatarUrl: null,
    currentLocation: "Belgrade, Serbia",
    yearsOfExperience: 4,
    openToWork: true,
    linkedinUrl: null,
    githubUrl: null,
    portfolioUrl: null,
    experienceSummary: "Builds production React and Next.js apps with TypeScript.",
    skills: ["React", "Next.js", "TypeScript", "Node.js"],
    preferredTechnologies: ["PostgreSQL"],
    targetRoles: ["Frontend Engineer"],
    locationPreferences: ["Belgrade", "Remote (EU)"],
    workFormatPreferences: ["remote", "hybrid"],
    salaryExpectation: null,
    cvText: "Production React and TypeScript experience with Next.js dashboards.",
    cvFileName: null,
    createdAt: "2026-10-01T00:00:00.000Z",
    updatedAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makeJob(overrides: Partial<JobListing> = {}): JobListing {
  return {
    id: "job-1",
    title: "Senior Frontend Engineer",
    company: "Northwind",
    location: "Remote (EU)",
    workFormat: "remote",
    salary: null,
    description:
      "We need React, Next.js, TypeScript, and PostgreSQL experience for our product team.",
    sourceUrl: "https://example.com/jobs/northwind",
    source: "manual",
    createdAt: "2026-10-01T00:00:00.000Z",
    applicationStatus: null,
    matchScore: null,
    saved: false,
    notes: null,
    ...overrides,
  };
}
