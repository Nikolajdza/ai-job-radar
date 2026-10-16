import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/jobs/new", label: "Add job" },
  { href: "/profile", label: "Profile" },
] as const;

export function Nav({ currentPath }: { currentPath: string }) {
  return (
    <nav aria-label="Primary" className="hidden gap-1 sm:flex">
      {links.map((link) => {
        const active = currentPath === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900"
                : "rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
