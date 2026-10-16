"use client";

import Link from "next/link";
import { useState } from "react";
import { MatchScore } from "@/components/dashboard/match-score";
import { ApplyButton } from "@/components/jobs/apply-button";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { StatusSelect } from "@/components/jobs/status-select";
import {
  APPLICATION_STATUS_LABELS,
  WORK_FORMAT_LABELS,
  type ApplicationStatus,
  type JobListing,
} from "@/lib/types/job";

const TABS = [
  { id: "liked", label: "Liked" },
  { id: "interesting", label: "Interesting" },
  { id: "to_apply", label: "To apply" },
  { id: "applied", label: "Applied" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "passed", label: "Passed" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_IDS = new Set<string>(TABS.map((tab) => tab.id));

function jobsForTab(jobs: JobListing[], tab: TabId): JobListing[] {
  if (tab === "liked") return jobs.filter((job) => job.saved);
  if (tab === "passed") return jobs.filter((job) => job.applicationStatus === "rejected");
  return jobs.filter((job) => job.applicationStatus === tab);
}

export function PipelineBoard({
  jobs,
  initialTab,
}: {
  jobs: JobListing[];
  initialTab?: string;
}) {
  const [tab, setTab] = useState<TabId>(
    initialTab && TAB_IDS.has(initialTab) ? (initialTab as TabId) : "liked",
  );
  const visible = jobsForTab(jobs, tab);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 py-3">
        {TABS.map((item) => {
          const count = jobsForTab(jobs, item.id).length;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={active}
              className={
                active
                  ? "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                  : "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              }
            >
              {item.label}
              <span className={active ? "text-slate-300" : "text-slate-400"}>{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="font-medium text-slate-900">Nothing in {labelFor(tab).toLowerCase()} yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Like a job from the board, or set its status on the job page. It stays here even if
            the listing later leaves Remotive.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Browse jobs
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {visible.map((job) => (
            <li key={job.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <Link href={`/jobs/${job.id}`} className="font-medium text-slate-900 hover:underline">
                  {job.title}
                </Link>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {job.company} · {job.location} · {WORK_FORMAT_LABELS[job.workFormat]}
                </p>
                {job.notes ? (
                  <p className="mt-1 line-clamp-1 text-xs text-slate-400">{job.notes}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <MatchScore score={job.matchScore} />
                <StatusSelect
                  key={`${job.id}-${job.applicationStatus ?? "none"}`}
                  jobId={job.id}
                  value={job.applicationStatus}
                />
                <SaveJobButton jobId={job.id} saved={job.saved} size="sm" />
                <ApplyButton
                  jobId={job.id}
                  label="Prepare"
                  className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function labelFor(tab: TabId): string {
  if (tab === "passed") return "Passed";
  if (tab === "liked") return "Liked";
  return APPLICATION_STATUS_LABELS[tab as ApplicationStatus];
}
