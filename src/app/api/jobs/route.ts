import { createJob, listJobs } from "@/lib/jobs/service";
import { handleRouteError, jsonOk } from "@/lib/api";
import { getRequestUser, requireRequestUser } from "@/lib/session";
import { createJobSchema } from "@/lib/validation/job";

export async function GET(request: Request) {
  try {
    const viewer = await getRequestUser(request);
    const jobs = await listJobs(viewer?.id);
    return jsonOk({ jobs });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** Manual jobs are private to the signed-in user who adds them. */
export async function POST(request: Request) {
  try {
    const viewer = await requireRequestUser(request);
    const body = await request.json();
    const input = createJobSchema.parse(body);
    const job = await createJob({ ...input, source: "manual" }, viewer.id);
    return jsonOk({ job }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
