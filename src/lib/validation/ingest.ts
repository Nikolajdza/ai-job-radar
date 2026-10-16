import { z } from "zod";
import { createJobSchema } from "@/lib/validation/job";

export const ingestJobSchema = createJobSchema
  .omit({ applicationStatus: true, notes: true })
  .extend({
    /** Run AI analysis after persist. Defaults to true. */
    analyze: z.boolean().optional().default(true),
    /** Re-run analysis even if one already exists. Defaults to false. */
    forceAnalyze: z.boolean().optional().default(false),
    saved: z.boolean().optional().default(true),
  });

export type IngestJobInput = z.infer<typeof ingestJobSchema>;
