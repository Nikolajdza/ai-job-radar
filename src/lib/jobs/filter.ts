import {
  APPLICATION_STATUS_LABELS,
  WORK_FORMAT_LABELS,
  type ApplicationStatus,
  type JobListing,
  type WorkFormat,
} from "@/lib/types/job";

export type JobSort = "newest" | "oldest" | "match_desc" | "match_asc";

export type JobFilters = {
  query?: string;
  status?: ApplicationStatus | "untracked" | "all";
  workFormat?: WorkFormat | "all";
  savedOnly?: boolean;
  strongMatchesOnly?: boolean;
  strongMatchThreshold?: number;
  sort?: JobSort;
};

export function filterJobs(
  jobs: JobListing[],
  filters: JobFilters = {},
): JobListing[] {
  const {
    query = "",
    status = "all",
    workFormat = "all",
    savedOnly = false,
    strongMatchesOnly = false,
    strongMatchThreshold = 75,
    sort = "newest",
  } = filters;

  const normalized = query.trim().toLowerCase();

  const filtered = jobs.filter((job) => {
    if (savedOnly && !job.saved) return false;

    if (strongMatchesOnly) {
      if (job.matchScore === null || job.matchScore < strongMatchThreshold) {
        return false;
      }
    }

    if (status === "untracked" && job.applicationStatus !== null) return false;
    if (
      status !== "all" &&
      status !== "untracked" &&
      job.applicationStatus !== status
    ) {
      return false;
    }

    if (workFormat !== "all" && job.workFormat !== workFormat) return false;

    if (!normalized) return true;

    const haystack = [
      job.title,
      job.company,
      job.location,
      WORK_FORMAT_LABELS[job.workFormat],
      job.salary ?? "",
      job.applicationStatus
        ? APPLICATION_STATUS_LABELS[job.applicationStatus]
        : "untracked",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });

  return [...filtered].sort((a, b) => compareJobs(a, b, sort));
}

function compareJobs(a: JobListing, b: JobListing, sort: JobSort): number {
  switch (sort) {
    case "oldest":
      return Date.parse(a.createdAt) - Date.parse(b.createdAt);
    case "match_desc":
      return (b.matchScore ?? -1) - (a.matchScore ?? -1);
    case "match_asc":
      return (a.matchScore ?? 101) - (b.matchScore ?? 101);
    case "newest":
    default:
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  }
}
