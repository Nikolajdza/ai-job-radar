import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { catalogSyncs, coverLetters, jobAnalyses, jobs, jobTracking } from "@/lib/db/schema";
import { buildJobDedupeKey } from "@/lib/jobs/dedupe";
import { isMissingRelation } from "@/lib/jobs/freshness";
import {
  fetchRemotiveJobs,
  mapRemotiveJobToCreateInput,
  type RemotiveFocus,
} from "@/lib/jobs/sources/remotive";
import type { JobListing } from "@/lib/types/job";

export type RemotiveSyncResult = {
  fetched: number;
  created: number;
  skippedDuplicates: number;
  /** Remotive listings that left the board and had no saved user work. */
  removed: number;
  focus: RemotiveFocus;
  jobs: JobListing[];
  attribution: string;
};

const INSERT_CHUNK = 40;

/** Refuse to wipe the catalog if Remotive returns a suspiciously small board. */
const MIN_BOARD_FOR_PRUNE = 20;

/**
 * Pull the current Remotive board and insert jobs we do not already have.
 * Inserts run in batches so a full software board stays inside a serverless limit.
 */
export async function syncRemotiveJobs(options?: {
  search?: string;
  focus?: RemotiveFocus;
  limit?: number;
}): Promise<RemotiveSyncResult> {
  const focus = options?.focus ?? "software";
  const remoteJobs = await fetchRemotiveJobs({
    search: options?.search,
    focus,
    limit: options?.limit,
  });

  const pending = new Map<
    string,
    typeof jobs.$inferInsert
  >();

  for (const remoteJob of remoteJobs) {
    const input = mapRemotiveJobToCreateInput(remoteJob);
    const dedupeKey = buildJobDedupeKey({
      company: input.company,
      title: input.title,
      sourceUrl: input.sourceUrl,
    });
    if (pending.has(dedupeKey)) continue;
    pending.set(dedupeKey, {
      title: input.title,
      company: input.company,
      location: input.location,
      workFormat: input.workFormat,
      salary: input.salary,
      description: input.description,
      sourceUrl: input.sourceUrl,
      source: "remotive",
      dedupeKey,
    });
  }

  const db = getDb();
  const tracksCatalog = options?.limit === undefined && !options?.search?.trim();
  let syncId: string | null = null;
  if (tracksCatalog) {
    try {
      const [sync] = await db
        .insert(catalogSyncs)
        .values({
          source: "remotive",
          startedAt: sql`now()`,
          createdCount: 0,
        })
        .returning({ id: catalogSyncs.id });
      syncId = sync?.id ?? null;
    } catch (error) {
      if (!isMissingRelation(error)) throw error;
    }
  }

  const keys = [...pending.keys()];
  const existing = new Set<string>();

  for (let index = 0; index < keys.length; index += INSERT_CHUNK) {
    const chunk = keys.slice(index, index + INSERT_CHUNK);
    const rows = await db
      .select({ dedupeKey: jobs.dedupeKey })
      .from(jobs)
      .where(inArray(jobs.dedupeKey, chunk));
    for (const row of rows) existing.add(row.dedupeKey);
  }

  const toInsert = [...pending.entries()]
    .filter(([key]) => !existing.has(key))
    .map(([, row]) => row);

  let created = 0;
  for (let index = 0; index < toInsert.length; index += INSERT_CHUNK) {
    const inserted = await db
      .insert(jobs)
      .values(toInsert.slice(index, index + INSERT_CHUNK))
      .onConflictDoNothing({ target: jobs.dedupeKey })
      .returning({ id: jobs.id });
    created += inserted.length;
  }

  if (syncId) {
    await db
      .update(catalogSyncs)
      .set({ createdCount: created })
      .where(eq(catalogSyncs.id, syncId));
  }

  const removed = await removeStaleRemotiveJobs(db, {
    freshKeys: new Set(pending.keys()),
    prune:
      focus === "software" &&
      !options?.search &&
      options?.limit === undefined &&
      pending.size >= MIN_BOARD_FOR_PRUNE,
  });

  return {
    fetched: remoteJobs.length,
    created,
    skippedDuplicates: remoteJobs.length - created,
    removed,
    focus,
    jobs: [],
    attribution:
      "Job listings sourced from Remotive. Each listing links back to its Remotive URL.",
  };
}

/**
 * Drop public Remotive rows that are no longer on the board.
 * A job stays when anyone has tracking, an analysis, or a cover letter for it,
 * because those rows are deleted together with the job.
 */
export async function removeStaleRemotiveJobs(
  db: ReturnType<typeof getDb>,
  input: { freshKeys: Set<string>; prune: boolean },
): Promise<number> {
  if (!input.prune) return 0;

  const stored = await db
    .select({ id: jobs.id, dedupeKey: jobs.dedupeKey })
    .from(jobs)
    .where(and(eq(jobs.source, "remotive"), isNull(jobs.ownerUserId)));

  const staleIds = stored
    .filter((row) => !input.freshKeys.has(row.dedupeKey))
    .map((row) => row.id);
  if (staleIds.length === 0) return 0;

  const protectedIds = new Set<string>();
  for (let index = 0; index < staleIds.length; index += INSERT_CHUNK) {
    const chunk = staleIds.slice(index, index + INSERT_CHUNK);
    const [tracked, analyzed, letters] = await Promise.all([
      db
        .select({ jobId: jobTracking.jobId })
        .from(jobTracking)
        .where(inArray(jobTracking.jobId, chunk)),
      db
        .select({ jobId: jobAnalyses.jobId })
        .from(jobAnalyses)
        .where(inArray(jobAnalyses.jobId, chunk)),
      db
        .select({ jobId: coverLetters.jobId })
        .from(coverLetters)
        .where(inArray(coverLetters.jobId, chunk)),
    ]);
    for (const row of [...tracked, ...analyzed, ...letters]) {
      protectedIds.add(row.jobId);
    }
  }

  const dropIds = staleIds.filter((id) => !protectedIds.has(id));
  let removed = 0;
  for (let index = 0; index < dropIds.length; index += INSERT_CHUNK) {
    const chunk = dropIds.slice(index, index + INSERT_CHUNK);
    const deleted = await db
      .delete(jobs)
      .where(inArray(jobs.id, chunk))
      .returning({ id: jobs.id });
    removed += deleted.length;
  }
  return removed;
}
