import { describe, expect, it } from "vitest";
import { buildMockCoverLetter, coverLetterSchema } from "@/lib/ai/cover-letter";
import { makeJob, makeProfile } from "@/test/fixtures";

describe("buildMockCoverLetter", () => {
  it("produces a schema-valid English letter grounded in matching skills", () => {
    const output = buildMockCoverLetter({
      profile: makeProfile(),
      job: makeJob(),
      tone: "professional",
      language: "en",
    });

    expect(() => coverLetterSchema.parse(output)).not.toThrow();
    expect(output.coverLetter).toContain("Dear Northwind team");
    expect(output.coverLetter).toContain("Nikola Buljčik");
    expect(output.coverLetter).toContain("React");
    expect(output.subject).toContain("Senior Frontend Engineer");
  });

  it("writes Serbian when requested and keeps at least two highlights", () => {
    const output = buildMockCoverLetter({
      profile: makeProfile({ skills: ["Vue"], preferredTechnologies: [] }),
      job: makeJob(),
      tone: "concise",
      language: "sr",
    });

    expect(output.coverLetter).toContain("Poštovani");
    expect(output.highlights.length).toBeGreaterThanOrEqual(2);
    expect(() => coverLetterSchema.parse(output)).not.toThrow();
  });
});
