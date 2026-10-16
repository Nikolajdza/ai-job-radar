export const APPLICATION_STATUSES = [
  "interesting",
  "to_apply",
  "applied",
  "interview",
  "rejected",
  "offer",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const WORK_FORMATS = ["remote", "hybrid", "onsite"] as const;

export type WorkFormat = (typeof WORK_FORMATS)[number];

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  workFormat: WorkFormat;
  salary: string | null;
  description: string;
  sourceUrl: string;
  createdAt: string;
  applicationStatus: ApplicationStatus | null;
  /** Approximate heuristic match score from AI analysis, when available. */
  matchScore: number | null;
  saved: boolean;
  notes: string | null;
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  interesting: "Interesting",
  to_apply: "To Apply",
  applied: "Applied",
  interview: "Interview",
  rejected: "Rejected",
  offer: "Offer",
};

export const WORK_FORMAT_LABELS: Record<WorkFormat, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};
