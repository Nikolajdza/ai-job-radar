import { AddJobForm } from "@/components/jobs/add-job-form";

export default function NewJobPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Add a job
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Found a role elsewhere? Add it here to get an AI match and cover
          letter. Jobs you add are private to you.
        </p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <AddJobForm />
      </div>
    </main>
  );
}
