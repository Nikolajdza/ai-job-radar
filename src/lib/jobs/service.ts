import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { buildJobDedupeKey } from "@/lib/jobs/dedupe";
import { mapJobRow } from "@/lib/mappers";
import type { JobListing } from "@/lib/types/job";
import type { CreateJobInput, UpdateJobInput } from "@/lib/validation/job";

export class JobConflictError extends Error {
  constructor(
    message = "A job with the same company, title, and source already exists",
  ) {
    super(message);
    this.name = "JobConflictError";
  }
}

export class JobNotFoundError extends Error {
  constructor(message = "Job not found") {
    super(message);
    this.name = "JobNotFoundError";
  }
}

export async function listJobs(): Promise<JobListing[]> {
  const db = getDb();
  const rows = await db.select().from(jobs).orderBy(asc(jobs.createdAt));
  return rows.map(mapJobRow);
}

export async function getJobById(id: string): Promise<JobListing | null> {
  const db = getDb();
  const [row] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return row ? mapJobRow(row) : null;
}

export async function getJobByDedupeKey(
  dedupeKey: string,
): Promise<JobListing | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(jobs)
    .where(eq(jobs.dedupeKey, dedupeKey))
    .limit(1);
  return row ? mapJobRow(row) : null;
}

/** Create a job, or return the existing one when the dedupe key already exists. */
export async function createJobIdempotent(
  input: CreateJobInput,
): Promise<{ job: JobListing; created: boolean }> {
  try {
    const job = await createJob(input);
    return { job, created: true };
  } catch (error) {
    if (!(error instanceof JobConflictError)) {
      throw error;
    }

    const dedupeKey = buildJobDedupeKey({
      company: input.company,
      title: input.title,
      sourceUrl: input.sourceUrl,
    });
    const existing = await getJobByDedupeKey(dedupeKey);
    if (!existing) {
      throw error;
    }
    return { job: existing, created: false };
  }
}

export async function createJob(input: CreateJobInput): Promise<JobListing> {
  const db = getDb();
  const dedupeKey = buildJobDedupeKey({
    company: input.company,
    title: input.title,
    sourceUrl: input.sourceUrl,
  });

  try {
    const [row] = await db
      .insert(jobs)
      .values({
        title: input.title,
        company: input.company,
        location: input.location,
        workFormat: input.workFormat,
        salary: input.salary,
        description: input.description,
        sourceUrl: input.sourceUrl,
        source: input.source ?? "manual",
        dedupeKey,
        applicationStatus: input.applicationStatus ?? null,
        saved: input.saved ?? false,
        notes: input.notes ?? null,
      })
      .returning();

    return mapJobRow(row);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new JobConflictError();
    }
    throw error;
  }
}

export async function updateJob(
  id: string,
  input: UpdateJobInput,
): Promise<JobListing> {
  const db = getDb();
  const existing = await getJobById(id);
  if (!existing) {
    throw new JobNotFoundError();
  }

  const nextTitle = input.title ?? existing.title;
  const nextCompany = input.company ?? existing.company;
  const nextSourceUrl = input.sourceUrl ?? existing.sourceUrl;
  const shouldRefreshDedupe =
    input.title !== undefined ||
    input.company !== undefined ||
    input.sourceUrl !== undefined;

  const patch: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (input.title !== undefined) patch.title = input.title;
  if (input.company !== undefined) patch.company = input.company;
  if (input.location !== undefined) patch.location = input.location;
  if (input.workFormat !== undefined) patch.workFormat = input.workFormat;
  if (input.salary !== undefined) patch.salary = input.salary;
  if (input.description !== undefined) patch.description = input.description;
  if (input.sourceUrl !== undefined) patch.sourceUrl = input.sourceUrl;
  if (input.applicationStatus !== undefined) {
    patch.applicationStatus = input.applicationStatus;
  }
  if (input.saved !== undefined) patch.saved = input.saved;
  if (input.notes !== undefined) patch.notes = input.notes;
  if (input.matchScore !== undefined) patch.matchScore = input.matchScore;
  if (shouldRefreshDedupe) {
    patch.dedupeKey = buildJobDedupeKey({
      company: nextCompany,
      title: nextTitle,
      sourceUrl: nextSourceUrl,
    });
  }

  try {
    const [row] = await db
      .update(jobs)
      .set(patch)
      .where(eq(jobs.id, id))
      .returning();

    if (!row) {
      throw new JobNotFoundError();
    }

    return mapJobRow(row);
  } catch (error) {
    if (error instanceof JobNotFoundError) throw error;
    if (isUniqueViolation(error)) {
      throw new JobConflictError();
    }
    throw error;
  }
}

function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;

  while (current && typeof current === "object") {
    if ("code" in current && (current as { code?: string }).code === "23505") {
      return true;
    }
    current =
      "cause" in current ? (current as { cause?: unknown }).cause : undefined;
  }

  return false;
}
