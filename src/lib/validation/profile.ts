import { z } from "zod";
import { WORK_FORMATS } from "@/lib/types/job";

const stringList = z
  .array(z.string().trim().min(1).max(100))
  .max(50)
  .default([]);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null));

/** Accept "github.com/me" style input and normalize to https URLs. */
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) return null;
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  })
  .refine(
    (value) => value === null || z.string().url().safeParse(value).success,
    { message: "Enter a valid URL" },
  );

/** Small client-resized data URL or a remote https image. */
const avatarUrl = z
  .string()
  .max(400_000, "Image is too large — try a smaller photo")
  .optional()
  .nullable()
  .transform((value) => (value ? value : null))
  .refine(
    (value) =>
      value === null ||
      value.startsWith("data:image/") ||
      value.startsWith("https://"),
    { message: "Avatar must be an image" },
  );

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Add your full name").max(200),
  headline: z.string().trim().max(300).default(""),
  bio: optionalText(1500),
  avatarUrl,
  currentLocation: optionalText(200),
  yearsOfExperience: z
    .number()
    .int()
    .min(0)
    .max(60)
    .optional()
    .nullable()
    .transform((value) => (value === undefined ? null : value)),
  openToWork: z.boolean().default(true),
  linkedinUrl: optionalUrl,
  githubUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  experienceSummary: z.string().trim().max(10_000).default(""),
  skills: stringList,
  preferredTechnologies: stringList,
  targetRoles: stringList,
  locationPreferences: stringList,
  workFormatPreferences: z.array(z.enum(WORK_FORMATS)).max(3).default([]),
  salaryExpectation: optionalText(100),
  cvText: optionalText(50_000),
  cvFileName: optionalText(255),
});

export type UpdateProfileInput = z.input<typeof updateProfileSchema>;
export type ParsedProfileInput = z.output<typeof updateProfileSchema>;
