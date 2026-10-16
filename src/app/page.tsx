import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { AppHeader } from "@/components/dashboard/app-header";
import { AutomationStatus } from "@/components/dashboard/automation-status";
import { JobList } from "@/components/dashboard/job-list";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { SyncRemotiveButton } from "@/components/jobs/sync-remotive-button";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { listJobs } from "@/lib/jobs/service";

export default function Home() {
  return (
    <>
      <AppHeader currentPath="/" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Dashboard
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Track roles, sync remote listings, and run AI match analysis
              against your profile.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/jobs/new"
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Add job
              </Link>
              <SyncRemotiveButton />
            </div>
          </div>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </main>
    </>
  );
}

async function DashboardContent() {
  await connection();

  let jobs: Awaited<ReturnType<typeof listJobs>> = [];
  let loadError: string | null = null;

  try {
    jobs = await listJobs();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Could not load jobs from the database.";
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-medium">Database unavailable</p>
        <p className="mt-1">{loadError}</p>
        <p className="mt-2 text-amber-800">
          Start Docker, then run{" "}
          <code className="rounded bg-amber-100 px-1">npm run db:up</code>,{" "}
          <code className="rounded bg-amber-100 px-1">npm run db:push</code>, and{" "}
          <code className="rounded bg-amber-100 px-1">npm run db:seed</code>.
        </p>
      </div>
    );
  }

  const stats = getDashboardStats(jobs);

  return (
    <>
      <SummaryCards stats={stats} />
      <JobList jobs={jobs} />
      <AutomationStatus />
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white" />
    </div>
  );
}
