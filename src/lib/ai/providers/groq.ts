import { createCompatibleAnalysisProvider } from "@/lib/ai/providers/compatible";
import type { AnalysisProvider } from "@/lib/ai/providers/types";

/** Fast free-tier friendly default on Groq. */
const DEFAULT_MODEL = "llama-3.3-70b-versatile";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

export function createGroqAnalysisProvider(options: {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
}): AnalysisProvider {
  return createCompatibleAnalysisProvider({
    name: "groq",
    apiKey: options.apiKey,
    model: options.model ?? DEFAULT_MODEL,
    baseURL: GROQ_BASE_URL,
    timeoutMs: options.timeoutMs,
    authHint: "Groq authentication failed. Check GROQ_API_KEY.",
  });
}

export { GROQ_BASE_URL, DEFAULT_MODEL as GROQ_DEFAULT_MODEL };
