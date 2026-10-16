"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MatchScore } from "@/components/dashboard/match-score";
import type { StoredJobAnalysis } from "@/lib/ai/schema";

type JobAnalysisPanelProps = {
  jobId: string;
  initialAnalysis: StoredJobAnalysis | null;
};

export function JobAnalysisPanel({
  jobId,
  initialAnalysis,
}: JobAnalysisPanelProps) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [error, setError] = useState<string | null>(null);
  const pending = loading || refreshing;

  async function runAnalysis() {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/jobs/${jobId}/analyze`, {
        method: "POST",
      });

      const body = (await response.json().catch(() => null)) as {
        error?: string;
        analysis?: StoredJobAnalysis;
      } | null;

      if (!response.ok || !body?.analysis) {
        setError(body?.error ?? "Analysis failed. You can retry.");
        return;
      }

      setAnalysis(body.analysis);
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Network error while contacting the analysis API. You can retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Match this job to your profile
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Compares the listing to your profile and CV. With{" "}
            <code className="text-xs">AI_PROVIDER=mock</code> this is a skill
            overlap heuristic; with <code className="text-xs">groq</code> or{" "}
            <code className="text-xs">openai</code> it uses a real LLM. Not a
            hiring probability.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void runAnalysis();
          }}
          disabled={pending}
          className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending
            ? "Analyzing…"
            : analysis
              ? "Re-run match"
              : "Get AI match"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          <p>{error}</p>
          <button
            type="button"
            className="mt-2 font-medium underline"
            disabled={pending}
            onClick={() => {
              void runAnalysis();
            }}
          >
            Retry
          </button>
        </div>
      ) : null}

      {pending && !analysis ? (
        <p className="mt-4 text-sm text-slate-500">
          Running analysis with the configured provider…
        </p>
      ) : null}

      {analysis ? <AnalysisResult analysis={analysis} /> : null}

      {!analysis && !pending && !error ? (
        <p className="mt-4 text-sm text-slate-500">
          No saved analysis yet. Run one to see match score, skill gaps, and CV
          suggestions.
        </p>
      ) : null}
    </section>
  );
}

function AnalysisResult({ analysis }: { analysis: StoredJobAnalysis }) {
  return (
    <div className="mt-5 space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <MatchScore score={analysis.matchScore} />
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
            analysis.provider === "mock"
              ? "bg-slate-100 text-slate-600 ring-slate-200"
              : "bg-emerald-50 text-emerald-800 ring-emerald-200"
          }`}
        >
          {analysis.provider === "mock" ? "Heuristic mock" : "LLM"} ·{" "}
          {analysis.provider}/{analysis.model}
        </span>
        <p className="text-xs text-slate-400">
          updated{" "}
          {new Intl.DateTimeFormat("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(analysis.updatedAt))}
        </p>
      </div>

      <p className="text-sm leading-6 text-slate-700">{analysis.explanation}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <TagList title="Matching skills" items={analysis.matchingSkills} tone="positive" />
        <TagList title="Missing skills" items={analysis.missingSkills} tone="warning" />
        <TagList
          title="Required qualifications"
          items={analysis.requiredQualifications}
        />
        <TagList
          title="Preferred qualifications"
          items={analysis.preferredQualifications}
        />
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Seniority compatibility
        </h4>
        <p className="mt-2 text-sm text-slate-700">
          {analysis.seniorityCompatibility}
        </p>
      </div>

      <BulletList title="Concerns" items={analysis.concerns} />
      <BulletList title="Uncertainties" items={analysis.uncertainties} />
      <BulletList title="CV suggestions" items={analysis.cvSuggestions} />
    </div>
  );
}

function TagList({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: "neutral" | "positive" | "warning";
}) {
  const toneClass =
    tone === "positive"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
      : tone === "warning"
        ? "bg-amber-50 text-amber-900 ring-amber-200"
        : "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">None listed</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <li
              key={item}
              className={`rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${toneClass}`}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </h4>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">None listed</p>
      ) : (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
