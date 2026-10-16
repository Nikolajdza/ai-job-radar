import { createOpenAiAnalysisProvider } from "@/lib/ai/providers/openai";
import { mockAnalysisProvider } from "@/lib/ai/providers/mock";
import type { AnalysisProvider } from "@/lib/ai/providers/types";
import { getAiEnv } from "@/lib/env";

/** Resolve the configured analysis provider. Defaults to mock (no API cost). */
export function getAnalysisProvider(): AnalysisProvider {
  const env = getAiEnv();

  if (env.AI_PROVIDER === "openai") {
    if (!env.OPENAI_API_KEY) {
      throw new Error(
        "AI_PROVIDER=openai requires OPENAI_API_KEY. Use AI_PROVIDER=mock for local development.",
      );
    }

    return createOpenAiAnalysisProvider({
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL,
    });
  }

  return mockAnalysisProvider;
}
