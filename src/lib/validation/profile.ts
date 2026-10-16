import { z } from "zod";
import { WORK_FORMATS } from "@/lib/types/job";

const stringList = z
  .array(z.string().trim().min(1).max(100))
  .max(50)
  .default([]);

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  headline: z.string().trim().min(2).max(300),
  experienceSummary: z.string().trim().min(20).max(10_000),
  skills: stringList,
  preferredTechnologies: stringList,
  targetRoles: stringList,
  locationPreferences: stringList,
  workFormatPreferences: z.array(z.enum(WORK_FORMATS)).max(3).default([]),
  salaryExpectation: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  cvText: z
    .string()
    .trim()
    .max(50_000)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
