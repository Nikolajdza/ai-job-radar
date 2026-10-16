import { describe, expect, it } from "vitest";
import { mockAnalysisProvider } from "@/lib/ai/providers/mock";
import type { JobListing } from "@/lib/types/job";
import type { CandidateProfile } from "@/lib/types/profile";

const profile: CandidateProfile = {
  id: "profile-1",
  fullName: "Nikola Buljčik",
  headline: "Frontend Engineer",
  experienceSummary:
    "Builds production React and Next.js apps with TypeScript.",
  skills: ["React", "Next.js", "TypeScript", "Node.js"],
  preferredTechnologies: ["PostgreSQL"],
  targetRoles: ["Frontend Engineer"],
  locationPreferences: ["Belgrade", "Remote (EU)"],
  workFormatPreferences: ["remote", "hybrid"],
  salaryExpectation: null,
  cvText: "Production React and TypeScript experience with Next.js dashboards.",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
};

const job: JobListing = {
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
};

describe("mockAnalysisProvider", () => {
  it("returns schema-valid analysis with provider metadata", async () => {
    const result = await mockAnalysisProvider.analyze({ profile, job });

    expect(result.provider).toBe("mock");
    expect(result.model).toBe("mock-overlap-v1");
    expect(result.analysis.matchScore).toBeGreaterThanOrEqual(0);
    expect(result.analysis.matchScore).toBeLessThanOrEqual(100);
    expect(result.analysis.matchingSkills).toEqual(
      expect.arrayContaining(["React", "Next.js", "TypeScript"]),
    );
    expect(result.analysis.explanation.length).toBeGreaterThan(40);
  });
});
