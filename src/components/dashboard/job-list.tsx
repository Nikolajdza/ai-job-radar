"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MatchScore } from "@/components/dashboard/match-score";
import { StatusSelect } from "@/components/jobs/status-select";
import { STRONG_MATCH_THRESHOLD } from "@/lib/dashboard-stats";
import { filterJobs, type JobSort } from "@/lib/jobs/filter";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  WORK_FORMAT_LABELS,
  WORK_FORMATS,
  type ApplicationStatus,
  type JobListing,
  type WorkFormat,
} from "@/lib/types/job";

type JobListProps = {
  jobs: JobListing[];
};

type StatusFilter = ApplicationStatus | "untracked" | "all";
type WorkFormatFilter = WorkFormat | "all";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function JobList({ jobs }: JobListProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [workFormat, setWorkFormat] = useState<WorkFormatFilter>("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [strongMatchesOnly, setStrongMatchesOnly] = useState(false);
  const [sort, setSort] = useState<JobSort>("newest");

  const filteredJobs = useMemo(
    () =>
      filterJobs(jobs, {
        query,
        status,
        workFormat,
        savedOnly,
        strongMatchesOnly,
        strongMatchThreshold: STRONG_MATCH_THRESHOLD,
        sort,
      }),
    [jobs, query, status, workFormat, savedOnly, strongMatchesOnly, sort],
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-4 border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Job listings
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {filteredJobs.length} of {jobs.length} shown
            </p>
          </div>
          <label className="block w-full sm:max-w-xs">
            <span className="sr-only">Search jobs</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, company, location…"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">
              Status
            </span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as StatusFilter)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
            >
              <option value="all">All statuses</option>
              <option value="untracked">Untracked</option>
              {APPLICATION_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {APPLICATION_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">
              Work format
            </span>
            <select
              value={workFormat}
              onChange={(event) =>
                setWorkFormat(event.target.value as WorkFormatFilter)
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
            >
              <option value="all">All formats</option>
              {WORK_FORMATS.map((value) => (
                <option key={value} value={value}>
                  {WORK_FORMAT_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-slate-600">Sort</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as JobSort)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="match_desc">Match score (high → low)</option>
              <option value="match_asc">Match score (low → high)</option>
            </select>
          </label>

          <div className="flex flex-col justify-end gap-2 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={savedOnly}
                onChange={(event) => setSavedOnly(event.target.checked)}
                className="rounded border-slate-300"
              />
              Saved only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={strongMatchesOnly}
                onChange={(event) => setStrongMatchesOnly(event.target.checked)}
                className="rounded border-slate-300"
              />
              Strong matches ({STRONG_MATCH_THRESHOLD}+)
            </label>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3">Salary</th>
              <th className="px-5 py-3">Match</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredJobs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-slate-500"
                >
                  {jobs.length === 0
                    ? "No jobs yet. Add one or run npm run db:seed."
                    : "No jobs match your filters."}
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4 align-top">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {job.title}
                    </Link>
                    <div className="mt-0.5 text-slate-500">{job.company}</div>
                  </td>
                  <td className="px-5 py-4 align-top text-slate-600">
                    <div>{job.location}</div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {WORK_FORMAT_LABELS[job.workFormat]}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top text-slate-600">
                    {job.salary ?? "—"}
                  </td>
                  <td className="px-5 py-4 align-top">
                    <MatchScore score={job.matchScore} />
                  </td>
                  <td className="px-5 py-4 align-top">
                    <StatusSelect
                      jobId={job.id}
                      value={job.applicationStatus}
                    />
                  </td>
                  <td className="px-5 py-4 align-top whitespace-nowrap text-slate-500">
                    {formatDate(job.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
