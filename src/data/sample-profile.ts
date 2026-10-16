import type { UpdateProfileInput } from "@/lib/validation/profile";

/** Seed profile for local development — edit via /profile in the UI. */
export const sampleProfile: UpdateProfileInput = {
  fullName: "Nikola Buljčik",
  headline: "Frontend Engineer expanding into AI application development",
  experienceSummary:
    "Several years building production web apps with React, Next.js, and TypeScript. Experienced with component architecture, state management, REST/GraphQL integration, and frontend testing. Currently learning LLM integrations, structured AI outputs, and workflow automation while staying focused on shipping useful applications rather than ML research.",
  skills: [
    "React",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Tailwind CSS",
    "Node.js",
    "REST APIs",
    "GraphQL",
    "Jest",
    "Playwright",
  ],
  preferredTechnologies: [
    "TypeScript",
    "Next.js",
    "PostgreSQL",
    "Vercel AI SDK",
  ],
  targetRoles: [
    "Frontend Engineer",
    "Full-Stack Engineer",
    "AI Application Engineer",
  ],
  locationPreferences: ["Remote (EU)", "Hybrid (EU)", "Zagreb"],
  workFormatPreferences: ["remote", "hybrid"],
  salaryExpectation: "Competitive EU market rate",
};
