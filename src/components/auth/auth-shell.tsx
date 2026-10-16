import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/ui/logo";

const HIGHLIGHTS = [
  "Upload a PDF CV — AI fills your profile in seconds",
  "Match score, skill gaps, and CV tips for every job",
  "Tailored cover letters you can edit before applying",
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-emerald-500/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl"
        />
        <Link href="/" className="relative flex items-center gap-2.5">
          <LogoMark className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-tight">AI Job Radar</span>
        </Link>
        <div className="relative space-y-6">
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            Your AI co-pilot for a smarter, calmer job search.
          </h2>
          <ul className="space-y-3 text-sm text-slate-300">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-slate-500">
          Free and open — no auto-applying, you stay in control.
        </p>
      </aside>

      <main className="flex flex-col justify-center px-4 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <LogoMark />
            <span className="font-semibold tracking-tight text-slate-900">
              AI Job Radar
            </span>
          </Link>
          {children}
          <p className="mt-8 text-center text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600">
              ← Browse jobs without an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export function AuthFormSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-8 w-2/3 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
      <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
      <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
    </div>
  );
}
