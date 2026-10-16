import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/dashboard/app-header";
import { MatchScore } from "@/components/dashboard/match-score";
import { ApplyButton, OriginalListingLink } from "@/components/jobs/apply-button";
import { NewBadge } from "@/components/jobs/new-badge";
import { SaveJobButton } from "@/components/jobs/save-job-button";
import { JobAnalysisPanel } from "@/components/jobs/job-analysis-panel";
import { JobNotesForm } from "@/components/jobs/job-notes-form";
import { StatusSelect } from "@/components/jobs/status-select";
import { getAnalysisForJob } from "@/lib/ai/service";
import { getJobById } from "@/lib/jobs/service";
import { getCurrentUser } from "@/lib/session";
import { WORK_FORMAT_LABELS, type JobListing } from "@/lib/types/job";

export default function JobDetailPage({ params }: PageProps<"/jobs/[id]">) {
  return (
    <>
      <AppHeader currentPath="/jobs" />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />
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
  params: PageProps<"/jobs/[id]">["params"];
}) {
  await connection();
  const { id } = await params;
  const user = await getCurrentUser();
  const job = await getJobById(id, user?.id);

  if (!job) {
    notFound();
  }

  const analysis = user ? await getAnalysisForJob(id, user.id) : null;

  return (
    <>
      <JobHeader job={job} signedIn={Boolean(user)} />

      {user ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Your AI match
              </p>
              <div className="mt-2">
                <MatchScore score={job.matchScore} />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Fit vs your profile — not a hiring probability.
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
            </div>
          </div>
        </section>
      ) : (
        <SignInPrompt jobId={job.id} />
      )}

      {user ? <JobAnalysisPanel jobId={job.id} initialAnalysis={analysis} /> : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">About the role</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {job.description}
        </p>
        {job.source === "remotive" ? (
          <p className="mt-5 text-xs text-slate-400">
            Sourced from{" "}
            <a
              href="https://remotive.com"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Remotive
            </a>
            . Applications happen on their listing page.
          </p>
        ) : null}
      </section>

      {user ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Notes</h2>
          <p className="mt-1 text-sm text-slate-500">
            Private notes — only you can see them.
          </p>
          <div className="mt-4">
            <JobNotesForm jobId={job.id} initialNotes={job.notes} />
          </div>
        </section>
      ) : null}
    </>
  );
}

function JobHeader({ job, signedIn }: { job: JobListing; signedIn: boolean }) {
  return (
    <div className="space-y-4">
      <Link
        href="/"
        className="text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        ← {signedIn ? "Back to dashboard" : "All jobs"}
      </Link>
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {WORK_FORMAT_LABELS[job.workFormat]}
            </span>
            {job.isNew ? <NewBadge /> : null}
            {job.source === "remotive" ? (
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800 ring-1 ring-teal-200 ring-inset">
                Remotive
              </span>
            ) : null}
            {job.ownerUserId ? (
              <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-violet-200 ring-inset">
                Added by you
              </span>
            ) : null}
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {job.title}
          </h1>
          <p className="mt-1.5 text-slate-600">
            {job.company} · {job.location}
            {job.salary ? ` · ${job.salary}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:items-end">
          {signedIn ? <SaveJobButton jobId={job.id} saved={job.saved} /> : null}
          <div className="flex flex-col gap-2">
            {signedIn ? <ApplyButton jobId={job.id} /> : null}
            <OriginalListingLink href={job.sourceUrl} source={job.source} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInPrompt({ jobId }: { jobId: string }) {
  const next = encodeURIComponent(`/jobs/${jobId}`);
  return (
    <section className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-emerald-500/25 blur-3xl"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">How well do you fit this role?</p>
          <p className="mt-1 max-w-lg text-sm text-slate-300">
            Create a free account to get an AI match score, skill gaps, CV tips,
            and a tailored cover letter for this job.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/sign-up?next=${next}`}
            className="inline-flex h-10 items-center rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Get started
          </Link>
          <Link
            href={`/sign-in?next=${next}`}
            className="inline-flex h-10 items-center rounded-xl border border-white/15 px-4 text-sm font-medium hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
