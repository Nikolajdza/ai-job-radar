import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { AiProviderBadge } from "@/components/dashboard/ai-provider-badge";
import { AutomationStatus } from "@/components/dashboard/automation-status";
import { JobList } from "@/components/dashboard/job-list";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import {
  LandingFeatures,
  LandingHero,
  LandingSteps,
} from "@/components/home/landing";
import { SyncRemotiveButton } from "@/components/jobs/sync-remotive-button";
import { ProfileCompletenessCard } from "@/components/profile/profile-completeness-card";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { listJobs } from "@/lib/jobs/service";
import { getProfileCompleteness } from "@/lib/profile/completeness";
import { getProfileForUser } from "@/lib/profile/service";
import { getCurrentUser, type SessionUser } from "@/lib/session";
import type { JobListing } from "@/lib/types/job";

export default function Home() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6">
        <Suspense fallback={<HomeSkeleton />}>
          <HomeContent />
        </Suspense>
      </main>
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-white/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>AI Job Radar — portfolio project built with Next.js, Drizzle & free AI.</p>
          <AutomationStatus />
        </div>
      </footer>
    </>
  );
}

async function HomeContent() {
  await connection();
  const user = await getCurrentUser();

  let jobs: JobListing[] = [];
  let loadError: string | null = null;

  try {
    jobs = await listJobs(user?.id);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Could not load jobs from the database.";
  }

  if (loadError) {
    return <DatabaseError message={loadError} />;
  }

  return user ? <Dashboard user={user} jobs={jobs} /> : <Landing jobs={jobs} />;
}

function Landing({ jobs }: { jobs: JobListing[] }) {
  return (
    <>
      <LandingHero jobCount={jobs.length} />
      <LandingFeatures />
      <section id="jobs" className="scroll-mt-24 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Open roles</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Latest software jobs
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            <Link href="/sign-up" className="font-medium text-slate-900 underline">
              Sign up
            </Link>{" "}
            to see your match score on every listing.
          </p>
        </div>
        <JobList jobs={jobs} signedIn={false} />
      </section>
      <LandingSteps />
    </>
  );
}

async function Dashboard({
  user,
  jobs,
}: {
  user: SessionUser;
  jobs: JobListing[];
}) {
  const profile = await getProfileForUser(user);
  const completeness = getProfileCompleteness(profile);
  const stats = getDashboardStats(jobs);
  const firstName = user.name.split(" ")[0] || "there";

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Your matches, pipeline, and application prep in one place.
          </p>
          <div className="mt-2">
            <AiProviderBadge />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href="/jobs/new"
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Add job
          </Link>
          <SyncRemotiveButton />
        </div>
      </div>

      <ProfileCompletenessCard completeness={completeness} />
      <SummaryCards stats={stats} />
      <JobList jobs={jobs} signedIn />
    </>
  );
}

function DatabaseError({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">Database unavailable</p>
      <p className="mt-1">{message}</p>
      <p className="mt-2 text-amber-800">
        Start Docker, then run{" "}
        <code className="rounded bg-amber-100 px-1">npm run db:up</code>,{" "}
        <code className="rounded bg-amber-100 px-1">npm run db:push</code>, and{" "}
        <code className="rounded bg-amber-100 px-1">npm run db:seed</code>.
      </p>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-8" aria-hidden>
      <div className="h-72 animate-pulse rounded-3xl bg-slate-200/70" />
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
