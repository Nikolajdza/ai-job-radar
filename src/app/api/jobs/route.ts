import { createJob, listJobs } from "@/lib/jobs/service";
import { handleRouteError, jsonOk } from "@/lib/api";
import { createJobSchema } from "@/lib/validation/job";

export async function GET() {
  try {
    const jobs = await listJobs();
    return jsonOk({ jobs });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createJobSchema.parse(body);
    const job = await createJob(input);
    return jsonOk({ job }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
