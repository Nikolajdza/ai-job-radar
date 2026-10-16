import { z } from "zod";

/**
 * Structured LLM output for job–candidate matching.
 * Validated at runtime — never trust the model response as-is.
 */
export const jobAnalysisSchema = z.object({
  matchScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe(
      "Approximate heuristic fit from 0–100. Not a hiring probability.",
    ),
  matchingSkills: z
    .array(z.string().min(1).max(120))
    .max(30)
    .describe("Skills clearly supported by the candidate profile."),
  missingSkills: z
    .array(z.string().min(1).max(120))
    .max(30)
    .describe(
      "Skills required or strongly preferred by the job that are not demonstrated in the profile.",
    ),
  requiredQualifications: z
    .array(z.string().min(1).max(200))
    .max(20)
    .describe("Qualifications the job treats as required."),
  preferredQualifications: z
    .array(z.string().min(1).max(200))
    .max(20)
    .describe("Qualifications the job treats as nice-to-have."),
  seniorityCompatibility: z
    .string()
    .min(1)
    .max(500)
    .describe(
      "Whether the candidate's level appears compatible with the role seniority.",
    ),
  concerns: z
    .array(z.string().min(1).max(300))
    .max(15)
    .describe("Concrete risks or gaps based on available evidence."),
  uncertainties: z
    .array(z.string().min(1).max(300))
    .max(15)
    .describe(
      "Gaps where the profile does not provide enough information to judge.",
    ),
  explanation: z
    .string()
    .min(40)
    .max(2000)
    .describe("Concise explanation of the match score."),
  cvSuggestions: z
    .array(z.string().min(1).max(300))
    .max(10)
    .describe(
      "CV improvements grounded only in experience the candidate already has.",
    ),
});

export type JobAnalysisOutput = z.infer<typeof jobAnalysisSchema>;

export type StoredJobAnalysis = JobAnalysisOutput & {
  id: string;
  jobId: string;
  provider: string;
  model: string;
  createdAt: string;
  updatedAt: string;
};
