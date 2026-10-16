export type SearchSuggestion = {
  label: string;
  /** Text inserted into the search box. */
  query: string;
  /** Optional role chip to activate with the suggestion. */
  roleFocus?: "frontend" | "fullstack" | "backend";
};

/**
 * Curated suggestions for the dashboard search box.
 * Matched against whatever the user has typed so far.
 */
export const SEARCH_SUGGESTIONS: SearchSuggestion[] = [
  { label: "Frontend", query: "frontend", roleFocus: "frontend" },
  { label: "React", query: "react", roleFocus: "frontend" },
  { label: "Next.js", query: "next.js", roleFocus: "frontend" },
  { label: "TypeScript", query: "typescript" },
  { label: "Full-stack", query: "full-stack", roleFocus: "fullstack" },
  { label: "Backend", query: "backend", roleFocus: "backend" },
  { label: "Node.js", query: "node", roleFocus: "backend" },
  { label: "Python", query: "python", roleFocus: "backend" },
  { label: "Remote Europe", query: "europe" },
  { label: "Senior", query: "senior" },
  { label: "AI / LLM", query: "ai" },
];

export function matchSearchSuggestions(
  input: string,
  limit = 6,
): SearchSuggestion[] {
  const normalized = input.trim().toLowerCase();
  if (!normalized) {
    return SEARCH_SUGGESTIONS.slice(0, limit);
  }

  return SEARCH_SUGGESTIONS.filter((suggestion) => {
    const haystack = `${suggestion.label} ${suggestion.query}`.toLowerCase();
    return (
      haystack.includes(normalized) ||
      normalized.split(/\s+/).every((token) => haystack.includes(token))
    );
  }).slice(0, limit);
}
