"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  COVER_LETTER_LANGUAGE_LABELS,
  COVER_LETTER_LANGUAGES,
  COVER_LETTER_TONE_LABELS,
  COVER_LETTER_TONES,
  type CoverLetterLanguage,
  type CoverLetterTone,
} from "@/lib/cover-letters/options";
import type { StoredCoverLetter } from "@/lib/cover-letters/types";
import type { ApplicationStatus } from "@/lib/types/job";

type CoverLetterStudioProps = {
  jobId: string;
  initialLetter: StoredCoverLetter | null;
  profileReady: boolean;
  sourceUrl: string;
  source: string;
  applicationStatus: ApplicationStatus | null;
};

type ApiResponse = { error?: string; coverLetter?: StoredCoverLetter } | null;

export function CoverLetterStudio({
  jobId,
  initialLetter,
  profileReady,
  sourceUrl,
  source,
  applicationStatus,
}: CoverLetterStudioProps) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const [letter, setLetter] = useState(initialLetter);
  const [tone, setTone] = useState<CoverLetterTone>(
    (initialLetter?.tone as CoverLetterTone) ?? "professional",
  );
  const [language, setLanguage] = useState<CoverLetterLanguage>(
    (initialLetter?.language as CoverLetterLanguage) ?? "en",
  );
  const [extraNotes, setExtraNotes] = useState("");
  const [subject, setSubject] = useState(initialLetter?.subject ?? "");
  const [content, setContent] = useState(initialLetter?.content ?? "");
  const [busy, setBusy] = useState<"generate" | "save" | "applied" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const dirty =
    letter !== null && (subject !== letter.subject || content !== letter.content);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const alreadyApplied =
    applicationStatus === "applied" ||
    applicationStatus === "interview" ||
    applicationStatus === "offer";

  function applyLetter(next: StoredCoverLetter) {
    setLetter(next);
    setSubject(next.subject);
    setContent(next.content);
  }

  async function generate() {
    if (dirty && !window.confirm("Replace your edits with a new AI draft?")) return;
    setError(null);
    setNotice(null);
    setBusy("generate");
    try {
      const response = await fetch(`/api/jobs/${jobId}/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone, language, extraNotes: extraNotes || null }),
      });
      const body = (await response.json().catch(() => null)) as ApiResponse;
      if (!response.ok || !body?.coverLetter) {
        setError(body?.error ?? "Could not generate a cover letter. Try again.");
        return;
      }
      applyLetter(body.coverLetter);
      setNotice("Draft ready — review and personalise it before sending.");
      startTransition(() => router.refresh());
    } catch {
      setError("Network error while generating. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    setError(null);
    setNotice(null);
    setBusy("save");
    try {
      const response = await fetch(`/api/jobs/${jobId}/cover-letter`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, content }),
      });
      const body = (await response.json().catch(() => null)) as ApiResponse;
      if (!response.ok || !body?.coverLetter) {
        setError(body?.error ?? "Could not save your edits.");
        return;
      }
      applyLetter(body.coverLetter);
      setNotice("Saved.");
      startTransition(() => router.refresh());
    } catch {
      setError("Network error while saving.");
    } finally {
      setBusy(null);
    }
  }

  async function markApplied() {
    setError(null);
    setBusy("applied");
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationStatus: "applied", saved: true }),
      });
      if (!response.ok) {
        setError("Could not update your pipeline status.");
        return;
      }
      setNotice("Marked as applied. Good luck! 🍀");
      startTransition(() => router.refresh());
    } finally {
      setBusy(null);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${content}`);
      setNotice("Copied to clipboard.");
    } catch {
      setError("Clipboard is not available in this browser.");
    }
  }

  function download() {
    const blob = new Blob([`${subject}\n\n${content}\n`], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cover-letter.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const pending = busy !== null || refreshing;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/60 p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-slate-900">Cover letter</h2>
          {letter ? (
            <p className="text-xs text-slate-400">
              {letter.provider === "manual"
                ? "Written by you"
                : `${letter.provider}/${letter.model}`}{" "}
              · updated{" "}
              {new Intl.DateTimeFormat("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(letter.updatedAt))}
            </p>
          ) : null}
        </div>

        {!profileReady ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Your profile is empty, so the AI has nothing to work with.{" "}
            <Link href="/profile" className="font-medium underline">
              Upload your CV
            </Link>{" "}
            first.
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-slate-600">Tone</legend>
            <div className="flex flex-wrap gap-1.5">
              {COVER_LETTER_TONES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTone(value)}
                  aria-pressed={tone === value}
                  className={
                    tone === value
                      ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                      : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  }
                >
                  {COVER_LETTER_TONE_LABELS[value]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-slate-600">
              Language
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {COVER_LETTER_LANGUAGES.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLanguage(value)}
                  aria-pressed={language === value}
                  className={
                    language === value
                      ? "rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
                      : "rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  }
                >
                  {COVER_LETTER_LANGUAGE_LABELS[value]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <label className="mt-3 block text-xs">
          <span className="mb-1.5 block font-medium text-slate-600">
            Anything to emphasise? (optional)
          </span>
          <input
            value={extraNotes}
            onChange={(event) => setExtraNotes(event.target.value)}
            maxLength={2000}
            placeholder="e.g. I can relocate, I used their product, mention my side project…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </label>

        <button
          type="button"
          onClick={() => {
            void generate();
          }}
          disabled={pending || !profileReady}
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
        >
          <span aria-hidden>✨</span>
          {busy === "generate"
            ? "Writing your letter…"
            : letter
              ? "Regenerate with AI"
              : "Generate with AI"}
        </button>
      </div>

      <div className="space-y-3 p-5">
        {busy === "generate" && !letter ? (
          <div className="space-y-2" aria-hidden>
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-3 animate-pulse rounded bg-slate-100"
                style={{ width: `${70 + ((index * 13) % 30)}%` }}
              />
            ))}
          </div>
        ) : null}

        {letter || content ? (
          <>
            <label className="block text-xs">
              <span className="mb-1.5 block font-medium text-slate-600">
                Subject / email title
              </span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={300}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>
            <label className="block text-xs">
              <span className="mb-1.5 flex items-center justify-between font-medium text-slate-600">
                Letter
                <span className="font-normal text-slate-400">
                  {wordCount} words{wordCount > 450 ? " · consider trimming" : ""}
                </span>
              </span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={18}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 font-serif text-[15px] leading-7 text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            {letter && letter.highlights.length > 0 ? (
              <div className="rounded-xl bg-emerald-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                  Why this letter works
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-emerald-900">
                  {letter.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : busy !== "generate" ? (
          <div className="rounded-xl border border-dashed border-slate-200 px-6 py-12 text-center">
            <p className="font-medium text-slate-900">No letter yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              Pick a tone and generate a draft grounded in your profile. You can
              edit everything before you send it.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubject("Application");
                setContent(" ");
              }}
              className="mt-4 text-sm font-medium text-slate-600 underline"
            >
              Or write it yourself
            </button>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {notice}
          </p>
        ) : null}
      </div>

      {content.trim() ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4">
          <button
            type="button"
            onClick={() => {
              void save();
            }}
            disabled={pending || (letter !== null && !dirty) || content.trim().length < 20}
            className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {busy === "save" ? "Saving…" : dirty || !letter ? "Save edits" : "Saved"}
          </button>
          <button
            type="button"
            onClick={() => {
              void copy();
            }}
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Download .txt
          </button>
          <span className="flex-1" />
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
          >
            {source === "remotive" ? "Apply on Remotive ↗" : "Open listing ↗"}
          </a>
          <button
            type="button"
            onClick={() => {
              void markApplied();
            }}
            disabled={pending || alreadyApplied}
            className="inline-flex h-9 items-center rounded-lg bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {alreadyApplied ? "Applied ✓" : busy === "applied" ? "Updating…" : "Mark as applied"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
