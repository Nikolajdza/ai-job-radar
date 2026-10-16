import { describe, expect, it } from "vitest";
import {
  getDashboardStats,
  STRONG_MATCH_THRESHOLD,
} from "@/lib/dashboard-stats";
import type { JobListing } from "@/lib/types/job";

function job(partial: Partial<JobListing>): JobListing {
  return {
    id: partial.id ?? "1",
    title: partial.title ?? "Role",
    company: partial.company ?? "Company",
    location: partial.location ?? "Remote",
    workFormat: partial.workFormat ?? "remote",
    salary: partial.salary ?? null,
    description: partial.description ?? "A sufficiently long description.",
    sourceUrl: partial.sourceUrl ?? "https://example.com/job",
    source: partial.source ?? "manual",
    createdAt: partial.createdAt ?? "2026-10-01T00:00:00.000Z",
    applicationStatus: partial.applicationStatus ?? null,
    matchScore: partial.matchScore ?? null,
    saved: partial.saved ?? false,
    notes: partial.notes ?? null,
  };
}

describe("getDashboardStats", () => {
  it("counts saved jobs, applications, interviews, and strong matches", () => {
    const stats = getDashboardStats([
      job({ saved: true, applicationStatus: "interesting", matchScore: 80 }),
      job({
        id: "2",
        saved: true,
        applicationStatus: "applied",
        matchScore: 60,
      }),
      job({
        id: "3",
        saved: true,
        applicationStatus: "interview",
        matchScore: STRONG_MATCH_THRESHOLD,
      }),
      job({ id: "4", saved: false, matchScore: 40 }),
    ]);

    expect(stats).toEqual({
      savedJobs: 3,
      applications: 2,
      interviews: 1,
      strongMatches: 2,
    });
  });
});
