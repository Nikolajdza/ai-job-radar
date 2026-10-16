import {
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/types/job";

type StatusBadgeProps = {
  status: ApplicationStatus | null;
};

const statusTone: Record<ApplicationStatus, string> = {
  interesting: "bg-sky-50 text-sky-800 ring-sky-200",
  to_apply: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  applied: "bg-violet-50 text-violet-800 ring-violet-200",
  interview: "bg-amber-50 text-amber-900 ring-amber-200",
  rejected: "bg-slate-100 text-slate-600 ring-slate-200",
  offer: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) {
    return (
      <span className="inline-flex rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-400 ring-1 ring-inset ring-slate-200">
        Untracked
      </span>
    );
  }

  return (
    <span
      className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusTone[status]}`}
    >
      {APPLICATION_STATUS_LABELS[status]}
    </span>
  );
}
