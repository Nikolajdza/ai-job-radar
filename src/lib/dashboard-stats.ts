import type { JobListing } from "@/lib/types/job";

export type DashboardStats = {
  savedJobs: number;
  applications: number;
  interviews: number;
  strongMatches: number;
};

/** Strong match threshold used for dashboard summary cards (heuristic). */
export const STRONG_MATCH_THRESHOLD = 75;

export function getDashboardStats(jobs: JobListing[]): DashboardStats {
  return {
    savedJobs: jobs.filter((job) => job.saved).length,
    applications: jobs.filter(
      (job) =>
        job.applicationStatus === "applied" ||
        job.applicationStatus === "interview" ||
        job.applicationStatus === "offer",
    ).length,
    interviews: jobs.filter((job) => job.applicationStatus === "interview")
      .length,
    strongMatches: jobs.filter(
      (job) =>
        job.matchScore !== null && job.matchScore >= STRONG_MATCH_THRESHOLD,
    ).length,
  };
}
