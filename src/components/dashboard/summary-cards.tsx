import type { DashboardStats } from "@/lib/dashboard-stats";

type SummaryCardsProps = {
  stats: DashboardStats;
};

const cards: {
  key: keyof DashboardStats;
  label: string;
  hint: string;
}[] = [
  {
    key: "savedJobs",
    label: "Saved jobs",
    hint: "Jobs marked for follow-up",
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
        <article
          key={card.key}
          className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {stats[card.key]}
          </p>
          <p className="mt-1 text-xs text-slate-400">{card.hint}</p>
        </article>
      ))}
    </section>
  );
}
