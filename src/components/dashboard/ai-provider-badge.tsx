import { getAiEnv } from "@/lib/env";

/** Small server badge so demos show which AI mode is active. */
export function AiProviderBadge() {
  let provider = "mock";
  try {
    provider = getAiEnv().AI_PROVIDER;
  } catch {
    provider = "mock";
  }

  const label =
    provider === "groq"
      ? "AI: Groq (LLM)"
      : provider === "openai"
        ? "AI: OpenAI (LLM)"
        : "AI: mock heuristic";

  const tone =
    provider === "mock"
      ? "bg-slate-100 text-slate-600 ring-slate-200"
      : "bg-emerald-50 text-emerald-800 ring-emerald-200";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${tone}`}
    >
      {label}
    </span>
  );
}
