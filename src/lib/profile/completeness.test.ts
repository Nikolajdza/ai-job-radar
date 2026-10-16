import { describe, expect, it } from "vitest";
import { getProfileCompleteness, hasAiReadyProfile } from "@/lib/profile/completeness";
import { makeProfile } from "@/test/fixtures";

describe("getProfileCompleteness", () => {
  it("reports missing items for a fresh profile", () => {
    const result = getProfileCompleteness(
      makeProfile({
        headline: "",
        currentLocation: null,
        experienceSummary: "",
        skills: [],
        targetRoles: [],
        cvText: null,
      }),
    );

    expect(result.percent).toBe(0);
    expect(result.missing.map((item) => item.key)).toContain("cv");
  });

  it("reaches 100% when every section is filled", () => {
    const result = getProfileCompleteness(
      makeProfile({
        avatarUrl: "data:image/jpeg;base64,abc",
        bio: "I build fast, accessible web apps.",
        skills: ["React", "Next.js", "TypeScript", "Node.js", "CSS"],
        experienceSummary:
          "Four years building production React dashboards and design systems.",
        githubUrl: "https://github.com/me",
      }),
    );

    expect(result.percent).toBe(100);
    expect(result.missing).toHaveLength(0);
  });
});

describe("hasAiReadyProfile", () => {
  it("needs skills, CV text, or a real summary", () => {
    expect(
      hasAiReadyProfile({ skills: [], cvText: null, experienceSummary: "" }),
    ).toBe(false);
    expect(
      hasAiReadyProfile({ skills: ["React"], cvText: null, experienceSummary: "" }),
    ).toBe(true);
  });
});
