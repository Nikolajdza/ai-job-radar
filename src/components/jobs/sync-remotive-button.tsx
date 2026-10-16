"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  REMOTIVE_FOCUSES,
  REMOTIVE_FOCUS_LABELS,
  type RemotiveFocus,
} from "@/lib/jobs/sources/remotive";

export function SyncRemotiveButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<RemotiveFocus>("software");
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
        body: JSON.stringify({ focus, limit: 60 }),
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
        `${REMOTIVE_FOCUS_LABELS[focus]}: ${body?.created ?? 0} new · ${body?.skippedDuplicates ?? 0} duplicates · ${body?.fetched ?? 0} fetched`,
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
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="remotive-focus">
          Sync focus
        </label>
        <select
          id="remotive-focus"
          value={focus}
          disabled={busy}
          onChange={(event) => setFocus(event.target.value as RemotiveFocus)}
          className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-800"
        >
          {REMOTIVE_FOCUSES.map((value) => (
            <option key={value} value={value}>
              {REMOTIVE_FOCUS_LABELS[value]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            void onSync();
          }}
          disabled={busy}
          className="h-9 shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          {busy ? "Syncing…" : "Sync Remotive"}
        </button>
      </div>
      {message ? (
        <p className="max-w-xs text-right text-xs text-emerald-700">{message}</p>
      ) : null}
      {error ? (
        <p className="max-w-xs text-right text-xs text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}
