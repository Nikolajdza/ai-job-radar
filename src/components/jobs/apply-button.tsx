import Link from "next/link";

type ApplyButtonProps = {
  jobId: string;
  className?: string;
  label?: string;
};

/** Opens the Application kit (cover letter + checklist). Never auto-submits. */
export function ApplyButton({
  jobId,
  className,
  label = "Prepare & apply",
}: ApplyButtonProps) {
  return (
    <Link
      href={`/jobs/${jobId}/apply`}
      className={
        className ??
        "inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
      }
    >
      {label}
      <span aria-hidden>→</span>
    </Link>
  );
}

type OriginalListingLinkProps = {
  href: string;
  source?: string;
  className?: string;
};

export function OriginalListingLink({
  href,
  source,
  className,
}: OriginalListingLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={
        className ??
        "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
      }
    >
      {source === "remotive" ? "Open on Remotive" : "Open original listing"}
      <span aria-hidden>↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
