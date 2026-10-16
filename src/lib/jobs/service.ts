import { and, asc, eq, isNull, or } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { jobAnalyses, jobs, jobTracking } from "@/lib/db/schema";
import { buildJobDedupeKey } from "@/lib/jobs/dedupe";
import { mapJobRow } from "@/lib/mappers";
import { ForbiddenError } from "@/lib/errors";
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

/**
 * Public catalog + the viewer's private manual jobs, with the viewer's
 * tracking state and match score joined in.
 */
export async function listJobs(viewerId?: string | null): Promise<JobListing[]> {
  const db = getDb();

  if (!viewerId) {
    const rows = await db
      .select()
      .from(jobs)
      .where(isNull(jobs.ownerUserId))
      .orderBy(asc(jobs.createdAt));
    return rows.map((row) => mapJobRow(row));
  }

  const rows = await db
    .select({
      job: jobs,
      tracking: {
        applicationStatus: jobTracking.applicationStatus,
        saved: jobTracking.saved,
        notes: jobTracking.notes,
      },
      matchScore: jobAnalyses.matchScore,
    })
    .from(jobs)
    .leftJoin(
      jobTracking,
      and(eq(jobTracking.jobId, jobs.id), eq(jobTracking.userId, viewerId)),
    )
    .leftJoin(
      jobAnalyses,
      and(eq(jobAnalyses.jobId, jobs.id), eq(jobAnalyses.userId, viewerId)),
    )
    .where(or(isNull(jobs.ownerUserId), eq(jobs.ownerUserId, viewerId)))
    .orderBy(asc(jobs.createdAt));

  return rows.map((row) => mapJobRow(row.job, row.tracking, row.matchScore));
}

export async function getJobById(
  id: string,
  viewerId?: string | null,
): Promise<JobListing | null> {
  const db = getDb();

  const [row] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (!row) return null;
  if (row.ownerUserId && row.ownerUserId !== viewerId) return null;

  if (!viewerId) return mapJobRow(row);

  const [tracking] = await db
    .select()
    .from(jobTracking)
    .where(and(eq(jobTracking.jobId, id), eq(jobTracking.userId, viewerId)))
    .limit(1);
  const [analysis] = await db
    .select({ matchScore: jobAnalyses.matchScore })
    .from(jobAnalyses)
    .where(and(eq(jobAnalyses.jobId, id), eq(jobAnalyses.userId, viewerId)))
    .limit(1);

  return mapJobRow(row, tracking ?? null, analysis?.matchScore ?? null);
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
  ownerUserId?: string | null,
): Promise<{ job: JobListing; created: boolean }> {
  try {
    const job = await createJob(input, ownerUserId);
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

export async function createJob(
  input: CreateJobInput,
  ownerUserId?: string | null,
): Promise<JobListing> {
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
        ownerUserId: ownerUserId ?? null,
      })
      .returning();

    if (
      ownerUserId &&
      (input.applicationStatus || input.saved || input.notes)
    ) {
      await upsertTracking(row.id, ownerUserId, {
        applicationStatus: input.applicationStatus ?? null,
        saved: input.saved ?? false,
        notes: input.notes ?? null,
      });
    }

    return (await getJobById(row.id, ownerUserId)) ?? mapJobRow(row);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new JobConflictError();
    }
    throw error;
  }
}

/**
 * Tracking fields (status/saved/notes) are per user. Listing fields can only
 * be edited by the owner of a private manual job.
 */
export async function updateJob(
  id: string,
  input: UpdateJobInput,
  userId: string,
): Promise<JobListing> {
  const db = getDb();
  const [existing] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (!existing || (existing.ownerUserId && existing.ownerUserId !== userId)) {
    throw new JobNotFoundError();
  }

  const listingKeys = [
    "title",
    "company",
    "location",
    "workFormat",
    "salary",
    "description",
    "sourceUrl",
  ] as const;
  const touchesListing = listingKeys.some((key) => input[key] !== undefined);

  if (touchesListing) {
    if (existing.ownerUserId !== userId) {
      throw new ForbiddenError("Only manual jobs you created can be edited");
    }

    const patch: Partial<typeof jobs.$inferInsert> = { updatedAt: new Date() };
    if (input.title !== undefined) patch.title = input.title;
    if (input.company !== undefined) patch.company = input.company;
    if (input.location !== undefined) patch.location = input.location;
    if (input.workFormat !== undefined) patch.workFormat = input.workFormat;
    if (input.salary !== undefined) patch.salary = input.salary;
    if (input.description !== undefined) patch.description = input.description;
    if (input.sourceUrl !== undefined) patch.sourceUrl = input.sourceUrl;
    patch.dedupeKey = buildJobDedupeKey({
      company: input.company ?? existing.company,
      title: input.title ?? existing.title,
      sourceUrl: input.sourceUrl ?? existing.sourceUrl,
    });

    try {
      await db.update(jobs).set(patch).where(eq(jobs.id, id));
    } catch (error) {
      if (isUniqueViolation(error)) throw new JobConflictError();
      throw error;
    }
  }

  if (
    input.applicationStatus !== undefined ||
    input.saved !== undefined ||
    input.notes !== undefined
  ) {
    await upsertTracking(id, userId, {
      applicationStatus: input.applicationStatus,
      saved: input.saved,
      notes: input.notes,
    });
  }

  const job = await getJobById(id, userId);
  if (!job) throw new JobNotFoundError();
  return job;
}

async function upsertTracking(
  jobId: string,
  userId: string,
  patch: {
    applicationStatus?: JobListing["applicationStatus"];
    saved?: boolean;
    notes?: string | null;
  },
) {
  const db = getDb();
  const now = new Date();
  const set: Partial<typeof jobTracking.$inferInsert> = { updatedAt: now };
  if (patch.applicationStatus !== undefined) {
    set.applicationStatus = patch.applicationStatus;
  }
  if (patch.saved !== undefined) set.saved = patch.saved;
  if (patch.notes !== undefined) set.notes = patch.notes;

  await db
    .insert(jobTracking)
    .values({
      jobId,
      userId,
      applicationStatus: patch.applicationStatus ?? null,
      saved: patch.saved ?? false,
      notes: patch.notes ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [jobTracking.userId, jobTracking.jobId],
      set,
    });
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
