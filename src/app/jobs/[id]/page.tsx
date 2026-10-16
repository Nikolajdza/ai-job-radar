import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/dashboard/app-header";
import { MatchScore } from "@/components/dashboard/match-score";
import { ApplyButton } from "@/components/jobs/apply-button";
import { JobAnalysisPanel } from "@/components/jobs/job-analysis-panel";
import { JobNotesForm } from "@/components/jobs/job-notes-form";
import { StatusSelect } from "@/components/jobs/status-select";
import { getAnalysisForJob } from "@/lib/ai/service";
import { getJobById } from "@/lib/jobs/service";
import { WORK_FORMAT_LABELS } from "@/lib/types/job";

type JobDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function JobDetailPage({ params }: JobDetailPageProps) {
  return (
    <>
      <AppHeader currentPath="/" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white" />
          }
        >
          <JobDetailContent params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function JobDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const job = await getJobById(id);

  if (!job) {
    notFound();
  }

  const analysis = await getAnalysisForJob(id);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            ← Back to dashboard
          </Link>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {job.title}
          </h2>
          <p className="mt-1 text-slate-600">
            {job.company} · {job.location} ·{" "}
            {WORK_FORMAT_LABELS[job.workFormat]}
          </p>
        </div>
        <ApplyButton href={job.sourceUrl} source={job.source} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Your AI match
            </p>
            <div className="mt-2 flex items-center gap-2">
              <MatchScore score={job.matchScore} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Heuristic fit vs your profile/CV — not a hiring probability.
              {job.matchScore === null
                ? " Run analysis below to generate a score."
                : ""}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Salary
            </p>
            <p className="mt-2 text-sm text-slate-800">{job.salary ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Your pipeline status
            </p>
            <div className="mt-2">
              <StatusSelect jobId={job.id} value={job.applicationStatus} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Track where you are in your own process.
            </p>
          </div>
        </div>
      </section>

      <JobAnalysisPanel jobId={job.id} initialAnalysis={analysis} />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Description</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {job.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          {job.source === "remotive" ? (
            <span className="text-xs text-slate-400">
              Sourced from{" "}
              <a
                href="https://remotive.com"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Remotive
              </a>
              . Apply opens their listing page.
            </span>
          ) : (
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-slate-900 underline"
            >
              Open source listing
            </a>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Notes</h3>
        <p className="mt-1 text-sm text-slate-500">
          Private notes for your application tracking.
        </p>
        <div className="mt-4">
          <JobNotesForm jobId={job.id} initialNotes={job.notes} />
        </div>
      </section>
    </>
  );
}
