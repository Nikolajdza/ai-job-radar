import { z } from "zod";
import { WORK_FORMATS } from "@/lib/types/job";

const stringList = z.array(z.string().trim().min(1).max(100)).max(40);

/**
 * Structured profile fields extracted from CV text.
 * Never invent facts — only use what the CV supports.
 */
export const cvExtractSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  headline: z.string().trim().min(2).max(300),
  experienceSummary: z.string().trim().min(20).max(10_000),
  skills: stringList,
  preferredTechnologies: stringList,
  targetRoles: stringList,
  locationPreferences: stringList,
  workFormatPreferences: z.array(z.enum(WORK_FORMATS)).max(3),
  salaryExpectation: z.string().trim().max(100).nullable(),
  notesForUser: z
    .string()
    .max(1000)
    .describe("Short note about uncertainties or fields left empty on purpose."),
});

export type CvExtractOutput = z.infer<typeof cvExtractSchema>;
