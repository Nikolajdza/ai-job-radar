import { getJobById, updateJob } from "@/lib/jobs/service";
import { handleRouteError, jsonError, jsonOk } from "@/lib/api";
import { updateJobSchema } from "@/lib/validation/job";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const job = await getJobById(id);

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
    const { id } = await context.params;
    const body = await request.json();
    const input = updateJobSchema.parse(body);
    const job = await updateJob(id, input);
    return jsonOk({ job });
  } catch (error) {
    return handleRouteError(error);
  }
}
