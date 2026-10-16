import { describeAiMode } from "@/lib/ai/llm";

/** Small server badge so demos show which AI mode is active. */
export function AiProviderBadge() {
  const mode = describeAiMode();

  const tone = mode.isLlm
    ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
    : "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tone}`}
    >
      <span
        aria-hidden
        className={`h-1.5 w-1.5 rounded-full ${mode.isLlm ? "bg-emerald-500" : "bg-slate-400"}`}
      />
      AI: {mode.label}
    </span>
  );
}
