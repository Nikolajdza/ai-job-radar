"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import { WORK_FORMATS, WORK_FORMAT_LABELS } from "@/lib/types/job";

export function AddJobForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title") ?? ""),
      company: String(form.get("company") ?? ""),
      location: String(form.get("location") ?? ""),
      workFormat: String(form.get("workFormat") ?? ""),
      salary: String(form.get("salary") ?? "") || null,
      description: String(form.get("description") ?? ""),
      sourceUrl: String(form.get("sourceUrl") ?? ""),
      saved: form.get("saved") === "on",
      applicationStatus: form.get("saved") === "on" ? "interesting" : null,
    };

    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = (await response.json().catch(() => null)) as {
      error?: string;
      job?: { id: string };
    } | null;

    if (!response.ok) {
      setError(body?.error ?? "Could not create job");
      return;
    }

    startTransition(() => {
      router.push(body?.job?.id ? `/jobs/${body.job.id}` : "/");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" name="title" required />
        <Field label="Company" name="company" required />
        <Field label="Location" name="location" required />
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-slate-700">
            Work format
          </span>
          <select
            name="workFormat"
            required
            defaultValue="remote"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
          >
            {WORK_FORMATS.map((format) => (
              <option key={format} value={format}>
                {WORK_FORMAT_LABELS[format]}
              </option>
            ))}
          </select>
        </label>
        <Field label="Salary (optional)" name="salary" />
        <Field label="Source URL" name="sourceUrl" type="url" required />
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-700">
          Description
        </span>
        <textarea
          name="description"
          required
          minLength={20}
          rows={8}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
          placeholder="Paste the job description here…"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          name="saved"
          defaultChecked
          className="rounded border-slate-300"
        />
        Save as interesting
      </label>

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add job"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
      />
    </label>
  );
}
