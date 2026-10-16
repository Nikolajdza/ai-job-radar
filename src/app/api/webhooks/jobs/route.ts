import { ingestJob } from "@/lib/ingest/service";
import { handleRouteError, jsonOk } from "@/lib/api";
import { ingestJobSchema } from "@/lib/validation/ingest";
import { assertWebhookAuthorized } from "@/lib/webhooks/auth";

/**
 * n8n → app ingest endpoint.
 * Auth: Authorization Bearer <N8N_WEBHOOK_SECRET> or x-webhook-secret header.
 */
export async function POST(request: Request) {
  try {
    assertWebhookAuthorized(request);
    const body = await request.json();
    const input = ingestJobSchema.parse(body);
    const result = await ingestJob(input);

    return jsonOk(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    return handleRouteError(error);
  }
}
