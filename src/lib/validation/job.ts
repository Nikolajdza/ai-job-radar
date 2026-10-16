import { z } from "zod";
import { APPLICATION_STATUSES, WORK_FORMATS } from "@/lib/types/job";

export const createJobSchema = z.object({
  title: z.string().trim().min(2).max(200),
  company: z.string().trim().min(2).max(200),
  location: z.string().trim().min(2).max(200),
  workFormat: z.enum(WORK_FORMATS),
  salary: z
    .string()
    .trim()
    .max(100)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
  description: z.string().trim().min(20).max(50_000),
  sourceUrl: z.string().trim().url().max(2000),
  source: z.enum(["manual", "remotive", "n8n"]).optional().default("manual"),
  applicationStatus: z.enum(APPLICATION_STATUSES).optional().nullable(),
  saved: z.boolean().optional().default(false),
  notes: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
});

export const updateJobSchema = z
  .object({
    title: z.string().trim().min(2).max(200).optional(),
    company: z.string().trim().min(2).max(200).optional(),
    location: z.string().trim().min(2).max(200).optional(),
    workFormat: z.enum(WORK_FORMATS).optional(),
    salary: z
      .string()
      .trim()
      .max(100)
      .nullable()
      .optional()
      .transform((value) => (value === undefined ? undefined : value || null)),
    description: z.string().trim().min(20).max(20_000).optional(),
    sourceUrl: z.string().trim().url().max(2000).optional(),
    applicationStatus: z.enum(APPLICATION_STATUSES).nullable().optional(),
    saved: z.boolean().optional(),
    notes: z
      .string()
      .trim()
      .max(5000)
      .nullable()
      .optional()
      .transform((value) => (value === undefined ? undefined : value || null)),
    matchScore: z.number().int().min(0).max(100).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
