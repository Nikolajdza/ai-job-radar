import { describe, expect, it } from "vitest";
import { jobAnalysisSchema } from "@/lib/ai/schema";

describe("jobAnalysisSchema", () => {
  it("accepts a complete analysis object", () => {
    const parsed = jobAnalysisSchema.parse({
      matchScore: 81,
      matchingSkills: ["TypeScript"],
      missingSkills: ["Kubernetes"],
      requiredQualifications: ["TypeScript"],
      preferredQualifications: ["GraphQL"],
      seniorityCompatibility: "Broadly compatible with senior IC scope.",
      concerns: ["Limited cloud infrastructure evidence"],
      uncertainties: ["Years of experience are not quantified"],
      explanation:
        "Heuristic overlap suggests a strong frontend fit with some platform gaps.",
      cvSuggestions: ["Emphasize TypeScript delivery outcomes already listed"],
    });

    expect(parsed.matchScore).toBe(81);
  });

  it("rejects out-of-range scores", () => {
    const result = jobAnalysisSchema.safeParse({
      matchScore: 140,
      matchingSkills: [],
      missingSkills: [],
      requiredQualifications: [],
      preferredQualifications: [],
      seniorityCompatibility: "Unknown",
      concerns: [],
      uncertainties: [],
      explanation: "Too short",
      cvSuggestions: [],
    });

    expect(result.success).toBe(false);
  });
});
