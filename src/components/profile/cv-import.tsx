"use client";

import { useRef, useState, type DragEvent } from "react";
import type { CvExtractOutput } from "@/lib/ai/cv-extract-schema";

export type CvImportResult = {
  extraction: CvExtractOutput;
  cvText: string;
  fileName: string | null;
  provider: string;
  model: string;
};

type CvImportProps = {
  currentFileName: string | null;
  currentCvText: string;
  onImported: (result: CvImportResult) => void;
};

type ExtractResponse = {
  error?: string;
  extraction?: CvExtractOutput;
  provider?: string;
  model?: string;
  cvText?: string;
  fileName?: string;
} | null;

export function CvImport({ currentFileName, currentCvText, onImported }: CvImportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState<"pdf" | "text" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState(currentCvText);

  async function uploadPdf(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setError("Please choose a PDF file.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("PDF is larger than 4 MB.");
      return;
    }

    setBusy("pdf");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/profile/cv-upload", {
        method: "POST",
        body: form,
      });
      const body = (await response.json().catch(() => null)) as ExtractResponse;
      if (!response.ok || !body?.extraction || !body.cvText) {
        setError(body?.error ?? "Could not read your CV. Try again.");
        return;
      }
      onImported({
        extraction: body.extraction,
        cvText: body.cvText,
        fileName: body.fileName ?? file.name,
        provider: body.provider ?? "unknown",
        model: body.model ?? "unknown",
      });
      setPasted(body.cvText);
    } catch {
      setError("Network error while uploading.");
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function extractPasted() {
    setError(null);
    setBusy("text");
    try {
      const response = await fetch("/api/profile/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: pasted }),
      });
      const body = (await response.json().catch(() => null)) as ExtractResponse;
      if (!response.ok || !body?.extraction) {
        setError(body?.error ?? "Could not extract profile from text.");
        return;
      }
      onImported({
        extraction: body.extraction,
        cvText: pasted.trim(),
        fileName: null,
        provider: body.provider ?? "unknown",
        model: body.model ?? "unknown",
      });
      setPasteOpen(false);
    } catch {
      setError("Network error while extracting.");
    } finally {
      setBusy(null);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void uploadPdf(event.dataTransfer.files?.[0]);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging
            ? "border-emerald-400 bg-emerald-50"
            : "border-slate-200 bg-slate-50/60 hover:border-slate-300"
        }`}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200">
          {busy === "pdf" ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
              aria-hidden
            >
              <path d="M12 16V4M7 9l5-5 5 5" />
              <path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
            </svg>
          )}
        </span>
        <div>
          <p className="font-medium text-slate-900">
            {busy === "pdf"
              ? "Reading your CV with AI…"
              : "Drop your CV here or browse"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            PDF up to 4 MB. AI fills your profile — you review before saving.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Choose PDF
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => setPasteOpen((open) => !open)}
            className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {pasteOpen ? "Hide text" : "Paste text instead"}
          </button>
        </div>
        {currentFileName ? (
          <p className="text-xs text-slate-500">
            Current CV: <span className="font-medium text-slate-700">{currentFileName}</span>
          </p>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(event) => {
            void uploadPdf(event.target.files?.[0]);
          }}
        />
      </div>

      {pasteOpen ? (
        <div className="space-y-2">
          <textarea
            rows={8}
            value={pasted}
            onChange={(event) => setPasted(event.target.value)}
            placeholder="Paste the text of your CV…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs leading-5 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="button"
            disabled={busy !== null || pasted.trim().length < 40}
            onClick={() => {
              void extractPasted();
            }}
            className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {busy === "text" ? "Extracting…" : "Extract with AI"}
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
    </div>
  );
}
