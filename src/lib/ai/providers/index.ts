import { generateStructured, getLlm } from "@/lib/ai/llm";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisUserPrompt,
} from "@/lib/ai/prompts";
import { mockAnalysisProvider } from "@/lib/ai/providers/mock";
import type { AnalysisProvider } from "@/lib/ai/providers/types";
import { jobAnalysisSchema } from "@/lib/ai/schema";

/** Resolve the configured analysis provider. Defaults to mock (no API cost). */
export function getAnalysisProvider(): AnalysisProvider {
  const llm = getLlm();
  if (!llm) return mockAnalysisProvider;

  return {
    name: llm.provider,
    async analyze(request) {
      const result = await generateStructured(llm, {
        schema: jobAnalysisSchema,
        system: ANALYSIS_SYSTEM_PROMPT,
        prompt: buildAnalysisUserPrompt(request),
      });
      return {
        analysis: result.output,
        provider: result.provider,
        model: result.model,
      };
    },
  };
}
