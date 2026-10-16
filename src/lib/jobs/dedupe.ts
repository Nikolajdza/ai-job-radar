/**
 * Build a stable duplicate key from company, title, and source URL.
 * Normalization keeps manual imports and future n8n ingestion consistent.
 */
export function buildJobDedupeKey(input: {
  company: string;
  title: string;
  sourceUrl: string;
}): string {
  const company = normalizePart(input.company);
  const title = normalizePart(input.title);
  const source = normalizeUrl(input.sourceUrl);

  return `${company}::${title}::${source}`;
}

function normalizePart(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeUrl(value: string): string {
  try {
    const url = new URL(value.trim());
    url.hash = "";
    const path = url.pathname.replace(/\/+$/, "") || "/";
    return `${url.protocol}//${url.host.toLowerCase()}${path}${url.search}`.toLowerCase();
  } catch {
    return normalizePart(value);
  }
}
