import Link from "next/link";
import { Suspense } from "react";
import { Nav } from "@/components/dashboard/nav";
import { UserMenu } from "@/components/dashboard/user-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LogoMark } from "@/components/ui/logo";
import { getCurrentUser } from "@/lib/session";

export function AppHeader({ currentPath }: { currentPath: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/75 backdrop-blur-md dark:border-white/10 dark:bg-white/30 dark:backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-base font-semibold tracking-tight text-slate-900">
            AI Job Radar
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Suspense fallback={<div className="h-9 w-40" aria-hidden />}>
            <HeaderAuth currentPath={currentPath} />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function HeaderAuth({ currentPath }: { currentPath: string }) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
        >
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Nav currentPath={currentPath} />
      <UserMenu user={user} />
    </div>
  );
}
