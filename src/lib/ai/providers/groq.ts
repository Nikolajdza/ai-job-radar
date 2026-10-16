import { createCompatibleAnalysisProvider } from "@/lib/ai/providers/compatible";
import type { AnalysisProvider } from "@/lib/ai/providers/types";

/**
 * Free/developer-tier default after Llama 3.3 70B shutdown (Aug 2026).
 * @see https://console.groq.com/docs/deprecations
 */
const DEFAULT_MODEL = "openai/gpt-oss-120b";
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
