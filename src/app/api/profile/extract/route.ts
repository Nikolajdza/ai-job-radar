import { extractProfileFromCv } from "@/lib/ai/cv-extract";
import { handleRouteError, jsonOk } from "@/lib/api";
import { z } from "zod";

const bodySchema = z.object({
  cvText: z.string().trim().min(40).max(50_000),
});

/**
 * Extract structured profile fields from pasted CV text.
 * Does not auto-save — the UI should let the user review first.
 */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { cvText } = bodySchema.parse(json);
    const result = await extractProfileFromCv(cvText);
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
