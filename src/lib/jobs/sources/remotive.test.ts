import { describe, expect, it } from "vitest";
import {
  mapRemotiveJobToCreateInput,
  stripHtml,
} from "@/lib/jobs/sources/remotive";

describe("stripHtml", () => {
  it("removes tags and collapses whitespace", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
  });
});

describe("mapRemotiveJobToCreateInput", () => {
  it("maps a Remotive job into our create payload with attribution URL", () => {
    const input = mapRemotiveJobToCreateInput({
      id: 1,
      url: "https://remotive.com/remote-jobs/software-dev/example-1",
      title: "Senior React Engineer",
      company_name: "Acme Remote",
      category: "Software Development",
      tags: ["react", "typescript"],
      candidate_required_location: "Europe",
      salary: "$100k",
      description: "<p>Build React apps with TypeScript and Next.js.</p>",
    });

    expect(input.source).toBe("remotive");
    expect(input.workFormat).toBe("remote");
    expect(input.sourceUrl).toContain("remotive.com");
    expect(input.description).toContain("React");
    expect(input.description).not.toContain("<p>");
  });
});
