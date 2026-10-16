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

const SOFTWARE_CATEGORIES = new Set([
  "software development",
  "artificial intelligence",
  "information technology",
  "data and analytics",
  "devops / sysadmin",
  "qa",
]);

export type FetchRemotiveOptions = {
  /** Free-text search passed to Remotive. */
  search?: string;
  /** Max jobs to keep after local filtering. */
  limit?: number;
};

/**
 * Fetch remote jobs from Remotive's public API (no API key).
 * Terms require linking back to the Remotive job URL and crediting Remotive.
 * Keep request volume low (Remotive asks for gentle usage).
 */
export async function fetchRemotiveJobs(
  options: FetchRemotiveOptions = {},
): Promise<RemotiveJob[]> {
  const search = options.search?.trim() || "frontend typescript react";
  const limit = options.limit ?? 15;

  const url = new URL("https://remotive.com/api/remote-jobs");
  url.searchParams.set("search", search);
  url.searchParams.set("limit", String(Math.min(Math.max(limit, 1), 50)));

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "ai-job-radar/0.1 (personal learning project)",
    },
    signal: AbortSignal.timeout(15_000),
    // Always hit the live API when syncing; do not cache stale boards.
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Remotive API failed with status ${response.status}`);
  }

  const json: unknown = await response.json();
  const parsed = remotiveResponseSchema.parse(json);

  const filtered = parsed.jobs.filter(isSoftwareRelated);
  return filtered.slice(0, limit);
}

function isSoftwareRelated(job: RemotiveJob): boolean {
  const category = (job.category ?? "").toLowerCase().trim();
  if (SOFTWARE_CATEGORIES.has(category)) return true;

  const haystack = `${job.title} ${(job.tags ?? []).join(" ")}`.toLowerCase();
  return /(frontend|back-?end|full.?stack|software|developer|typescript|react|next\.?js|nodejs|node\.js|python|golang|devops)/i.test(
    haystack,
  );
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
