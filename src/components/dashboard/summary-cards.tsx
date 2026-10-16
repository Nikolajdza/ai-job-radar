import Link from "next/link";
import type { ReactNode } from "react";
import type { DashboardStats } from "@/lib/dashboard-stats";

type SummaryCardsProps = {
  stats: DashboardStats;
};

const cards: {
  key: keyof DashboardStats;
  label: string;
  hint: string;
  href?: string;
}[] = [
  {
    key: "savedJobs",
    label: "Liked",
    hint: "Jobs you want to come back to",
    href: "/pipeline?tab=liked",
  },
  {
    key: "applications",
    label: "Applications",
    hint: "Applied, interview, or offer",
  },
  {
    key: "interviews",
    label: "Interviews",
    hint: "Active interview pipeline",
    href: "/pipeline?tab=interview",
  },
  {
    key: "strongMatches",
    label: "Strong matches",
    hint: "Score 75+ (heuristic)",
  },
];

export function SummaryCards({ stats }: SummaryCardsProps) {
  return (
    <section aria-label="Dashboard summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <CardShell key={card.key} href={card.href}>
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {stats[card.key]}
          </p>
          <p className="mt-1 text-xs text-slate-400">{card.hint}</p>
        </CardShell>
      ))}
    </section>
  );
}

function CardShell({
  href,
  children,
}: {
  href?: string;
  children: ReactNode;
}) {
  const className =
    "rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-slate-300";
  if (!href) {
    return <article className={className}>{children}</article>;
  }
  return (
    <Link href={href} className={`${className} block hover:-translate-y-0.5 hover:shadow-md`}>
      {children}
    </Link>
  );
}
