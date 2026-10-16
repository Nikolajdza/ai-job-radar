import { AppHeader } from "@/components/dashboard/app-header";
import { JobList } from "@/components/dashboard/job-list";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { sampleJobs } from "@/data/sample-jobs";
import { getDashboardStats } from "@/lib/dashboard-stats";

export default function Home() {
  const stats = getDashboardStats(sampleJobs);

  return (
    <>
      <AppHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Dashboard
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Track job listings, application status, and AI match scores. Data on
            this screen is static sample content — no database or LLM required
            yet.
          </p>
        </div>

        <SummaryCards stats={stats} />
        <JobList jobs={sampleJobs} />
      </main>
    </>
  );
}
