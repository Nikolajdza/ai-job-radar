type MatchScoreProps = {
  score: number | null;
};

function scoreTone(score: number): string {
  if (score >= 75) return "bg-emerald-50 text-emerald-800 ring-emerald-200";
  if (score >= 55) return "bg-amber-50 text-amber-800 ring-amber-200";
  return "bg-rose-50 text-rose-800 ring-rose-200";
}

export function MatchScore({ score }: MatchScoreProps) {
  if (score === null) {
    return (
      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
        Not analyzed
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${scoreTone(score)}`}
      title="Approximate heuristic match score, not a hiring probability"
    >
      {score}%
    </span>
  );
}
