"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { MatchScore } from "@/components/dashboard/match-score";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ApplyButton } from "@/components/jobs/apply-button";
import { STRONG_MATCH_THRESHOLD } from "@/lib/dashboard-stats";
import {
  filterJobs,
  type JobSort,
  type RoleFocusFilter,
} from "@/lib/jobs/filter";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  WORK_FORMAT_LABELS,
  type ApplicationStatus,
  type JobListing,
  type WorkFormat,
} from "@/lib/types/job";

const PAGE_SIZE = 8;

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
  const [roleFocus, setRoleFocus] = useState<RoleFocusFilter>("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [strongMatchesOnly, setStrongMatchesOnly] = useState(false);
  const [sort, setSort] = useState<JobSort>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filteredJobs = useMemo(
    () =>
      filterJobs(jobs, {
        query,
        status,
        workFormat,
        roleFocus,
        savedOnly,
        strongMatchesOnly,
        strongMatchThreshold: STRONG_MATCH_THRESHOLD,
        sort,
      }),
    [
      jobs,
      query,
      status,
      workFormat,
      roleFocus,
      savedOnly,
      strongMatchesOnly,
      sort,
    ],
  );

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pageJobs = filteredJobs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function resetPage() {
    setPage(1);
  }

  const activeFilterCount = [
    status !== "all",
    workFormat !== "all",
    roleFocus !== "all",
    savedOnly,
    strongMatchesOnly,
  ].filter(Boolean).length;

  function clearFilters() {
    setStatus("all");
    setWorkFormat("all");
    setRoleFocus("all");
    setSavedOnly(false);
    setStrongMatchesOnly(false);
    resetPage();
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
              onChange={(event) => {
                setQuery(event.target.value);
                resetPage();
              }}
              placeholder="Search roles, companies, locations…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-3 pl-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as JobSort);
                resetPage();
              }}
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
            active={
              status === "all" &&
              !savedOnly &&
              !strongMatchesOnly &&
              workFormat === "all" &&
              roleFocus === "all"
            }
            onClick={clearFilters}
          >
            All
          </Chip>
          <Chip
            active={roleFocus === "frontend"}
            onClick={() => {
              setRoleFocus((value) =>
                value === "frontend" ? "all" : "frontend",
              );
              resetPage();
            }}
          >
            Frontend
          </Chip>
          <Chip
            active={roleFocus === "fullstack"}
            onClick={() => {
              setRoleFocus((value) =>
                value === "fullstack" ? "all" : "fullstack",
              );
              resetPage();
            }}
          >
            Full-stack
          </Chip>
          <Chip
            active={roleFocus === "backend"}
            onClick={() => {
              setRoleFocus((value) =>
                value === "backend" ? "all" : "backend",
              );
              resetPage();
            }}
          >
            Backend
          </Chip>
          <Chip
            active={strongMatchesOnly}
            onClick={() => {
              setStrongMatchesOnly((value) => !value);
              resetPage();
            }}
          >
            Strong matches
          </Chip>
          <Chip
            active={savedOnly}
            onClick={() => {
              setSavedOnly((value) => !value);
              resetPage();
            }}
          >
            Saved
          </Chip>
          <Chip
            active={workFormat === "remote"}
            onClick={() => {
              setWorkFormat((value) => (value === "remote" ? "all" : "remote"));
              resetPage();
            }}
          >
            Remote
          </Chip>
          <Chip
            active={status === "to_apply"}
            onClick={() => {
              setStatus((value) => (value === "to_apply" ? "all" : "to_apply"));
              resetPage();
            }}
          >
            To apply
          </Chip>
          <Chip
            active={status === "interview"}
            onClick={() => {
              setStatus((value) =>
                value === "interview" ? "all" : "interview",
              );
              resetPage();
            }}
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
                onChange={(event) => {
                  setStatus(event.target.value as StatusFilter);
                  resetPage();
                }}
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
                onChange={(event) => {
                  setWorkFormat(event.target.value as WorkFormatFilter);
                  resetPage();
                }}
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
          Showing{" "}
          {(currentPage - 1) * PAGE_SIZE + (pageJobs.length ? 1 : 0)}–
          {(currentPage - 1) * PAGE_SIZE + pageJobs.length} of{" "}
          {filteredJobs.length}
          {activeFilterCount > 0 ? " · filters active" : ""}
        </p>
      </div>

      <ul className="divide-y divide-slate-100">
        {pageJobs.length === 0 ? (
          <li className="px-5 py-12 text-center text-sm text-slate-500">
            {jobs.length === 0
              ? "No jobs yet. Sync from Remotive or add one manually."
              : "No jobs match your filters."}
          </li>
        ) : (
          pageJobs.map((job) => (
            <li key={job.id} className="px-5 py-4">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)_auto] sm:items-center">
                <Link href={`/jobs/${job.id}`} className="min-w-0 group">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-medium text-slate-900 group-hover:underline">
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
                  <p className="mt-1 text-xs text-slate-400 sm:hidden">
                    {job.location} · {WORK_FORMAT_LABELS[job.workFormat]}
                  </p>
                </Link>

                <div className="hidden text-sm text-slate-600 sm:block">
                  <p>{job.location}</p>
                  <p className="text-xs text-slate-400">
                    {WORK_FORMAT_LABELS[job.workFormat]}
                    {job.salary ? ` · ${job.salary}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <div className="mr-1 flex flex-col items-start gap-1 sm:items-end">
                    <MatchScore score={job.matchScore} />
                    <StatusBadge status={job.applicationStatus} />
                    <span className="text-[11px] text-slate-400">
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                  <ApplyButton
                    href={job.sourceUrl}
                    source={job.source}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-800"
                  />
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      {filteredJobs.length > PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Previous
          </button>
          <p className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
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
