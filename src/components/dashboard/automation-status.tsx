export function AutomationStatus() {
  return (
    <section className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-4 text-sm text-slate-600">
      <p className="font-medium text-slate-900">Automation (n8n)</p>
      <p className="mt-1">
        Local workflow ingest lives at{" "}
        <code className="rounded bg-slate-100 px-1 text-xs">
          POST /api/webhooks/jobs
        </code>
        . Start with{" "}
        <code className="rounded bg-slate-100 px-1 text-xs">npm run n8n:up</code>{" "}
        and follow <code className="rounded bg-slate-100 px-1 text-xs">n8n/README.md</code>.
      </p>
    </section>
  );
}
