import { analyzeJob, getAnalysisForJob } from "@/lib/ai/service";
import { handleRouteError, jsonOk } from "@/lib/api";
import { requireRequestUser } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const viewer = await requireRequestUser(request);
    const { id } = await context.params;
    const analysis = await getAnalysisForJob(id, viewer.id);
    return jsonOk({ analysis });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const viewer = await requireRequestUser(request);
    const { id } = await context.params;
    const analysis = await analyzeJob(id, viewer.id);
    return jsonOk({ analysis });
  } catch (error) {
    return handleRouteError(error);
  }
}
