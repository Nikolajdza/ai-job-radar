import { createGroq } from "@ai-sdk/groq";
import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, generateText, Output, type LanguageModel } from "ai";
import type { z } from "zod";
import {
  AiProviderError,
  AiRateLimitError,
  AiTimeoutError,
  AiValidationError,
} from "@/lib/ai/errors";
import { getAiEnv } from "@/lib/env";

export type LlmHandle = {
  provider: "groq" | "openai";
  modelId: string;
  model: LanguageModel;
};

/**
 * Resolve the configured real LLM. Returns null in mock mode so callers can
 * fall back to deterministic heuristics without any API key.
 */
export function getLlm(): LlmHandle | null {
  const env = getAiEnv();

  if (env.AI_PROVIDER === "groq") {
    if (!env.GROQ_API_KEY) {
      throw new AiProviderError(
        "AI_PROVIDER=groq requires GROQ_API_KEY. Use AI_PROVIDER=mock without a key.",
        503,
      );
    }
    const groq = createGroq({ apiKey: env.GROQ_API_KEY });
    return { provider: "groq", modelId: env.GROQ_MODEL, model: groq(env.GROQ_MODEL) };
  }

  if (env.AI_PROVIDER === "openai") {
    if (!env.OPENAI_API_KEY) {
      throw new AiProviderError(
        "AI_PROVIDER=openai requires OPENAI_API_KEY. Use AI_PROVIDER=mock or groq.",
        503,
      );
    }
    const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
    return {
      provider: "openai",
      modelId: env.OPENAI_MODEL,
      model: openai(env.OPENAI_MODEL),
    };
  }

  return null;
}

/** Generate a Zod-validated object with the configured LLM. */
export async function generateStructured<T extends z.ZodType>(
  llm: LlmHandle,
  options: {
    schema: T;
    system: string;
    prompt: string;
    timeoutMs?: number;
  },
): Promise<{ output: z.infer<T>; provider: string; model: string }> {
  try {
    const result = await generateText({
      model: llm.model,
      system: options.system,
      prompt: options.prompt,
      output: Output.object({ schema: options.schema }),
      abortSignal: AbortSignal.timeout(options.timeoutMs ?? 45_000),
      maxRetries: 1,
      providerOptions: {
        // Best-effort JSON schema mode: Groq strict mode rejects some
        // constraint keywords; Zod still validates the final object.
        groq: { structuredOutputs: true, strictJsonSchema: false },
      },
    });

    if (!result.output) {
      throw new AiValidationError(
        `${llm.provider} returned no structured output`,
      );
    }

    return {
      output: options.schema.parse(result.output),
      provider: llm.provider,
      model: llm.modelId,
    };
  } catch (error) {
    throw mapLlmError(error, llm.provider);
  }
}

export function mapLlmError(error: unknown, providerName: string): Error {
  if (error instanceof AiProviderError) {
    return error;
  }

  if (
    (error instanceof Error || error instanceof DOMException) &&
    error.name === "TimeoutError"
  ) {
    return new AiTimeoutError();
  }

  if (APICallError.isInstance(error)) {
    if (error.statusCode === 429) {
      return new AiRateLimitError(
        `${providerName} rate limit reached. Wait a minute and retry.`,
      );
    }
    if (error.statusCode === 401 || error.statusCode === 403) {
      return new AiProviderError(
        `${providerName} authentication failed. Check the API key.`,
        502,
      );
    }
    if (error.statusCode === 404) {
      return new AiProviderError(
        `${providerName} model not found. Check the configured model id.`,
        502,
      );
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
    if (error.name === "ZodError" || error.name.includes("NoObjectGenerated")) {
      return new AiValidationError(
        "The AI returned an incomplete answer. Please retry.",
      );
    }
  }

  return new AiProviderError(
    error instanceof Error ? error.message : "Unknown AI provider error",
  );
}

/** Short label for UI badges. */
export function describeAiMode(): { provider: string; label: string; isLlm: boolean } {
  let provider = "mock";
  try {
    provider = getAiEnv().AI_PROVIDER;
  } catch {
    provider = "mock";
  }

  if (provider === "groq") return { provider, label: "Groq LLM", isLlm: true };
  if (provider === "openai") return { provider, label: "OpenAI LLM", isLlm: true };
  return { provider: "mock", label: "Mock heuristics", isLlm: false };
}
