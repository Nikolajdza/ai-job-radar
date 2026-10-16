import { describe, expect, it } from "vitest";
import {
  isSoftwareRelated,
  mapRemotiveJobToCreateInput,
  matchesFocus,
  stripHtml,
  type RemotiveJob,
} from "@/lib/jobs/sources/remotive";

function sampleJob(overrides: Partial<RemotiveJob> = {}): RemotiveJob {
  return {
    id: 1,
    url: "https://remotive.com/remote-jobs/software-dev/example-1",
    title: "Senior React Engineer",
    company_name: "Acme Remote",
    category: "Software Development",
    tags: ["react", "typescript"],
    candidate_required_location: "Europe",
    salary: "$100k",
    description: "<p>Build React apps with TypeScript and Next.js.</p>",
    ...overrides,
  };
}

describe("stripHtml", () => {
  it("removes tags and collapses whitespace", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
  });
});

describe("mapRemotiveJobToCreateInput", () => {
  it("maps a Remotive job into our create payload with attribution URL", () => {
    const input = mapRemotiveJobToCreateInput(sampleJob());

    expect(input.source).toBe("remotive");
    expect(input.workFormat).toBe("remote");
    expect(input.sourceUrl).toContain("remotive.com");
    expect(input.description).toContain("React");
    expect(input.description).not.toContain("<p>");
  });
});

describe("Remotive focus filters", () => {
  it("keeps software categories and drops unrelated roles", () => {
    expect(isSoftwareRelated(sampleJob())).toBe(true);
    expect(
      isSoftwareRelated(
        sampleJob({
          title: "Remote Customer Support",
          category: "Customer Service",
          tags: ["support"],
        }),
      ),
    ).toBe(false);
  });

  it("narrows frontend vs backend by title/tags", () => {
    const frontend = sampleJob({ title: "Frontend React Engineer" });
    const backend = sampleJob({
      title: "Backend Node.js Engineer",
      tags: ["nodejs", "postgresql"],
    });

    expect(matchesFocus(frontend, "frontend")).toBe(true);
    expect(matchesFocus(frontend, "backend")).toBe(false);
    expect(matchesFocus(backend, "backend")).toBe(true);
    expect(matchesFocus(backend, "software")).toBe(true);
  });
});
