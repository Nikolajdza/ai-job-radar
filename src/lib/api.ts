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
    if (error.name === "JobConflictError") {
      return jsonError(error.message, 409);
    }
    if (
      error.name === "JobNotFoundError" ||
      error.name === "ProfileNotFoundError"
    ) {
      return jsonError(error.message, 404);
    }

    if (error.message.startsWith("Invalid environment:")) {
      return jsonError(
        "Database is not configured. Copy .env.example to .env.local and start Postgres.",
        503,
      );
    }
  }

  console.error(error);
  return jsonError("Unexpected server error", 500);
}
