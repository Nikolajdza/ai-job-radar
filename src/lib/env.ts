import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

const aiEnvSchema = z.object({
  AI_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),
});

export type AppEnv = z.infer<typeof envSchema>;
export type AiEnv = z.infer<typeof aiEnvSchema>;

let cachedEnv: AppEnv | null = null;
let cachedAiEnv: AiEnv | null = null;

/** Validate and cache required server-side environment variables. */
export function getEnv(): AppEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment: ${details}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

/** AI settings are optional — mock mode needs no API key. */
export function getAiEnv(): AiEnv {
  if (cachedAiEnv) return cachedAiEnv;

  const parsed = aiEnvSchema.safeParse({
    AI_PROVIDER: process.env.AI_PROVIDER ?? "mock",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
    OPENAI_MODEL: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid AI environment: ${details}`);
  }

  cachedAiEnv = parsed.data;
  return cachedAiEnv;
}
