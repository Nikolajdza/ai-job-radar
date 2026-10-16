import { extractProfileFromCv } from "@/lib/ai/cv-extract";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { extractPdfText } from "@/lib/cv/pdf";
import { requireRequestUser } from "@/lib/session";

/**
 * Upload a PDF CV → extract text → AI fills profile fields.
 * Nothing is saved; the profile editor lets the user review first.
 */
export async function POST(request: Request) {
  try {
    await requireRequestUser(request);
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return jsonError("Attach a PDF file in the `file` field", 400);
    }

    const cvText = await extractPdfText(file);
    const result = await extractProfileFromCv(cvText);

    return jsonOk({ ...result, cvText, fileName: file.name.slice(0, 255) });
  } catch (error) {
    return handleRouteError(error);
  }
}
