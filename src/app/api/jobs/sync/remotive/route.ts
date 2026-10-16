import { handleRouteError, jsonOk } from "@/lib/api";
import { syncRemotiveJobs } from "@/lib/jobs/sources/remotive-sync";
import { z } from "zod";

const syncBodySchema = z
  .object({
    search: z.string().trim().min(2).max(120).optional(),
    limit: z.number().int().min(1).max(30).optional(),
  })
  .default({});

/**
 * Pull software-related remote jobs from Remotive into the local database.
 * Respect Remotive terms: store their URL and credit Remotive in the UI.
 */
export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => ({}));
    const body = syncBodySchema.parse(json);
    const result = await syncRemotiveJobs(body);
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
