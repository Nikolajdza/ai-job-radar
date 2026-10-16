import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

const aiEnvSchema = z.object({
  AI_PROVIDER: z.enum(["mock", "openai", "groq"]).default("mock"),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),
  GROQ_API_KEY: z.string().min(1).optional(),
  GROQ_MODEL: z.string().min(1).default("openai/gpt-oss-120b"),
});

const webhookEnvSchema = z.object({
  N8N_WEBHOOK_SECRET: z
    .string()
    .min(8, "N8N_WEBHOOK_SECRET must be at least 8 characters"),
});

export type AppEnv = z.infer<typeof envSchema>;
export type AiEnv = z.infer<typeof aiEnvSchema>;
export type WebhookEnv = z.infer<typeof webhookEnvSchema>;

let cachedEnv: AppEnv | null = null;
let cachedAiEnv: AiEnv | null = null;
let cachedWebhookEnv: WebhookEnv | null = null;

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
    GROQ_API_KEY: process.env.GROQ_API_KEY || undefined,
    GROQ_MODEL: process.env.GROQ_MODEL ?? "openai/gpt-oss-120b",
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

/** Required only when calling the n8n ingest webhook endpoint. */
export function getWebhookEnv(): WebhookEnv {
  if (cachedWebhookEnv) return cachedWebhookEnv;

  const parsed = webhookEnvSchema.safeParse({
    N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid webhook environment: ${details}`);
  }

  cachedWebhookEnv = parsed.data;
  return cachedWebhookEnv;
}
