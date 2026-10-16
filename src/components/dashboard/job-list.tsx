"use client";

import { useMemo, useState } from "react";
import { MatchScore } from "@/components/dashboard/match-score";
import { StatusBadge } from "@/components/dashboard/status-badge";
import {
  WORK_FORMAT_LABELS,
  type JobListing,
} from "@/lib/types/job";

type JobListProps = {
  jobs: JobListing[];
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function JobList({ jobs }: JobListProps) {
  const [query, setQuery] = useState("");

  const filteredJobs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return jobs;

    return jobs.filter((job) => {
      const haystack = [
        job.title,
        job.company,
        job.location,
        WORK_FORMAT_LABELS[job.workFormat],
        job.salary ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [jobs, query]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Job listings</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Sample data for local development — {filteredJobs.length} of{" "}
            {jobs.length} shown
          </p>
        </div>
        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">Search jobs</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, company, location…"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 placeholder:text-slate-400 focus:border-slate-400 focus:ring-2"
          />
        </label>
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
                  No jobs match your search.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-4 align-top">
                    <div className="font-medium text-slate-900">{job.title}</div>
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
                    <StatusBadge status={job.applicationStatus} />
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
