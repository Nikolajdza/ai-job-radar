export function AutomationStatus() {
  return (
    <p className="text-xs text-slate-400">
      Listings can come from manual entry,{" "}
      <a
        href="https://remotive.com"
        target="_blank"
        rel="noreferrer"
        className="underline hover:text-slate-600"
      >
        Remotive
      </a>
      , or local n8n ingest. Remotive jobs always link back to their Remotive
      URL.
    </p>
  );
}
