"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUSES,
  type ApplicationStatus,
} from "@/lib/types/job";

type StatusSelectProps = {
  jobId: string;
  value: ApplicationStatus | null;
};

export function StatusSelect({ jobId, value }: StatusSelectProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onChange(next: string) {
    setError(null);
    const applicationStatus = next === "" ? null : (next as ApplicationStatus);

    const response = await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationStatus,
        saved: applicationStatus !== null ? true : undefined,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(payload?.error ?? "Could not update status");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="min-w-[8.5rem]">
      <label className="sr-only" htmlFor={`status-${jobId}`}>
        Application status
      </label>
      <select
        id={`status-${jobId}`}
        defaultValue={value ?? ""}
        disabled={pending}
        onChange={(event) => {
          void onChange(event.target.value);
        }}
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300 disabled:opacity-60"
      >
        <option value="">Untracked</option>
        {APPLICATION_STATUSES.map((status) => (
          <option key={status} value={status}>
            {APPLICATION_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
