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

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * OpenAI-compatible chat + structured output (OpenAI, Groq, etc.).
 */
export function createCompatibleAnalysisProvider(options: {
  name: string;
  apiKey: string;
  model: string;
  baseURL?: string;
  timeoutMs?: number;
  authHint?: string;
}): AnalysisProvider {
  const modelId = options.model;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const client = createOpenAI({
    apiKey: options.apiKey,
    ...(options.baseURL ? { baseURL: options.baseURL } : {}),
  });
  const authHint =
    options.authHint ??
    `${options.name} authentication failed. Check the API key.`;

  return {
    name: options.name,

    async analyze(request: AnalysisRequest): Promise<AnalysisProviderResult> {
      try {
        const result = await generateText({
          model: client(modelId),
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
            `${options.name} returned no structured analysis output`,
          );
        }

        const analysis = jobAnalysisSchema.parse(result.output);

        return {
          analysis,
          provider: options.name,
          model: modelId,
        };
      } catch (error) {
        throw mapCompatibleProviderError(error, options.name, authHint);
      }
    },
  };
}

export function mapCompatibleProviderError(
  error: unknown,
  providerName: string,
  authHint: string,
): Error {
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
      return new AiProviderError(authHint, 502);
    }
    return new AiProviderError(
      `${providerName} request failed${error.statusCode ? ` (${error.statusCode})` : ""}`,
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
