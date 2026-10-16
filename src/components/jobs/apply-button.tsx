type ApplyButtonProps = {
  href: string;
  source?: string;
  className?: string;
};

/**
 * Opens the real job posting. Never auto-submits an application.
 */
export function ApplyButton({ href, source, className }: ApplyButtonProps) {
  const label =
    source === "remotive" ? "Apply on Remotive" : "Apply on listing site";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={
        className ??
        "inline-flex items-center justify-center rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
      }
    >
      {label}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
