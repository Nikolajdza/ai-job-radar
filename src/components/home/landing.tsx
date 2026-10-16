import Link from "next/link";
import type { ReactNode } from "react";

const FEATURES: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "CV → profile in seconds",
    body: "Drop in your PDF CV. AI reads it and fills your skills, bio, experience, and links — you review and edit.",
    icon: <IconDoc />,
  },
  {
    title: "Honest AI match score",
    body: "Every job gets a fit score with matching and missing skills, seniority check, and concrete CV suggestions.",
    icon: <IconTarget />,
  },
  {
    title: "Tailored cover letters",
    body: "Generate a letter grounded in your real experience. Pick tone and language, edit, copy, or download.",
    icon: <IconPen />,
  },
  {
    title: "Fresh remote jobs",
    body: "Software roles synced daily from Remotive, plus any listing you add yourself — no duplicates.",
    icon: <IconRadar />,
  },
  {
    title: "Your private pipeline",
    body: "Save jobs, track status from Interesting to Offer, and keep private notes per application.",
    icon: <IconKanban />,
  },
  {
    title: "You stay in control",
    body: "No auto-applying and no spam. AI prepares — you decide what to send and where.",
    icon: <IconShield />,
  },
];

const STEPS = [
  {
    title: "Create a free account",
    body: "Email or one click with GitHub / Google.",
  },
  {
    title: "Import your CV",
    body: "Upload a PDF — AI turns it into an editable profile.",
  },
  {
    title: "Match, prepare, apply",
    body: "See your fit, generate a cover letter, and apply on the original listing.",
  },
];

export function LandingHero({ jobCount }: { jobCount: number }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-14 text-white sm:px-12 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-emerald-500/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-40 h-[26rem] w-[26rem] rounded-full bg-teal-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:24px_24px]"
      />

      <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Free · AI-powered · {jobCount > 0 ? `${jobCount} open roles` : "Remote-first"}
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Find the roles that fit you.{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
              Apply with confidence.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
            AI Job Radar reads your CV, scores every listing against your real
            skills, explains the gaps, and drafts a tailored cover letter — so
            you spend time on the right applications.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center rounded-xl bg-emerald-500 px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
            >
              Get started — it&apos;s free
            </Link>
            <a
              href="#jobs"
              className="inline-flex h-11 items-center rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-medium text-white hover:bg-white/10"
            >
              Browse jobs
            </a>
          </div>
        </div>

        <PreviewCard />
      </div>
    </section>
  );
}

function PreviewCard() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-400/20 to-transparent blur-2xl" />
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Senior Frontend Engineer</p>
            <p className="mt-0.5 text-xs text-slate-400">Acme · Remote · €70–90k</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-400 text-sm font-semibold text-emerald-300">
            86
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {["React", "TypeScript", "Next.js"].map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-emerald-400/15 px-2 py-0.5 text-[11px] font-medium text-emerald-200"
            >
              {skill}
            </span>
          ))}
          <span className="rounded-md bg-amber-400/15 px-2 py-0.5 text-[11px] font-medium text-amber-200">
            GraphQL
          </span>
        </div>
        <div className="mt-4 space-y-1.5">
          <div className="h-2 w-full rounded bg-white/10" />
          <div className="h-2 w-5/6 rounded bg-white/10" />
          <div className="h-2 w-2/3 rounded bg-white/10" />
        </div>
        <div className="mt-5 flex gap-2">
          <span className="flex-1 rounded-lg bg-emerald-500 py-2 text-center text-xs font-semibold text-slate-950">
            Prepare & apply
          </span>
          <span className="rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-300">
            Cover letter ✓
          </span>
        </div>
      </div>
    </div>
  );
}

export function LandingFeatures() {
  return (
    <section className="space-y-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-emerald-700">What it does</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Everything between &ldquo;found a job&rdquo; and &ldquo;hit apply&rdquo;
        </h2>
        <p className="mt-3 text-slate-500">
          One place to discover roles, understand your fit, and prepare a strong
          application — powered by free, open AI models.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              {feature.icon}
            </span>
            <h3 className="mt-4 font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{feature.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function LandingSteps() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-emerald-700">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Three steps to a better application
          </h2>
          <Link
            href="/sign-up"
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Create free account
          </Link>
        </div>
        <ol className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="rounded-2xl bg-slate-50 p-5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function IconDoc() {
  return (
    <Svg>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </Svg>
  );
}

function IconTarget() {
  return (
    <Svg>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.5" />
    </Svg>
  );
}

function IconPen() {
  return (
    <Svg>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" />
      <path d="m13.5 6.5 4 4" />
    </Svg>
  );
}

function IconRadar() {
  return (
    <Svg>
      <path d="M12 12 19 5" />
      <path d="M20.5 12A8.5 8.5 0 1 1 12 3.5" />
      <path d="M16 12a4 4 0 1 1-4-4" />
    </Svg>
  );
}

function IconKanban() {
  return (
    <Svg>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16M15 4v16" />
    </Svg>
  );
}

function IconShield() {
  return (
    <Svg>
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}
