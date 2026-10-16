import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { catalogSyncs } from "@/lib/db/schema";

/** Remotive rows inserted at or after this instant belong to the latest refresh. */
export function isFromLatestSync(
  job: { source: string; createdAt: string },
  syncStartedAt: Date | null,
): boolean {
  if (!syncStartedAt || job.source !== "remotive") return false;
  return Date.parse(job.createdAt) >= syncStartedAt.getTime();
}

export async function latestRemotiveSyncStart(): Promise<Date | null> {
  try {
    const db = getDb();
    const [row] = await db
      .select({ startedAt: catalogSyncs.startedAt })
      .from(catalogSyncs)
      .where(eq(catalogSyncs.source, "remotive"))
      .orderBy(desc(catalogSyncs.startedAt))
      .limit(1);
    return row?.startedAt ?? null;
  } catch (error) {
    if (isMissingRelation(error)) return null;
    throw error;
  }
}

export function isMissingRelation(error: unknown): boolean {
  let current: unknown = error;
  while (current && typeof current === "object") {
    if ("code" in current && (current as { code?: string }).code === "42P01") {
      return true;
    }
    current = "cause" in current ? (current as { cause?: unknown }).cause : undefined;
  }
  return false;
}
