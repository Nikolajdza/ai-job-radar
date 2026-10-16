export type SearchSuggestion = {
  label: string;
  /** Text inserted into the search box. */
  query: string;
  kind: "role" | "skill" | "company" | "title";
  /** Optional role chip to activate with the suggestion. */
  roleFocus?: "frontend" | "fullstack" | "backend";
};

export type SuggestionJob = {
  title: string;
  company: string;
};

type Keyword = {
  label: string;
  query: string;
  kind: "role" | "skill";
  roleFocus?: SearchSuggestion["roleFocus"];
  /** Extra spellings that should complete to this keyword. */
  aliases?: string[];
};

const KEYWORDS: Keyword[] = [
  { label: "Frontend", query: "frontend", kind: "role", roleFocus: "frontend", aliases: ["front-end", "front end", "front"] },
  { label: "Backend", query: "backend", kind: "role", roleFocus: "backend", aliases: ["back-end", "back end", "back"] },
  { label: "Full-stack", query: "full-stack", kind: "role", roleFocus: "fullstack", aliases: ["fullstack", "full stack", "full"] },
  { label: "React", query: "react", kind: "skill", roleFocus: "frontend" },
  { label: "Next.js", query: "next.js", kind: "skill", roleFocus: "frontend", aliases: ["nextjs", "next"] },
  { label: "TypeScript", query: "typescript", kind: "skill", aliases: ["ts"] },
  { label: "JavaScript", query: "javascript", kind: "skill", aliases: ["js"] },
  { label: "Node.js", query: "node.js", kind: "skill", roleFocus: "backend", aliases: ["nodejs", "node"] },
  { label: "Python", query: "python", kind: "skill", roleFocus: "backend" },
  { label: "Java", query: "java", kind: "skill", roleFocus: "backend" },
  { label: "Go", query: "golang", kind: "skill", roleFocus: "backend", aliases: ["go", "golang"] },
  { label: "Rust", query: "rust", kind: "skill" },
  { label: "Vue", query: "vue", kind: "skill", roleFocus: "frontend" },
  { label: "Angular", query: "angular", kind: "skill", roleFocus: "frontend" },
  { label: "PostgreSQL", query: "postgresql", kind: "skill", aliases: ["postgres"] },
  { label: "AWS", query: "aws", kind: "skill" },
  { label: "Kubernetes", query: "kubernetes", kind: "skill", aliases: ["k8s"] },
  { label: "Docker", query: "docker", kind: "skill" },
  { label: "GraphQL", query: "graphql", kind: "skill" },
  { label: "DevOps", query: "devops", kind: "role" },
  { label: "AI", query: "ai", kind: "skill", aliases: ["llm", "machine learning"] },
  { label: "Data", query: "data", kind: "role", aliases: ["analytics"] },
  { label: "Mobile", query: "mobile", kind: "role", aliases: ["ios", "android"] },
  { label: "QA", query: "qa", kind: "role", aliases: ["quality"] },
  { label: "Senior", query: "senior", kind: "role" },
  { label: "Staff", query: "staff", kind: "role" },
];

const KIND_RANK: Record<SearchSuggestion["kind"], number> = {
  skill: 3,
  role: 2,
  company: 1,
  title: 0,
};

function tokensOf(value: string): string[] {
  return value.toLowerCase().match(/[a-z0-9+#]+(?:\.[a-z0-9]+)*/g) ?? [];
}

function mentions(text: string, needle: string): boolean {
  const target = needle.toLowerCase();
  return tokensOf(text).some((token) =>
    target.length <= 2 ? token === target : token === target || token.startsWith(target),
  );
}

function keywordNeedles(keyword: Keyword): string[] {
  return [keyword.query, keyword.label, ...(keyword.aliases ?? [])].map((value) =>
    value.toLowerCase(),
  );
}

function jobMentionsKeyword(job: SuggestionJob, keyword: Keyword): boolean {
  const text = `${job.title} ${job.company}`;
  return keywordNeedles(keyword).some((needle) => mentions(text, needle));
}

/** Higher means the typed text is completing this label, not merely contained in it. */
function completionScore(label: string, typed: string): number {
  const text = label.toLowerCase();
  const query = typed.toLowerCase();
  if (!query) return 0;
  if (text.startsWith(query)) return 100;
  if (tokensOf(text).some((token) => token.startsWith(query))) return 80;
  if (text.includes(query)) return 45;
  return 0;
}

function keywordScore(keyword: Keyword, typed: string): number {
  return Math.max(
    ...keywordNeedles(keyword).map((needle) => {
      if (needle.startsWith(typed.toLowerCase())) {
        return 100 - (needle.length - typed.length);
      }
      return completionScore(needle, typed);
    }),
  );
}

/**
 * Autocomplete for the job search box.
 * Suggestions are skills, roles, companies, and titles that actually appear
 * in the loaded jobs, ranked by how directly they complete what was typed.
 */
export function matchSearchSuggestions(
  input: string,
  jobs: SuggestionJob[] = [],
  limit = 7,
): SearchSuggestion[] {
  const typed = input.trim().toLowerCase();
  const hasJobs = jobs.length > 0;

  if (!typed) {
    const popular = KEYWORDS.map((keyword) => ({
      keyword,
      count: hasJobs
        ? jobs.filter((job) => jobMentionsKeyword(job, keyword)).length
        : 1,
    }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);

    return popular.slice(0, limit).map(({ keyword }) => toSuggestion(keyword));
  }

  const ranked: { suggestion: SearchSuggestion; score: number }[] = [];

  for (const keyword of KEYWORDS) {
    const score = keywordScore(keyword, typed);
    if (score === 0) continue;
    if (hasJobs && !jobs.some((job) => jobMentionsKeyword(job, keyword))) continue;
    ranked.push({ suggestion: toSuggestion(keyword), score });
  }

  const seenCompanies = new Set<string>();
  for (const job of jobs) {
    const company = job.company.trim();
    const key = company.toLowerCase();
    if (!company || seenCompanies.has(key)) continue;
    seenCompanies.add(key);
    const score = completionScore(company, typed);
    if (score === 0) continue;
    ranked.push({
      suggestion: { label: company, query: company, kind: "company" },
      score: score + 5,
    });
  }

  const seenTitles = new Set<string>();
  for (const job of jobs) {
    const title = job.title.trim();
    const key = title.toLowerCase();
    if (!title || seenTitles.has(key)) continue;
    seenTitles.add(key);
    const score = completionScore(title, typed);
    if (score < 80) continue;
    ranked.push({
      suggestion: { label: title, query: title, kind: "title" },
      score: Math.min(score, 90),
    });
  }

  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return KIND_RANK[b.suggestion.kind] - KIND_RANK[a.suggestion.kind];
  });

  const unique: SearchSuggestion[] = [];
  const seen = new Set<string>();
  for (const item of ranked) {
    const key = item.suggestion.query.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item.suggestion);
    if (unique.length >= limit) break;
  }
  return unique;
}

function toSuggestion(keyword: Keyword): SearchSuggestion {
  return {
    label: keyword.label,
    query: keyword.query,
    kind: keyword.kind,
    roleFocus: keyword.roleFocus,
  };
}

export const SUGGESTION_KIND_LABELS: Record<SearchSuggestion["kind"], string> = {
  role: "Role",
  skill: "Skill",
  company: "Company",
  title: "Job",
};
