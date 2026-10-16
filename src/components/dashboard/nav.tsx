import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/jobs/new", label: "Add job" },
  { href: "/profile", label: "Profile" },
] as const;

export function Nav({ currentPath }: { currentPath: string }) {
  return (
    <nav aria-label="Primary" className="flex flex-wrap gap-1">
      {links.map((link) => {
        const active = currentPath === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
