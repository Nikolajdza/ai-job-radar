import { handleRouteError, jsonOk } from "@/lib/api";
import {
  getProfileForUser,
  updateProfileForUser,
} from "@/lib/profile/service";
import { requireRequestUser } from "@/lib/session";
import { updateProfileSchema } from "@/lib/validation/profile";

export async function GET(request: Request) {
  try {
    const viewer = await requireRequestUser(request);
    const profile = await getProfileForUser(viewer);
    return jsonOk({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const viewer = await requireRequestUser(request);
    const body = await request.json();
    const input = updateProfileSchema.parse(body);
    const profile = await updateProfileForUser(viewer, input);
    return jsonOk({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}
