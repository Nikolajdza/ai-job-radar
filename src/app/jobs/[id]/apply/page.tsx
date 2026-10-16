import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AppHeader } from "@/components/dashboard/app-header";
import { MatchScore } from "@/components/dashboard/match-score";
import { OriginalListingLink } from "@/components/jobs/apply-button";
import { CoverLetterStudio } from "@/components/jobs/cover-letter-studio";
import { StatusSelect } from "@/components/jobs/status-select";
import { getAnalysisForJob } from "@/lib/ai/service";
import { getCoverLetter } from "@/lib/cover-letters/service";
import { getJobById } from "@/lib/jobs/service";
import {
  getProfileCompleteness,
  hasAiReadyProfile,
} from "@/lib/profile/completeness";
import { getProfileForUser } from "@/lib/profile/service";
import { requireUser } from "@/lib/session";
import { WORK_FORMAT_LABELS } from "@/lib/types/job";

export const metadata: Metadata = {
  title: "Application kit · AI Job Radar",
};

export default function ApplyPage({ params }: PageProps<"/jobs/[id]/apply">) {
  return (
    <>
      <AppHeader currentPath="/jobs" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <Suspense
          fallback={
            <div className="h-[32rem] animate-pulse rounded-2xl border border-slate-200 bg-white" />
          }
        >
          <ApplyContent params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function ApplyContent({
  params,
}: {
  params: PageProps<"/jobs/[id]/apply">["params"];
}) {
  await connection();
  const { id } = await params;
  const user = await requireUser(`/jobs/${id}/apply`);
  const job = await getJobById(id, user.id);
  if (!job) notFound();

  const [profile, coverLetter, analysis] = await Promise.all([
    getProfileForUser(user),
    getCoverLetter(id, user.id),
    getAnalysisForJob(id, user.id),
  ]);
  const completeness = getProfileCompleteness(profile);
  const profileReady = hasAiReadyProfile(profile);

  const checklist = [
    {
      label: "Profile ready for AI",
      done: profileReady,
      href: "/profile",
      hint: profileReady ? `${completeness.percent}% complete` : "Add CV or skills",
    },
    {
      label: "AI match reviewed",
      done: Boolean(analysis),
      href: `/jobs/${job.id}`,
      hint: analysis ? `Score ${analysis.matchScore}/100` : "Run it on the job page",
    },
    {
      label: "Cover letter drafted",
      done: Boolean(coverLetter),
      hint: coverLetter ? "Saved" : "Generate below",
    },
    {
      label: "Applied on the listing",
      done:
        job.applicationStatus === "applied" ||
        job.applicationStatus === "interview" ||
        job.applicationStatus === "offer",
      hint: "Mark as applied when done",
    },
  ];

  return (
    <>
      <div>
        <Link
          href={`/jobs/${job.id}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          ← Back to job
        </Link>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Application kit</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {job.title}
            </h1>
            <p className="mt-1 text-slate-600">
              {job.company} · {job.location} · {WORK_FORMAT_LABELS[job.workFormat]}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <CoverLetterStudio
          jobId={job.id}
          initialLetter={coverLetter}
          profileReady={profileReady}
          sourceUrl={job.sourceUrl}
          source={job.source}
          applicationStatus={job.applicationStatus}
        />

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Checklist</h2>
            <ul className="mt-4 space-y-3">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      item.done
                        ? "bg-emerald-500 text-white"
                        : "border border-slate-300 text-transparent"
                    }`}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <div className="min-w-0">
                    {item.href && !item.done ? (
                      <Link
                        href={item.href}
                        className="text-sm font-medium text-slate-900 underline-offset-2 hover:underline"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    )}
                    <p className="text-xs text-slate-500">{item.hint}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900">Your match</h2>
              <MatchScore score={analysis?.matchScore ?? null} />
            </div>
            {analysis ? (
              <>
                {analysis.missingSkills.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Address in your letter
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {analysis.missingSkills.slice(0, 8).map((skill) => (
                        <li
                          key={skill}
                          className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200 ring-inset"
                        >
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {analysis.cvSuggestions.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Tailor your CV
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
                      {analysis.cvSuggestions.slice(0, 4).map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Run the AI match on the{" "}
                <Link href={`/jobs/${job.id}`} className="font-medium underline">
                  job page
                </Link>{" "}
                to see gaps and CV tips here.
              </p>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Pipeline</h2>
            <StatusSelect
              key={job.applicationStatus ?? "untracked"}
              jobId={job.id}
              value={job.applicationStatus}
            />
            <OriginalListingLink
              href={job.sourceUrl}
              source={job.source}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            />
            <p className="text-xs text-slate-400">
              We never submit applications for you — you apply on the original
              listing.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
