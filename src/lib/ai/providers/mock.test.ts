import { describe, expect, it } from "vitest";
import { mockAnalysisProvider } from "@/lib/ai/providers/mock";
import { makeJob, makeProfile } from "@/test/fixtures";

describe("mockAnalysisProvider", () => {
  it("returns schema-valid analysis with provider metadata", async () => {
    const result = await mockAnalysisProvider.analyze({
      profile: makeProfile(),
      job: makeJob(),
    });

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
