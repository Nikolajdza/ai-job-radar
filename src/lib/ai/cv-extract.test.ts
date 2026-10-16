import { describe, expect, it } from "vitest";
import { extractProfileFromCv } from "@/lib/ai/cv-extract";

describe("extractProfileFromCv (mock)", () => {
  it("extracts skills and a summary from CV text", async () => {
    const cvText = `
Nikola Buljčik
Frontend Engineer

Summary
Production React and Next.js engineer with TypeScript, GraphQL, and Playwright testing experience. Based in Belgrade, open to remote roles.

Skills
React, Next.js, TypeScript, Node.js, PostgreSQL
`;

    const result = await extractProfileFromCv(cvText);

    expect(result.provider).toBe("mock");
    expect(result.extraction.fullName).toContain("Nikola");
    expect(result.extraction.skills).toEqual(
      expect.arrayContaining(["React", "Next.js", "TypeScript"]),
    );
    expect(result.extraction.experienceSummary.length).toBeGreaterThan(20);
    expect(result.extraction.notesForUser.length).toBeGreaterThan(10);
  });

  it("rejects very short CV text", async () => {
    await expect(extractProfileFromCv("too short")).rejects.toMatchObject({
      name: "AiValidationError",
    });
  });
});
