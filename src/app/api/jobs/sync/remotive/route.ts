import { handleRouteError, jsonOk } from "@/lib/api";
import {
  REMOTIVE_FOCUSES,
  type RemotiveFocus,
} from "@/lib/jobs/sources/remotive";
import { syncRemotiveJobs } from "@/lib/jobs/sources/remotive-sync";
import { requireRequestUser } from "@/lib/session";
import { z } from "zod";

const syncBodySchema = z
  .object({
    search: z.string().trim().min(2).max(120).optional(),
    focus: z.enum(REMOTIVE_FOCUSES).optional().default("software"),
    limit: z.number().int().min(1).max(2000).optional(),
  })
  .default({ focus: "software" });

/**
 * Pull software-related remote jobs from Remotive into the database.
 * Respect Remotive terms: store their URL and credit Remotive in the UI.
 *
 * POST — manual sync from the dashboard.
 * GET — Vercel Cron (Authorization: Bearer CRON_SECRET when set).
 */
export async function POST(request: Request) {
  try {
    await requireRequestUser(request);
    const json = await request.json().catch(() => ({}));
    const body = syncBodySchema.parse(json);
    const result = await syncRemotiveJobs(body);
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request: Request) {
  try {
    assertCronAuthorized(request);
    const { searchParams } = new URL(request.url);
    const focusParam = searchParams.get("focus");
    const focus = REMOTIVE_FOCUSES.includes(focusParam as RemotiveFocus)
      ? (focusParam as RemotiveFocus)
      : "software";
    const limitParam = searchParams.get("limit");
    const limitRaw = limitParam === null ? undefined : Number(limitParam);
    const limit =
      limitRaw === undefined || !Number.isFinite(limitRaw)
        ? undefined
        : Math.min(Math.max(Math.trunc(limitRaw), 1), 2000);

    const result = await syncRemotiveJobs({ focus, limit });
    return jsonOk(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

function assertCronAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Local/dev: allow GET without secret so curl works.
    if (process.env.NODE_ENV !== "production") return;
    throw Object.assign(new Error("CRON_SECRET is not configured"), {
      statusCode: 503,
    });
  }

  const header = request.headers.get("authorization");
  if (header !== `Bearer ${secret}`) {
    throw Object.assign(new Error("Unauthorized cron request"), {
      statusCode: 401,
    });
  }
}
