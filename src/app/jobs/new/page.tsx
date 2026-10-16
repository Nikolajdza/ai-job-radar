import { AppHeader } from "@/components/dashboard/app-header";
import { AddJobForm } from "@/components/jobs/add-job-form";

export default function NewJobPage() {
  return (
    <>
      <AppHeader currentPath="/jobs/new" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Add job
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manual import for Milestone 2. Duplicate company + title + source URL
            combinations are rejected.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <AddJobForm />
        </div>
      </main>
    </>
  );
}
