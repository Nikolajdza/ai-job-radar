import { analyzeJob, getAnalysisForJob } from "@/lib/ai/service";
import { handleRouteError, jsonOk } from "@/lib/api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const analysis = await getAnalysisForJob(id);
    return jsonOk({ analysis });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const analysis = await analyzeJob(id);
    return jsonOk({ analysis });
  } catch (error) {
    return handleRouteError(error);
  }
}
