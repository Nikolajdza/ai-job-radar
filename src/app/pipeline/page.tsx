import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { AppHeader } from "@/components/dashboard/app-header";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { listJobs } from "@/lib/jobs/service";
import { requireUser } from "@/lib/session";
import type { JobListing } from "@/lib/types/job";

export const metadata: Metadata = {
  title: "My jobs · AI Job Radar",
};

export default function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <>
      <AppHeader currentPath="/pipeline" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            My jobs
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-500">
            Roles you liked or moved through your pipeline. Like is a heart on any job.
            Status tracks where you are, from interesting to offer.
          </p>
        </div>
        <Suspense
          fallback={
            <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          }
        >
          <PipelineContent searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function PipelineContent({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await connection();
  const user = await requireUser("/pipeline");
  const params = await searchParams;
  const jobs = await listJobs(user.id);
  const tracked = jobs.filter(isTracked);

  return <PipelineBoard jobs={tracked} initialTab={params.tab} />;
}

function isTracked(job: JobListing): boolean {
  return job.saved || job.applicationStatus !== null || Boolean(job.notes?.trim());
}
