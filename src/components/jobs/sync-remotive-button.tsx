"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type SyncRemotiveButtonProps = {
  search?: string;
};

export function SyncRemotiveButton({
  search = "frontend typescript react",
}: SyncRemotiveButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSync() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/jobs/sync/remotive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search, limit: 12 }),
      });

      const body = (await response.json().catch(() => null)) as {
        error?: string;
        created?: number;
        skippedDuplicates?: number;
        fetched?: number;
      } | null;

      if (!response.ok) {
        setError(body?.error ?? "Could not sync from Remotive");
        return;
      }

      setMessage(
        `Synced ${body?.created ?? 0} new · ${body?.skippedDuplicates ?? 0} duplicates skipped · ${body?.fetched ?? 0} fetched`,
      );
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Network error while syncing Remotive jobs");
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || pending;

  return (
    <div className="flex flex-col items-stretch gap-1 sm:items-end">
      <button
        type="button"
        onClick={() => {
          void onSync();
        }}
        disabled={busy}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
      >
        {busy ? "Syncing…" : "Sync from Remotive"}
      </button>
      {message ? (
        <p className="text-xs text-emerald-700">{message}</p>
      ) : null}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
