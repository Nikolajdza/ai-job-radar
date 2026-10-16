import { Suspense } from "react";
import { connection } from "next/server";
import { AppHeader } from "@/components/dashboard/app-header";
import { JobList } from "@/components/dashboard/job-list";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { listJobs } from "@/lib/jobs/service";

export default function Home() {
  return (
    <>
      <AppHeader currentPath="/" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Jobs and profile data are stored in local PostgreSQL. AI analysis
            arrives in the next milestone.
          </p>
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
