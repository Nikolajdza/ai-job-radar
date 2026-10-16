import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { createJobIdempotent, getJobById } from "@/lib/jobs/service";
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
  focus: RemotiveFocus;
  jobs: JobListing[];
  attribution: string;
};

export async function syncRemotiveJobs(options?: {
  search?: string;
  focus?: RemotiveFocus;
  limit?: number;
}): Promise<RemotiveSyncResult> {
  const focus = options?.focus ?? "software";
  const remoteJobs = await fetchRemotiveJobs({
    search: options?.search,
    focus,
    limit: options?.limit ?? 60,
  });
  const createdJobs: JobListing[] = [];
  let created = 0;
  let skippedDuplicates = 0;
  const db = getDb();

  for (const remoteJob of remoteJobs) {
    const input = mapRemotiveJobToCreateInput(remoteJob);
    const result = await createJobIdempotent(input);

    // Ensure attribution source even if a stale schema defaulted the column.
    await db
      .update(jobs)
      .set({ source: "remotive", updatedAt: new Date() })
      .where(eq(jobs.id, result.job.id));

    const fresh = (await getJobById(result.job.id)) ?? {
      ...result.job,
      source: "remotive",
    };

    if (result.created) {
      created += 1;
      createdJobs.push(fresh);
    } else {
      skippedDuplicates += 1;
    }
  }

  return {
    fetched: remoteJobs.length,
    created,
    skippedDuplicates,
    focus,
    jobs: createdJobs,
    attribution:
      "Job listings sourced from Remotive. Each listing links back to its Remotive URL.",
  };
}
