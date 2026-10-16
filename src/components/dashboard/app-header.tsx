import { Nav } from "@/components/dashboard/nav";

export function AppHeader({ currentPath }: { currentPath: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Portfolio project
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            AI Job Radar
          </h1>
        </div>
        <Nav currentPath={currentPath} />
      </div>
    </header>
  );
}
