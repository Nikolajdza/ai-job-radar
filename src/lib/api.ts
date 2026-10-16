import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(
  message: string,
  status: number,
  details?: unknown,
) {
  return NextResponse.json(
    {
      error: message,
      ...(details !== undefined ? { details } : {}),
    },
    { status },
  );
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("Validation failed", 400, error.flatten());
  }

  if (error instanceof Error) {
    if (
      "statusCode" in error &&
      typeof error.statusCode === "number" &&
      error.statusCode >= 400 &&
      error.statusCode < 600 &&
      !(
        error.name === "AiTimeoutError" ||
        error.name === "AiRateLimitError" ||
        error.name === "AiValidationError" ||
        error.name === "AiProviderError"
      )
    ) {
      return jsonError(error.message, error.statusCode);
    }

    if (error.name === "WebhookUnauthorizedError") {
      return jsonError(error.message, 401);
    }
    if (error.name === "JobConflictError" || error.name === "AnalysisInProgressError") {
      return jsonError(error.message, 409);
    }
    if (
      error.name === "JobNotFoundError" ||
      error.name === "ProfileNotFoundError"
    ) {
      return jsonError(error.message, 404);
    }
    if (
      error.name === "AiTimeoutError" ||
      error.name === "AiRateLimitError" ||
      error.name === "AiValidationError" ||
      error.name === "AiProviderError"
    ) {
      const statusCode =
        "statusCode" in error && typeof error.statusCode === "number"
          ? error.statusCode
          : 502;
      return jsonError(error.message, statusCode);
    }

    if (
      error.message.startsWith("Invalid environment:") ||
      error.message.startsWith("Invalid AI environment:") ||
      error.message.startsWith("Invalid webhook environment:") ||
      error.message.includes("AI_PROVIDER=openai requires") ||
      error.message.includes("AI_PROVIDER=groq requires")
    ) {
      return jsonError(error.message, 503);
    }
  }

  console.error(error);
  return jsonError("Unexpected server error", 500);
}
