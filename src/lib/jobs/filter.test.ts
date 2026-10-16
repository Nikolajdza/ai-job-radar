import { describe, expect, it } from "vitest";
import { filterJobs } from "@/lib/jobs/filter";
import type { JobListing } from "@/lib/types/job";

function job(partial: Partial<JobListing>): JobListing {
  return {
    id: partial.id ?? crypto.randomUUID(),
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

describe("filterJobs", () => {
  const jobs = [
    job({
      id: "a",
      title: "Frontend Engineer",
      company: "Northwind",
      workFormat: "hybrid",
      applicationStatus: "to_apply",
      matchScore: 86,
      saved: true,
      createdAt: "2026-10-12T00:00:00.000Z",
    }),
    job({
      id: "b",
      title: "Platform Engineer",
      company: "Cascade",
      workFormat: "remote",
      applicationStatus: "rejected",
      matchScore: 41,
      saved: true,
      createdAt: "2026-10-10T00:00:00.000Z",
    }),
    job({
      id: "c",
      title: "React Engineer",
      company: "Pixel",
      workFormat: "onsite",
      applicationStatus: null,
      matchScore: null,
      saved: false,
      createdAt: "2026-10-15T00:00:00.000Z",
    }),
  ];

  it("filters by search query", () => {
    const result = filterJobs(jobs, { query: "cascade" });
    expect(result.map((item) => item.id)).toEqual(["b"]);
  });

  it("filters by status including untracked", () => {
    expect(filterJobs(jobs, { status: "untracked" }).map((j) => j.id)).toEqual([
      "c",
    ]);
    expect(filterJobs(jobs, { status: "to_apply" }).map((j) => j.id)).toEqual([
      "a",
    ]);
  });

  it("filters strong matches and sorts by score", () => {
    const result = filterJobs(jobs, {
      strongMatchesOnly: true,
      sort: "match_desc",
    });
    expect(result.map((item) => item.id)).toEqual(["a"]);
  });

  it("sorts newest first by default", () => {
    expect(filterJobs(jobs).map((item) => item.id)).toEqual(["c", "a", "b"]);
  });

  it("filters by role focus using title/description keywords", () => {
    const mixed = [
      job({
        id: "fe",
        title: "Frontend React Engineer",
        description: "Build UI with React and Next.js",
        createdAt: "2026-10-16T00:00:00.000Z",
      }),
      job({
        id: "be",
        title: "Backend API Engineer",
        description: "Node.js services and PostgreSQL",
        createdAt: "2026-10-15T00:00:00.000Z",
      }),
    ];

    expect(
      filterJobs(mixed, { roleFocus: "frontend" }).map((j) => j.id),
    ).toEqual(["fe"]);
    expect(
      filterJobs(mixed, { roleFocus: "backend" }).map((j) => j.id),
    ).toEqual(["be"]);
  });
});
