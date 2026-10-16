import { z } from "zod";

const remotiveJobSchema = z.object({
  id: z.union([z.number(), z.string()]),
  url: z.string().url(),
  title: z.string(),
  company_name: z.string(),
  category: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  job_type: z.string().optional().nullable(),
  candidate_required_location: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  publication_date: z.string().optional().nullable(),
});

const remotiveResponseSchema = z.object({
  "job-count": z.number().optional(),
  jobs: z.array(remotiveJobSchema),
});

export type RemotiveJob = z.infer<typeof remotiveJobSchema>;

/** Sync focus — applied client-side (Remotive query params are unreliable). */
export const REMOTIVE_FOCUSES = [
  "software",
  "frontend",
  "fullstack",
  "backend",
] as const;

export type RemotiveFocus = (typeof REMOTIVE_FOCUSES)[number];

export const REMOTIVE_FOCUS_LABELS: Record<RemotiveFocus, string> = {
  software: "All software",
  frontend: "Frontend",
  fullstack: "Full-stack",
  backend: "Backend",
};

const SOFTWARE_CATEGORIES = new Set([
  "software development",
  "artificial intelligence",
  "information technology",
  "data and analytics",
  "devops / sysadmin",
  "qa",
]);

export type FetchRemotiveOptions = {
  /**
   * Optional free-text search. Prefer `focus` — Remotive often ignores
   * querystring filters due to CDN cache.
   */
  search?: string;
  /** Role focus applied after fetch. Default: all software-related. */
  focus?: RemotiveFocus;
  /**
   * Max jobs to keep after local filtering.
   * Omit it to keep every software job Remotive returned.
   */
  limit?: number;
};

/**
 * Fetch remote jobs from Remotive's public API (no API key).
 * Terms require linking back to the Remotive job URL and crediting Remotive.
 *
 * Remotive's `search`/`category`/`limit` params are often ignored by their
 * edge cache — we fetch the board and filter locally.
 */
export async function fetchRemotiveJobs(
  options: FetchRemotiveOptions = {},
): Promise<RemotiveJob[]> {
  const focus = options.focus ?? "software";
  const limit =
    options.limit === undefined
      ? undefined
      : Math.min(Math.max(options.limit, 1), 2000);
  const search = options.search?.trim().toLowerCase() ?? "";

  const url = new URL("https://remotive.com/api/remote-jobs");
  // Hint only — may be ignored by CDN; real filtering is local.
  url.searchParams.set("category", "software-dev");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "ai-job-radar/0.1 (personal learning project)",
    },
    signal: AbortSignal.timeout(25_000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Remotive API failed with status ${response.status}`);
  }

  const json: unknown = await response.json();
  const parsed = remotiveResponseSchema.parse(json);

  let filtered = parsed.jobs.filter(isSoftwareRelated);
  filtered = filtered.filter((job) => matchesFocus(job, focus));

  if (search) {
    filtered = filtered.filter((job) => {
      const haystack = jobHaystack(job);
      return search
        .split(/\s+/)
        .filter(Boolean)
        .every((token) => haystack.includes(token));
    });
  }

  return limit === undefined ? filtered : filtered.slice(0, limit);
}

export function isSoftwareRelated(job: RemotiveJob): boolean {
  const category = (job.category ?? "").toLowerCase().trim();
  if (SOFTWARE_CATEGORIES.has(category)) return true;

  return /(frontend|back-?end|full.?stack|software|developer|engineer|typescript|react|next\.?js|nodejs|node\.js|python|golang|devops|sre|qa\b|mobile)/i.test(
    jobHaystack(job),
  );
}

export function matchesFocus(job: RemotiveJob, focus: RemotiveFocus): boolean {
  if (focus === "software") return true;

  const haystack = jobHaystack(job);

  if (focus === "frontend") {
    return /(frontend|front-end|front end|react|next\.?js|vue|angular|svelte|css|tailwind|ui engineer|web engineer)/i.test(
      haystack,
    );
  }

  if (focus === "backend") {
    return /(backend|back-end|back end|node\.?js|typescript api|django|flask|fastapi|spring|golang|rails|nestjs|postgresql|kubernetes|devops)/i.test(
      haystack,
    );
  }

  // fullstack
  return /(full.?stack|full stack)/i.test(haystack);
}

function jobHaystack(job: RemotiveJob): string {
  return `${job.title} ${job.category ?? ""} ${(job.tags ?? []).join(" ")}`.toLowerCase();
}

/** Remotive descriptions are HTML — store plain text for analysis/UI. */
export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapRemotiveJobToCreateInput(job: RemotiveJob) {
  const plain = stripHtml(job.description ?? "");
  const description =
    plain.length >= 20
      ? plain.slice(0, 50_000)
      : `${job.title} at ${job.company_name}. Remote role listed on Remotive. Tags: ${(job.tags ?? []).join(", ") || "n/a"}.`;

  return {
    title: job.title.trim().slice(0, 200),
    company: job.company_name.trim().slice(0, 200),
    location: (job.candidate_required_location || "Remote").trim().slice(0, 200),
    workFormat: "remote" as const,
    salary: job.salary?.trim() ? job.salary.trim().slice(0, 100) : null,
    description,
    sourceUrl: job.url,
    source: "remotive" as const,
    saved: false,
    applicationStatus: null,
    notes: null,
  };
}
