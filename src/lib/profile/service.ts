import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { candidateProfiles } from "@/lib/db/schema";
import { mapProfileRow } from "@/lib/mappers";
import type { CandidateProfile } from "@/lib/types/profile";
import type { UpdateProfileInput } from "@/lib/validation/profile";

export class ProfileNotFoundError extends Error {
  constructor(
    message = "Candidate profile not found. Run the seed script first.",
  ) {
    super(message);
    this.name = "ProfileNotFoundError";
  }
}

export async function getCandidateProfile(): Promise<CandidateProfile> {
  const db = getDb();
  const [row] = await db.select().from(candidateProfiles).limit(1);

  if (!row) {
    throw new ProfileNotFoundError();
  }

  return mapProfileRow(row);
}

export async function updateCandidateProfile(
  input: UpdateProfileInput,
): Promise<CandidateProfile> {
  const existing = await getCandidateProfile();
  const db = getDb();

  const [updated] = await db
    .update(candidateProfiles)
    .set({
      fullName: input.fullName,
      headline: input.headline,
      experienceSummary: input.experienceSummary,
      skills: input.skills,
      preferredTechnologies: input.preferredTechnologies,
      targetRoles: input.targetRoles,
      locationPreferences: input.locationPreferences,
      workFormatPreferences: input.workFormatPreferences,
      salaryExpectation: input.salaryExpectation,
      updatedAt: new Date(),
    })
    .where(eq(candidateProfiles.id, existing.id))
    .returning();

  return mapProfileRow(updated);
}
