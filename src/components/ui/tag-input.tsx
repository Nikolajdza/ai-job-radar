"use client";

import { useId, useState, type ClipboardEvent, type KeyboardEvent } from "react";

type TagInputProps = {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  hint?: string;
  suggestions?: string[];
  max?: number;
  tone?: "slate" | "emerald";
};

function addUnique(current: string[], incoming: string[], max: number): string[] {
  const seen = new Set(current.map((value) => value.toLowerCase()));
  const next = [...current];
  for (const raw of incoming) {
    const value = raw.trim().slice(0, 100);
    if (!value || seen.has(value.toLowerCase())) continue;
    if (next.length >= max) break;
    seen.add(value.toLowerCase());
    next.push(value);
  }
  return next;
}

export function TagInput({
  label,
  values,
  onChange,
  placeholder = "Type and press Enter",
  hint,
  suggestions = [],
  max = 50,
  tone = "slate",
}: TagInputProps) {
  const inputId = useId();
  const [draft, setDraft] = useState("");

  const chipClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
      : "bg-slate-100 text-slate-700 ring-slate-200";

  const lowerValues = new Set(values.map((value) => value.toLowerCase()));
  const openSuggestions = suggestions
    .filter((value) => !lowerValues.has(value.toLowerCase()))
    .slice(0, 8);

  function commit(raw: string) {
    const parts = raw.split(/[,\n]/);
    const next = addUnique(values, parts, max);
    if (next.length !== values.length) onChange(next);
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (draft.trim()) commit(draft);
    } else if (event.key === "Backspace" && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData("text");
    if (/[,\n]/.test(text)) {
      event.preventDefault();
      commit(text);
    }
  }

  return (
    <div className="text-sm">
      <label htmlFor={inputId} className="mb-1.5 block font-medium text-slate-700">
        {label}
      </label>
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
        {values.map((value) => (
          <span
            key={value}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ring-1 ring-inset ${chipClass}`}
          >
            {value}
            <button
              type="button"
              onClick={() => onChange(values.filter((item) => item !== value))}
              className="rounded text-current opacity-60 hover:opacity-100"
              aria-label={`Remove ${value}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => {
            if (draft.trim()) commit(draft);
          }}
          placeholder={values.length === 0 ? placeholder : ""}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-slate-400"
        />
      </div>
      {openSuggestions.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {openSuggestions.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange(addUnique(values, [value], max))}
              className="rounded-full border border-dashed border-slate-300 px-2.5 py-0.5 text-xs text-slate-500 hover:border-slate-400 hover:text-slate-800"
            >
              + {value}
            </button>
          ))}
        </div>
      ) : null}
      {hint ? <p className="mt-1.5 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
