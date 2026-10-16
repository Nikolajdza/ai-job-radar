export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Portfolio project
          </p>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
            AI Job Radar
          </h1>
        </div>
        <p className="hidden text-sm text-slate-500 sm:block">
          Milestone 1 · mock data only
        </p>
      </div>
    </header>
  );
}
