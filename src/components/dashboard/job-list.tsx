"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { MatchScore } from "@/components/dashboard/match-score";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { STRONG_MATCH_THRESHOLD } from "@/lib/dashboard-stats";
import { filterJobs, type JobSort } from "@/lib/jobs/filter";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  WORK_FORMAT_LABELS,
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
  }).format(new Date(iso));
}

export function JobList({ jobs }: JobListProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [workFormat, setWorkFormat] = useState<WorkFormatFilter>("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [strongMatchesOnly, setStrongMatchesOnly] = useState(false);
  const [sort, setSort] = useState<JobSort>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const activeFilterCount = [
    status !== "all",
    workFormat !== "all",
    savedOnly,
    strongMatchesOnly,
  ].filter(Boolean).length;

  function clearFilters() {
    setStatus("all");
    setWorkFormat("all");
    setSavedOnly(false);
    setStrongMatchesOnly(false);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="space-y-4 border-b border-slate-100 px-5 py-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search roles, companies, locations…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as JobSort)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              aria-label="Sort jobs"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="match_desc">Best match</option>
              <option value="match_asc">Lowest match</option>
            </select>

            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Filters
              {activeFilterCount > 0 ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-xs text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip
            active={status === "all" && !savedOnly && !strongMatchesOnly && workFormat === "all"}
            onClick={() => {
              clearFilters();
            }}
          >
            All
          </Chip>
          <Chip
            active={strongMatchesOnly}
            onClick={() => setStrongMatchesOnly((value) => !value)}
          >
            Strong matches
          </Chip>
          <Chip
            active={savedOnly}
            onClick={() => setSavedOnly((value) => !value)}
          >
            Saved
          </Chip>
          <Chip
            active={workFormat === "remote"}
            onClick={() =>
              setWorkFormat((value) => (value === "remote" ? "all" : "remote"))
            }
          >
            Remote
          </Chip>
          <Chip
            active={status === "to_apply"}
            onClick={() =>
              setStatus((value) => (value === "to_apply" ? "all" : "to_apply"))
            }
          >
            To apply
          </Chip>
          <Chip
            active={status === "interview"}
            onClick={() =>
              setStatus((value) => (value === "interview" ? "all" : "interview"))
            }
          >
            Interview
          </Chip>
        </div>

        {filtersOpen ? (
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-600">
                Pipeline status
              </span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as StatusFilter)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="all">All formats</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </label>

            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-left text-sm font-medium text-slate-600 underline sm:col-span-2"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}

        <p className="text-xs text-slate-400">
          Showing {filteredJobs.length} of {jobs.length}
          {activeFilterCount > 0 ? " · filters active" : ""}
        </p>
      </div>

      <ul className="divide-y divide-slate-100">
        {filteredJobs.length === 0 ? (
          <li className="px-5 py-12 text-center text-sm text-slate-500">
            {jobs.length === 0
              ? "No jobs yet. Sync from Remotive or add one manually."
              : "No jobs match your filters."}
          </li>
        ) : (
          filteredJobs.map((job) => (
            <li key={job.id}>
              <Link
                href={`/jobs/${job.id}`}
                className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_auto_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-medium text-slate-900">
                      {job.title}
                    </h3>
                    {job.source === "remotive" ? (
                      <span className="rounded-md bg-teal-50 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-teal-800 uppercase ring-1 ring-teal-200 ring-inset">
                        Remotive
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    {job.company}
                  </p>
                </div>

                <div className="text-sm text-slate-600">
                  <p>{job.location}</p>
                  <p className="text-xs text-slate-400">
                    {WORK_FORMAT_LABELS[job.workFormat]}
                    {job.salary ? ` · ${job.salary}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <MatchScore score={job.matchScore} />
                  <StatusBadge status={job.applicationStatus} />
                </div>

                <div className="text-right text-xs whitespace-nowrap text-slate-400">
                  {formatDate(job.createdAt)}
                </div>
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
          : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
