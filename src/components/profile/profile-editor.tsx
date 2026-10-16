"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { CvImport, type CvImportResult } from "@/components/profile/cv-import";
import { TagInput } from "@/components/ui/tag-input";
import { getProfileCompleteness } from "@/lib/profile/completeness";
import { WORK_FORMATS, WORK_FORMAT_LABELS, type WorkFormat } from "@/lib/types/job";
import type { CandidateProfile } from "@/lib/types/profile";

type FormState = {
  fullName: string;
  headline: string;
  bio: string;
  avatarUrl: string | null;
  currentLocation: string;
  yearsOfExperience: string;
  openToWork: boolean;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  experienceSummary: string;
  skills: string[];
  preferredTechnologies: string[];
  targetRoles: string[];
  locationPreferences: string[];
  workFormatPreferences: WorkFormat[];
  salaryExpectation: string;
  cvText: string;
  cvFileName: string | null;
};

const SKILL_SUGGESTIONS = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "PostgreSQL",
  "Tailwind CSS",
  "Docker",
  "Git",
  "REST APIs",
  "Testing",
];

const ROLE_SUGGESTIONS = [
  "Frontend Developer",
  "Full-stack Developer",
  "React Developer",
  "Backend Developer",
  "AI Engineer",
];

function toFormState(profile: CandidateProfile): FormState {
  return {
    fullName: profile.fullName,
    headline: profile.headline,
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl,
    currentLocation: profile.currentLocation ?? "",
    yearsOfExperience:
      profile.yearsOfExperience === null ? "" : String(profile.yearsOfExperience),
    openToWork: profile.openToWork,
    linkedinUrl: profile.linkedinUrl ?? "",
    githubUrl: profile.githubUrl ?? "",
    portfolioUrl: profile.portfolioUrl ?? "",
    experienceSummary: profile.experienceSummary,
    skills: profile.skills,
    preferredTechnologies: profile.preferredTechnologies,
    targetRoles: profile.targetRoles,
    locationPreferences: profile.locationPreferences,
    workFormatPreferences: profile.workFormatPreferences,
    salaryExpectation: profile.salaryExpectation ?? "",
    cvText: profile.cvText ?? "",
    cvFileName: profile.cvFileName,
  };
}

/** Prefer freshly extracted values, but never wipe a field the CV didn't cover. */
function mergeExtraction(current: FormState, result: CvImportResult): FormState {
  const extracted = result.extraction;
  const pick = (next: string | null | undefined, fallback: string) =>
    next && next.trim() ? next.trim() : fallback;
  const pickList = <T,>(next: T[], fallback: T[]) =>
    next.length > 0 ? next : fallback;

  return {
    ...current,
    fullName: pick(extracted.fullName, current.fullName),
    headline: pick(extracted.headline, current.headline),
    bio: pick(extracted.bio, current.bio),
    currentLocation: pick(extracted.currentLocation, current.currentLocation),
    yearsOfExperience:
      extracted.yearsOfExperience === null
        ? current.yearsOfExperience
        : String(extracted.yearsOfExperience),
    linkedinUrl: pick(extracted.linkedinUrl, current.linkedinUrl),
    githubUrl: pick(extracted.githubUrl, current.githubUrl),
    portfolioUrl: pick(extracted.portfolioUrl, current.portfolioUrl),
    experienceSummary: pick(extracted.experienceSummary, current.experienceSummary),
    skills: pickList(extracted.skills, current.skills),
    preferredTechnologies: pickList(
      extracted.preferredTechnologies,
      current.preferredTechnologies,
    ),
    targetRoles: pickList(extracted.targetRoles, current.targetRoles),
    locationPreferences: pickList(
      extracted.locationPreferences,
      current.locationPreferences,
    ),
    workFormatPreferences: pickList(
      extracted.workFormatPreferences,
      current.workFormatPreferences,
    ),
    salaryExpectation: pick(extracted.salaryExpectation, current.salaryExpectation),
    cvText: result.cvText,
    cvFileName: result.fileName ?? current.cvFileName,
  };
}

export function ProfileEditor({
  profile,
  email,
}: {
  profile: CandidateProfile;
  email: string;
}) {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const [saved, setSaved] = useState<FormState>(() => toFormState(profile));
  const [form, setForm] = useState<FormState>(saved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [importNote, setImportNote] = useState<string | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(saved),
    [form, saved],
  );

  const completeness = getProfileCompleteness({
    fullName: form.fullName,
    headline: form.headline,
    bio: form.bio,
    avatarUrl: form.avatarUrl,
    currentLocation: form.currentLocation,
    experienceSummary: form.experienceSummary,
    skills: form.skills,
    targetRoles: form.targetRoles,
    cvText: form.cvText,
    linkedinUrl: form.linkedinUrl,
    githubUrl: form.githubUrl,
    portfolioUrl: form.portfolioUrl,
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setNotice(null);
  }

  function onImported(result: CvImportResult) {
    setForm((current) => mergeExtraction(current, result));
    setError(null);
    setNotice(null);
    setImportNote(
      `${result.extraction.notesForUser || "Fields filled from your CV."} Review everything, then save. (${result.provider}/${result.model})`,
    );
  }

  async function onSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError(null);
    setNotice(null);
    setSaving(true);

    const years = form.yearsOfExperience.trim();
    const payload = {
      ...form,
      yearsOfExperience: years === "" ? null : Number.parseInt(years, 10),
      bio: form.bio || null,
      currentLocation: form.currentLocation || null,
      linkedinUrl: form.linkedinUrl || null,
      githubUrl: form.githubUrl || null,
      portfolioUrl: form.portfolioUrl || null,
      salaryExpectation: form.salaryExpectation || null,
      cvText: form.cvText || null,
    };

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        details?: { fieldErrors?: Record<string, string[]> };
        profile?: CandidateProfile;
      } | null;

      if (!response.ok || !body?.profile) {
        const fieldErrors = body?.details?.fieldErrors;
        const firstField = fieldErrors ? Object.keys(fieldErrors)[0] : null;
        setError(
          firstField
            ? `${firstField}: ${fieldErrors?.[firstField]?.[0] ?? "invalid"}`
            : (body?.error ?? "Could not save profile"),
        );
        return;
      }

      const next = toFormState(body.profile);
      setSaved(next);
      setForm(next);
      setImportNote(null);
      setNotice("Profile saved. Your matches and cover letters will use it.");
      startTransition(() => router.refresh());
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  const busy = saving || refreshing;

  return (
    <form onSubmit={onSubmit} className="space-y-6 pb-24">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#065f46]" />
        <div className="-mt-12 flex flex-col gap-6 px-6 pb-6 sm:flex-row">
          <AvatarUploader
            name={form.fullName}
            value={form.avatarUrl}
            onChange={(value) => update("avatarUrl", value)}
          />
          <div className="flex-1 space-y-4 sm:pt-14">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Full name"
                value={form.fullName}
                onChange={(value) => update("fullName", value)}
                required
              />
              <TextField
                label="Headline"
                value={form.headline}
                onChange={(value) => update("headline", value)}
                placeholder="Frontend Developer · React & TypeScript"
              />
              <TextField
                label="Location"
                value={form.currentLocation}
                onChange={(value) => update("currentLocation", value)}
                placeholder="Belgrade, Serbia"
              />
              <TextField
                label="Years of experience"
                type="number"
                value={form.yearsOfExperience}
                onChange={(value) => update("yearsOfExperience", value)}
                placeholder="3"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-3 text-sm">
                <span className="relative inline-flex">
                  <input
                    type="checkbox"
                    checked={form.openToWork}
                    onChange={(event) => update("openToWork", event.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="h-6 w-11 rounded-full bg-slate-200 transition peer-checked:bg-emerald-500" />
                  <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                </span>
                <span className="font-medium text-slate-700">Open to work</span>
              </label>
              <p className="text-xs text-slate-400">Signed in as {email}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-6">
          <Card
            title="Import from CV"
            description="Upload your PDF and AI fills the fields below. Nothing is saved until you click Save."
          >
            <CvImport
              currentFileName={form.cvFileName}
              currentCvText={form.cvText}
              onImported={onImported}
            />
            {importNote ? (
              <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                ✨ {importNote}
              </p>
            ) : null}
          </Card>

          <Card title="About you" description="Shown to the AI when matching and writing letters.">
            <TextArea
              label="Bio"
              value={form.bio}
              onChange={(value) => update("bio", value)}
              rows={4}
              maxLength={1500}
              placeholder="A short first-person intro: what you do, what you're great at, what you want next."
            />
            <TextArea
              label="Experience summary"
              value={form.experienceSummary}
              onChange={(value) => update("experienceSummary", value)}
              rows={7}
              maxLength={10_000}
              placeholder="Roles, companies, projects and measurable outcomes."
            />
          </Card>

          <Card title="Skills" description="Press Enter or comma to add. Paste a comma-separated list to add many.">
            <TagInput
              label="Skills"
              values={form.skills}
              onChange={(value) => update("skills", value)}
              suggestions={SKILL_SUGGESTIONS}
              tone="emerald"
            />
            <TagInput
              label="Preferred technologies"
              values={form.preferredTechnologies}
              onChange={(value) => update("preferredTechnologies", value)}
              hint="What you'd love to work with next."
            />
          </Card>

          <Card title="What you're looking for">
            <TagInput
              label="Target roles"
              values={form.targetRoles}
              onChange={(value) => update("targetRoles", value)}
              suggestions={ROLE_SUGGESTIONS}
            />
            <TagInput
              label="Location preferences"
              values={form.locationPreferences}
              onChange={(value) => update("locationPreferences", value)}
              placeholder="Europe, Remote, Belgrade…"
            />
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-slate-700">
                Work format
              </legend>
              <div className="flex flex-wrap gap-2">
                {WORK_FORMATS.map((format) => {
                  const active = form.workFormatPreferences.includes(format);
                  return (
                    <button
                      key={format}
                      type="button"
                      aria-pressed={active}
                      onClick={() =>
                        update(
                          "workFormatPreferences",
                          active
                            ? form.workFormatPreferences.filter((value) => value !== format)
                            : [...form.workFormatPreferences, format],
                        )
                      }
                      className={
                        active
                          ? "rounded-full bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white"
                          : "rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      }
                    >
                      {WORK_FORMAT_LABELS[format]}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <TextField
              label="Salary expectation"
              value={form.salaryExpectation}
              onChange={(value) => update("salaryExpectation", value)}
              placeholder="€3,000–4,000 / month"
            />
          </Card>

          <Card title="Links">
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                label="LinkedIn"
                value={form.linkedinUrl}
                onChange={(value) => update("linkedinUrl", value)}
                placeholder="linkedin.com/in/you"
              />
              <TextField
                label="GitHub"
                value={form.githubUrl}
                onChange={(value) => update("githubUrl", value)}
                placeholder="github.com/you"
              />
              <TextField
                label="Portfolio"
                value={form.portfolioUrl}
                onChange={(value) => update("portfolioUrl", value)}
                placeholder="you.dev"
              />
            </div>
          </Card>

          <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-sm font-semibold text-slate-900">
              Raw CV text
              <span className="text-xs font-normal text-slate-400 group-open:hidden">
                {form.cvText ? `${form.cvText.length.toLocaleString()} characters` : "empty"}
              </span>
            </summary>
            <div className="px-6 pb-6">
              <textarea
                rows={12}
                value={form.cvText}
                onChange={(event) => update("cvText", event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs leading-5 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
              <p className="mt-2 text-xs text-slate-400">
                Used as extra context for match analysis and cover letters.
              </p>
            </div>
          </details>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Profile strength</h2>
              <span className="text-sm font-semibold text-emerald-700">
                {completeness.percent}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                style={{ width: `${completeness.percent}%` }}
              />
            </div>
            <ul className="mt-4 space-y-2">
              {completeness.items.map((item) => (
                <li key={item.key} className="flex items-center gap-2 text-sm">
                  <span
                    aria-hidden
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      item.done ? "bg-emerald-500 text-white" : "border border-slate-300"
                    }`}
                  >
                    {item.done ? "✓" : ""}
                  </span>
                  <span className={item.done ? "text-slate-500 line-through" : "text-slate-700"}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur transition ${
          dirty || error || notice ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p
            className={`text-sm ${error ? "text-rose-600" : notice ? "text-emerald-700" : "text-slate-600"}`}
            role={error ? "alert" : undefined}
          >
            {error ?? notice ?? "You have unsaved changes."}
          </p>
          <div className="flex gap-2">
            {dirty ? (
              <button
                type="button"
                onClick={() => {
                  setForm(saved);
                  setImportNote(null);
                  setError(null);
                }}
                disabled={busy}
                className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Discard
              </button>
            ) : null}
            <button
              type="submit"
              disabled={busy || !dirty}
              className="inline-flex h-9 items-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        min={type === "number" ? 0 : undefined}
        max={type === "number" ? 60 : undefined}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows,
  maxLength,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  maxLength: number;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 flex items-center justify-between font-medium text-slate-700">
        {label}
        <span className="text-xs font-normal text-slate-400">
          {value.length}/{maxLength.toLocaleString()}
        </span>
      </span>
      <textarea
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
      />
    </label>
  );
}
