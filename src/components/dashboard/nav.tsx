"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/pipeline", label: "My jobs" },
  { href: "/jobs/new", label: "Add job" },
  { href: "/profile", label: "Profile" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav aria-label="Primary" className="hidden gap-1 sm:flex">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
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
