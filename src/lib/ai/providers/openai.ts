import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, generateText, Output } from "ai";
import {
  AiProviderError,
  AiRateLimitError,
  AiTimeoutError,
  AiValidationError,
} from "@/lib/ai/errors";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisUserPrompt,
} from "@/lib/ai/prompts";
import { jobAnalysisSchema } from "@/lib/ai/schema";
import type {
  AnalysisProvider,
  AnalysisProviderResult,
  AnalysisRequest,
} from "@/lib/ai/providers/types";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TIMEOUT_MS = 30_000;

export function createOpenAiAnalysisProvider(options: {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
}): AnalysisProvider {
  const modelId = options.model ?? DEFAULT_MODEL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const openai = createOpenAI({ apiKey: options.apiKey });

  return {
    name: "openai",

    async analyze(request: AnalysisRequest): Promise<AnalysisProviderResult> {
      try {
        const result = await generateText({
          model: openai(modelId),
          system: ANALYSIS_SYSTEM_PROMPT,
          prompt: buildAnalysisUserPrompt(request),
          output: Output.object({
            schema: jobAnalysisSchema,
          }),
          abortSignal: AbortSignal.timeout(timeoutMs),
          maxRetries: 1,
        });

        if (!result.output) {
          throw new AiValidationError(
            "OpenAI returned no structured analysis output",
          );
        }

        // Defense in depth: re-validate even after SDK parsing.
        const analysis = jobAnalysisSchema.parse(result.output);

        return {
          analysis,
          provider: "openai",
          model: modelId,
        };
      } catch (error) {
        throw mapProviderError(error);
      }
    },
  };
}

function mapProviderError(error: unknown): Error {
  if (
    error instanceof AiProviderError ||
    error instanceof AiValidationError ||
    error instanceof AiTimeoutError ||
    error instanceof AiRateLimitError
  ) {
    return error;
  }

  if (error instanceof Error && error.name === "TimeoutError") {
    return new AiTimeoutError();
  }

  if (error instanceof DOMException && error.name === "TimeoutError") {
    return new AiTimeoutError();
  }

  if (APICallError.isInstance(error)) {
    if (error.statusCode === 429) {
      return new AiRateLimitError(error.message);
    }
    if (error.statusCode === 401 || error.statusCode === 403) {
      return new AiProviderError(
        "OpenAI authentication failed. Check OPENAI_API_KEY.",
        502,
      );
    }
    return new AiProviderError(
      `OpenAI request failed${error.statusCode ? ` (${error.statusCode})` : ""}`,
      502,
    );
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("timeout") || message.includes("aborted")) {
      return new AiTimeoutError();
    }
    if (message.includes("rate limit")) {
      return new AiRateLimitError(error.message);
    }
  }

  return new AiProviderError(
    error instanceof Error ? error.message : "Unknown AI provider error",
  );
}
