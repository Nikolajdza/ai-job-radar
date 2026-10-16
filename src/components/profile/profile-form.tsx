"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { FormEvent } from "react";
import type { CandidateProfile } from "@/lib/types/profile";
import { WORK_FORMATS, WORK_FORMAT_LABELS } from "@/lib/types/job";

type ProfileFormProps = {
  profile: CandidateProfile;
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

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const form = new FormData(event.currentTarget);
    const workFormatPreferences = WORK_FORMATS.filter(
      (format) => form.get(`work-${format}`) === "on",
    );

    const payload = {
      fullName: String(form.get("fullName") ?? ""),
      headline: String(form.get("headline") ?? ""),
      experienceSummary: String(form.get("experienceSummary") ?? ""),
      skills: linesToList(String(form.get("skills") ?? "")),
      preferredTechnologies: linesToList(
        String(form.get("preferredTechnologies") ?? ""),
      ),
      targetRoles: linesToList(String(form.get("targetRoles") ?? "")),
      locationPreferences: linesToList(
        String(form.get("locationPreferences") ?? ""),
      ),
      workFormatPreferences,
      salaryExpectation: String(form.get("salaryExpectation") ?? "") || null,
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

    setSuccess(true);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Full name"
          name="fullName"
          defaultValue={profile.fullName}
          required
        />
        <Field
          label="Salary expectation"
          name="salaryExpectation"
          defaultValue={profile.salaryExpectation ?? ""}
        />
      </div>

      <Field
        label="Headline"
        name="headline"
        defaultValue={profile.headline}
        required
      />

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-slate-700">
          Experience summary
        </span>
        <textarea
          name="experienceSummary"
          required
          minLength={20}
          rows={6}
          defaultValue={profile.experienceSummary}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <ListField
          label="Skills (one per line)"
          name="skills"
          defaultValue={listToLines(profile.skills)}
        />
        <ListField
          label="Preferred technologies"
          name="preferredTechnologies"
          defaultValue={listToLines(profile.preferredTechnologies)}
        />
        <ListField
          label="Target roles"
          name="targetRoles"
          defaultValue={listToLines(profile.targetRoles)}
        />
        <ListField
          label="Location preferences"
          name="locationPreferences"
          defaultValue={listToLines(profile.locationPreferences)}
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
                name={`work-${format}`}
                defaultChecked={profile.workFormatPreferences.includes(format)}
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
          Profile saved.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-700">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
      />
    </label>
  );
}

function ListField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-700">{label}</span>
      <textarea
        name={name}
        rows={5}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
      />
    </label>
  );
}
