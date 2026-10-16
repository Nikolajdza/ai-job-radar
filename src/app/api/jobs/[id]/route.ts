import { getJobById, updateJob } from "@/lib/jobs/service";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { getRequestUser, requireRequestUser } from "@/lib/session";
import { updateJobSchema } from "@/lib/validation/job";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const viewer = await getRequestUser(request);
    const job = await getJobById(id, viewer?.id);

    if (!job) {
      return jsonError("Job not found", 404);
    }

    return jsonOk({ job });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const viewer = await requireRequestUser(request);
    const { id } = await context.params;
    const body = await request.json();
    const input = updateJobSchema.parse(body);
    const job = await updateJob(id, input, viewer.id);
    return jsonOk({ job });
  } catch (error) {
    return handleRouteError(error);
  }
}
