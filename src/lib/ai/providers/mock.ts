import { jobAnalysisSchema } from "@/lib/ai/schema";
import type {
  AnalysisProvider,
  AnalysisProviderResult,
  AnalysisRequest,
} from "@/lib/ai/providers/types";

/**
 * Deterministic mock provider for local development and tests.
 * Compares profile skills to the job text — not a real ranking model.
 */
export const mockAnalysisProvider: AnalysisProvider = {
  name: "mock",

  async analyze(request: AnalysisRequest): Promise<AnalysisProviderResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const jobText = [
      request.job.title,
      request.job.description,
    ]
      .join("\n")
      .toLowerCase();

    const profileSkills = uniquePreferringLonger([
      ...request.profile.skills,
      ...request.profile.preferredTechnologies,
    ]);

    const candidateEvidence = [
      ...profileSkills,
      request.profile.experienceSummary,
      request.profile.headline,
      request.profile.cvText ?? "",
    ]
      .join("\n")
      .toLowerCase();

    const matchingSkills = profileSkills.filter((skill) =>
      includesSkill(jobText, skill),
    );

    // Skills mentioned in CV text that also appear in the job.
    for (const skill of TECH_KEYWORDS) {
      if (
        includesSkill(jobText, skill) &&
        includesSkill(candidateEvidence, skill) &&
        !matchingSkills.some((owned) => normalize(owned) === normalize(skill))
      ) {
        matchingSkills.push(skill);
      }
    }

    const missingSkills = TECH_KEYWORDS.filter(
      (skill) =>
        includesSkill(jobText, skill) &&
        !includesSkill(candidateEvidence, skill),
    ).slice(0, 8);

    const overlapRatio =
      matchingSkills.length /
      Math.max(matchingSkills.length + missingSkills.length, 1);

    const matchScore = Math.max(
      25,
      Math.min(
        92,
        Math.round(40 + overlapRatio * 45 + matchingSkills.length * 3),
      ),
    );

    const analysis = jobAnalysisSchema.parse({
      matchScore,
      matchingSkills,
      missingSkills,
      requiredQualifications: inferRequired(request.job.description),
      preferredQualifications: [
        "Production experience with modern TypeScript tooling",
        "Comfort collaborating with product and design",
      ],
      seniorityCompatibility: inferSeniority(
        request.job.title,
        request.profile.headline,
      ),
      concerns:
        missingSkills.length > 0
          ? [
              `The listing emphasizes ${missingSkills[0]}, which is not clearly listed in the candidate profile.`,
            ]
          : [],
      uncertainties: [
        "Mock analysis only checks skill-name overlap; depth and recency of experience were not evaluated.",
        "Years of experience are not quantified in the current profile schema.",
      ],
      explanation: `Mock heuristic score ${matchScore}/100 from skill overlap between your profile and the job text. Matched: ${
        matchingSkills.slice(0, 6).join(", ") || "none"
      }. This is not a hiring probability and does not call a real LLM.`,
      cvSuggestions: matchingSkills.slice(0, 3).map(
        (skill) =>
          `Call out concrete ${skill} outcomes already present in your experience when applying to roles like ${request.job.title}.`,
      ),
    });

    return {
      analysis,
      provider: "mock",
      model: "mock-overlap-v1",
    };
  },
};

const TECH_KEYWORDS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "PostgreSQL",
  "GraphQL",
  "REST",
  "Tailwind CSS",
  "Jest",
  "Playwright",
  "Cypress",
  "Vitest",
  "Redux",
  "Vue",
  "Angular",
  "Svelte",
  "CSS",
  "HTML",
  "Webpack",
  "Vite",
  "Kubernetes",
  "Terraform",
  "Docker",
  "Python",
  "Go",
  "Java",
  "AWS",
  "CI/CD",
  "LLM",
  "RAG",
  "Prisma",
  "Drizzle",
  "MongoDB",
  "Redis",
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+#.]/g, "");
}

function includesSkill(haystack: string, skill: string): boolean {
  const needle = skill.toLowerCase();
  if (haystack.includes(needle)) return true;

  const compactHaystack = haystack.replace(/[^a-z0-9+#.]/g, "");
  const compactNeedle = normalize(skill);
  return compactNeedle.length > 1 && compactHaystack.includes(compactNeedle);
}

function uniquePreferringLonger(values: string[]): string[] {
  const byKey = new Map<string, string>();
  for (const value of values) {
    const key = normalize(value);
    const existing = byKey.get(key);
    if (!existing || value.length > existing.length) {
      byKey.set(key, value);
    }
  }
  return [...byKey.values()];
}

function inferRequired(description: string): string[] {
  const required: string[] = [];
  const lower = description.toLowerCase();
  for (const skill of ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"]) {
    if (includesSkill(lower, skill)) required.push(skill);
  }
  if (required.length === 0) {
    required.push("Relevant production experience for the listed stack");
  }
  return required;
}

function inferSeniority(jobTitle: string, headline: string): string {
  const title = jobTitle.toLowerCase();
  const profile = headline.toLowerCase();
  if (title.includes("staff") || title.includes("principal")) {
    return "The role signals staff/principal scope; the profile reads as senior individual-contributor rather than staff leadership — compatibility is partial.";
  }
  if (title.includes("senior") || profile.includes("senior")) {
    return "Seniority appears broadly compatible based on title and headline wording.";
  }
  return "Seniority signals are limited; compatibility is uncertain without clearer level indicators.";
}
