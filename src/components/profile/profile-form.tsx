"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import type { CandidateProfile } from "@/lib/types/profile";
import {
  WORK_FORMATS,
  WORK_FORMAT_LABELS,
  type WorkFormat,
} from "@/lib/types/job";

type ProfileFormProps = {
  profile: CandidateProfile;
};

type FormState = {
  fullName: string;
  headline: string;
  experienceSummary: string;
  skills: string;
  preferredTechnologies: string;
  targetRoles: string;
  locationPreferences: string;
  workFormatPreferences: WorkFormat[];
  salaryExpectation: string;
  cvText: string;
};

function listToLines(values: string[]): string {
  return values.join("\n");
}

function linesToList(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toFormState(profile: CandidateProfile): FormState {
  return {
    fullName: profile.fullName,
    headline: profile.headline,
    experienceSummary: profile.experienceSummary,
    skills: listToLines(profile.skills),
    preferredTechnologies: listToLines(profile.preferredTechnologies),
    targetRoles: listToLines(profile.targetRoles),
    locationPreferences: listToLines(profile.locationPreferences),
    workFormatPreferences: profile.workFormatPreferences,
    salaryExpectation: profile.salaryExpectation ?? "",
    cvText: profile.cvText ?? "",
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [extractNote, setExtractNote] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => toFormState(profile));

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onExtractFromCv() {
    setError(null);
    setSuccess(null);
    setExtractNote(null);
    setExtracting(true);

    try {
      const response = await fetch("/api/profile/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText: form.cvText }),
      });

      const body = (await response.json().catch(() => null)) as {
        error?: string;
        extraction?: {
          fullName: string;
          headline: string;
          experienceSummary: string;
          skills: string[];
          preferredTechnologies: string[];
          targetRoles: string[];
          locationPreferences: string[];
          workFormatPreferences: WorkFormat[];
          salaryExpectation: string | null;
          notesForUser: string;
        };
        provider?: string;
        model?: string;
      } | null;

      if (!response.ok || !body?.extraction) {
        setError(body?.error ?? "Could not extract profile from CV");
        return;
      }

      const extracted = body.extraction;
      setForm((current) => ({
        ...current,
        fullName: extracted.fullName,
        headline: extracted.headline,
        experienceSummary: extracted.experienceSummary,
        skills: listToLines(extracted.skills),
        preferredTechnologies: listToLines(extracted.preferredTechnologies),
        targetRoles: listToLines(extracted.targetRoles),
        locationPreferences: listToLines(extracted.locationPreferences),
        workFormatPreferences: extracted.workFormatPreferences,
        salaryExpectation: extracted.salaryExpectation ?? "",
      }));
      setExtractNote(
        `${extracted.notesForUser} (${body.provider}/${body.model})`,
      );
      setSuccess(
        "Profile fields filled from CV. Review them, then click Save profile.",
      );
    } catch {
      setError("Network error while extracting from CV");
    } finally {
      setExtracting(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      fullName: form.fullName,
      headline: form.headline,
      experienceSummary: form.experienceSummary,
      skills: linesToList(form.skills),
      preferredTechnologies: linesToList(form.preferredTechnologies),
      targetRoles: linesToList(form.targetRoles),
      locationPreferences: linesToList(form.locationPreferences),
      workFormatPreferences: form.workFormatPreferences,
      salaryExpectation: form.salaryExpectation || null,
      cvText: form.cvText || null,
    };

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(body?.error ?? "Could not save profile");
      return;
    }

    setSuccess("Profile saved. You can now run AI match on job listings.");
    startTransition(() => {
      router.refresh();
    });
  }

  const busy = pending || extracting;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Add CV</h3>
            <p className="mt-1 text-xs text-slate-500">
              Paste CV text, then extract structured profile fields with AI.
              Review everything before saving. PDF upload can come later.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void onExtractFromCv();
            }}
            disabled={busy || form.cvText.trim().length < 40}
            className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {extracting ? "Extracting…" : "Extract from CV"}
          </button>
        </div>
        <textarea
          name="cvText"
          rows={10}
          value={form.cvText}
          onChange={(event) => updateField("cvText", event.target.value)}
          placeholder="Paste CV content here…"
          className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
        />
        {extractNote ? (
          <p className="mt-2 text-xs text-slate-500">{extractNote}</p>
        ) : null}
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          value={form.fullName}
          onChange={(value) => updateField("fullName", value)}
          required
        />
        <Field
          label="Salary expectation"
          value={form.salaryExpectation}
          onChange={(value) => updateField("salaryExpectation", value)}
        />
      </div>

      <Field
        label="Headline"
        value={form.headline}
        onChange={(value) => updateField("headline", value)}
        required
      />

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-700">
          Experience summary
        </span>
        <textarea
          required
          minLength={20}
          rows={6}
          value={form.experienceSummary}
          onChange={(event) =>
            updateField("experienceSummary", event.target.value)
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <ListField
          label="Skills (one per line)"
          value={form.skills}
          onChange={(value) => updateField("skills", value)}
        />
        <ListField
          label="Preferred technologies"
          value={form.preferredTechnologies}
          onChange={(value) => updateField("preferredTechnologies", value)}
        />
        <ListField
          label="Target roles"
          value={form.targetRoles}
          onChange={(value) => updateField("targetRoles", value)}
        />
        <ListField
          label="Location preferences"
          value={form.locationPreferences}
          onChange={(value) => updateField("locationPreferences", value)}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">
          Work format preferences
        </legend>
        <div className="flex flex-wrap gap-4">
          {WORK_FORMATS.map((format) => (
            <label
              key={format}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={form.workFormatPreferences.includes(format)}
                onChange={(event) => {
                  updateField(
                    "workFormatPreferences",
                    event.target.checked
                      ? [...form.workFormatPreferences, format]
                      : form.workFormatPreferences.filter(
                          (value) => value !== format,
                        ),
                  );
                }}
                className="rounded border-slate-300"
              />
              {WORK_FORMAT_LABELS[format]}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
      />
    </label>
  );
}

function ListField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-700">{label}</span>
      <textarea
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
      />
    </label>
  );
}
