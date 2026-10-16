import { and, eq } from "drizzle-orm";
import {
  generateCoverLetter,
  type CoverLetterLanguage,
  type CoverLetterTone,
} from "@/lib/ai/cover-letter";
import type { StoredCoverLetter } from "@/lib/cover-letters/types";
import { getDb } from "@/lib/db";
import { coverLetters } from "@/lib/db/schema";
import { ProfileIncompleteError } from "@/lib/errors";
import { JobNotFoundError, getJobById } from "@/lib/jobs/service";
import { mapCoverLetterRow } from "@/lib/mappers";
import { hasAiReadyProfile } from "@/lib/profile/completeness";
import { getProfileByUserId } from "@/lib/profile/service";

export async function getCoverLetter(
  jobId: string,
  userId: string,
): Promise<StoredCoverLetter | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(coverLetters)
    .where(and(eq(coverLetters.jobId, jobId), eq(coverLetters.userId, userId)))
    .limit(1);
  return row ? mapCoverLetterRow(row) : null;
}

export async function generateAndSaveCoverLetter(input: {
  jobId: string;
  userId: string;
  tone: CoverLetterTone;
  language: CoverLetterLanguage;
  extraNotes?: string | null;
}): Promise<StoredCoverLetter> {
  const job = await getJobById(input.jobId, input.userId);
  if (!job) throw new JobNotFoundError();

  const profile = await getProfileByUserId(input.userId);
  if (!profile || !hasAiReadyProfile(profile)) {
    throw new ProfileIncompleteError();
  }

  const result = await generateCoverLetter({
    profile,
    job,
    tone: input.tone,
    language: input.language,
    extraNotes: input.extraNotes,
  });

  const db = getDb();
  const now = new Date();
  const values = {
    subject: result.output.subject,
    content: result.output.coverLetter,
    highlights: result.output.highlights,
    tone: input.tone,
    language: input.language,
    provider: result.provider,
    model: result.model,
    updatedAt: now,
  };

  const [row] = await db
    .insert(coverLetters)
    .values({
      jobId: input.jobId,
      userId: input.userId,
      createdAt: now,
      ...values,
    })
    .onConflictDoUpdate({
      target: [coverLetters.jobId, coverLetters.userId],
      set: values,
    })
    .returning();

  return mapCoverLetterRow(row);
}

export async function saveCoverLetterEdits(input: {
  jobId: string;
  userId: string;
  subject: string;
  content: string;
}): Promise<StoredCoverLetter> {
  const existing = await getCoverLetter(input.jobId, input.userId);
  const db = getDb();
  const now = new Date();

  if (!existing) {
    const job = await getJobById(input.jobId, input.userId);
    if (!job) throw new JobNotFoundError();
    const [row] = await db
      .insert(coverLetters)
      .values({
        jobId: input.jobId,
        userId: input.userId,
        subject: input.subject,
        content: input.content,
        highlights: [],
        tone: "professional",
        language: "en",
        provider: "manual",
        model: "manual",
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return mapCoverLetterRow(row);
  }

  const [row] = await db
    .update(coverLetters)
    .set({ subject: input.subject, content: input.content, updatedAt: now })
    .where(eq(coverLetters.id, existing.id))
    .returning();
  return mapCoverLetterRow(row);
}
