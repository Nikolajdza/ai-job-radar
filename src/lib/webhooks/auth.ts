import { getWebhookEnv } from "@/lib/env";

export class WebhookUnauthorizedError extends Error {
  constructor(message = "Invalid or missing webhook secret") {
    super(message);
    this.name = "WebhookUnauthorizedError";
  }
}

/**
 * Shared-secret auth for local n8n → app calls.
 * Expects `Authorization: Bearer <secret>` or `x-webhook-secret`.
 */
export function assertWebhookAuthorized(request: Request): void {
  const { N8N_WEBHOOK_SECRET } = getWebhookEnv();
  const headerSecret = request.headers.get("x-webhook-secret");
  const auth = request.headers.get("authorization");
  const bearer =
    auth?.toLowerCase().startsWith("bearer ")
      ? auth.slice("bearer ".length).trim()
      : null;

  const provided = headerSecret?.trim() || bearer;
  if (!provided || provided !== N8N_WEBHOOK_SECRET) {
    throw new WebhookUnauthorizedError();
  }
}
