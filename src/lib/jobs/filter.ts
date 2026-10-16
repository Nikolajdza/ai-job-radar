import {
  APPLICATION_STATUS_LABELS,
  WORK_FORMAT_LABELS,
  type ApplicationStatus,
  type JobListing,
  type WorkFormat,
} from "@/lib/types/job";

export type JobSort = "newest" | "oldest" | "match_desc" | "match_asc";

export type RoleFocusFilter =
  | "all"
  | "frontend"
  | "fullstack"
  | "backend";

export type JobFilters = {
  query?: string;
  status?: ApplicationStatus | "untracked" | "all";
  workFormat?: WorkFormat | "all";
  roleFocus?: RoleFocusFilter;
  savedOnly?: boolean;
  newOnly?: boolean;
  /** Signed-in dashboard hides Passed roles; they stay on My jobs. */
  hidePassed?: boolean;
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
    roleFocus = "all",
    savedOnly = false,
    newOnly = false,
    hidePassed = false,
    strongMatchesOnly = false,
    strongMatchThreshold = 75,
    sort = "newest",
  } = filters;

  const normalized = query.trim().toLowerCase();

  const filtered = jobs.filter((job) => {
    if (savedOnly && !job.saved) return false;
    if (newOnly && !job.isNew) return false;
    if (hidePassed && job.applicationStatus === "rejected") return false;

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

    if (roleFocus !== "all" && !matchesRoleFocus(job, roleFocus)) return false;

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

function matchesRoleFocus(
  job: JobListing,
  focus: Exclude<RoleFocusFilter, "all">,
): boolean {
  const haystack = `${job.title} ${job.description}`.toLowerCase();

  if (focus === "frontend") {
    return /(frontend|front-end|front end|react|next\.?js|vue|angular|svelte|tailwind|ui engineer)/i.test(
      haystack,
    );
  }

  if (focus === "backend") {
    return /(backend|back-end|back end|node\.?js|django|flask|fastapi|spring|golang|rails|nestjs|api engineer|devops)/i.test(
      haystack,
    );
  }

  return /(full.?stack|full stack)/i.test(haystack);
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
