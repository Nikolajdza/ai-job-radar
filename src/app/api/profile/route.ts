import { handleRouteError, jsonOk } from "@/lib/api";
import {
  getCandidateProfile,
  updateCandidateProfile,
} from "@/lib/profile/service";
import { updateProfileSchema } from "@/lib/validation/profile";

export async function GET() {
  try {
    const profile = await getCandidateProfile();
    return jsonOk({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const input = updateProfileSchema.parse(body);
    const profile = await updateCandidateProfile(input);
    return jsonOk({ profile });
  } catch (error) {
    return handleRouteError(error);
  }
}
