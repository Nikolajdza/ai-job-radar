import { z } from "zod";
import {
  COVER_LETTER_LANGUAGES,
  COVER_LETTER_TONES,
} from "@/lib/ai/cover-letter";
import { handleRouteError, jsonOk } from "@/lib/api";
import {
  generateAndSaveCoverLetter,
  getCoverLetter,
  saveCoverLetterEdits,
} from "@/lib/cover-letters/service";
import { requireRequestUser } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const generateSchema = z.object({
  tone: z.enum(COVER_LETTER_TONES).default("professional"),
  language: z.enum(COVER_LETTER_LANGUAGES).default("en"),
  extraNotes: z.string().trim().max(2000).optional().nullable(),
});

const editSchema = z.object({
  subject: z.string().trim().min(1).max(300),
  content: z.string().trim().min(20).max(12_000),
});

export async function GET(request: Request, context: RouteContext) {
  try {
    const viewer = await requireRequestUser(request);
    const { id } = await context.params;
    return jsonOk({ coverLetter: await getCoverLetter(id, viewer.id) });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** Generate (or regenerate) a tailored letter with the configured AI. */
export async function POST(request: Request, context: RouteContext) {
  try {
    const viewer = await requireRequestUser(request);
    const { id } = await context.params;
    const body = generateSchema.parse(await request.json().catch(() => ({})));
    const coverLetter = await generateAndSaveCoverLetter({
      jobId: id,
      userId: viewer.id,
      ...body,
    });
    return jsonOk({ coverLetter });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** Save the user's manual edits. */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const viewer = await requireRequestUser(request);
    const { id } = await context.params;
    const body = editSchema.parse(await request.json());
    const coverLetter = await saveCoverLetterEdits({
      jobId: id,
      userId: viewer.id,
      ...body,
    });
    return jsonOk({ coverLetter });
  } catch (error) {
    return handleRouteError(error);
  }
}
