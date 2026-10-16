export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      className={`${className} inline-flex items-center justify-center rounded-xl bg-slate-900 text-emerald-400 shadow-sm`}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="h-[60%] w-[60%]"
      >
        <circle cx="12" cy="12" r="8" opacity="0.35" />
        <circle cx="12" cy="12" r="4" opacity="0.7" />
        <path d="M12 12 18 6" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    </span>
  );
}
