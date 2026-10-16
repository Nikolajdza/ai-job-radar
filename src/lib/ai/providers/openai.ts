import { createCompatibleAnalysisProvider } from "@/lib/ai/providers/compatible";
import type { AnalysisProvider } from "@/lib/ai/providers/types";

const DEFAULT_MODEL = "gpt-4o-mini";

export function createOpenAiAnalysisProvider(options: {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
}): AnalysisProvider {
  return createCompatibleAnalysisProvider({
    name: "openai",
    apiKey: options.apiKey,
    model: options.model ?? DEFAULT_MODEL,
    timeoutMs: options.timeoutMs,
    authHint: "OpenAI authentication failed. Check OPENAI_API_KEY.",
  });
}
