import Link from "next/link";
import type { ProfileCompleteness } from "@/lib/profile/completeness";

export function ProfileCompletenessCard({
  completeness,
}: {
  completeness: ProfileCompleteness;
}) {
  if (completeness.percent >= 100) return null;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">
            Your profile is {completeness.percent}% complete
          </p>
          <span className="text-xs font-medium text-emerald-800 sm:hidden">
            {completeness.percent}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${completeness.percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-600">
          Better profile → more accurate matches and cover letters. Missing:{" "}
          {completeness.missing
            .slice(0, 4)
            .map((item) => item.label.toLowerCase())
            .join(", ")}
          {completeness.missing.length > 4 ? "…" : ""}
        </p>
      </div>
      <Link
        href="/profile"
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
      >
        Complete profile
      </Link>
    </section>
  );
}
