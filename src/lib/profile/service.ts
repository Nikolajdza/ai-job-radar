import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { candidateProfiles, user } from "@/lib/db/schema";
import { mapProfileRow } from "@/lib/mappers";
import type { CandidateProfile } from "@/lib/types/profile";
import type { ParsedProfileInput } from "@/lib/validation/profile";

type ProfileOwner = {
  id: string;
  name: string;
  image?: string | null;
};

/** Load the user's profile, creating an empty one on first visit. */
export async function getProfileForUser(
  owner: ProfileOwner,
): Promise<CandidateProfile> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, owner.id))
    .limit(1);

  if (row) return mapProfileRow(row);

  const [created] = await db
    .insert(candidateProfiles)
    .values({
      userId: owner.id,
      fullName: owner.name || "New user",
      headline: "",
      experienceSummary: "",
      avatarUrl: owner.image ?? null,
    })
    .onConflictDoNothing({ target: candidateProfiles.userId })
    .returning();

  if (created) return mapProfileRow(created);

  const [existing] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, owner.id))
    .limit(1);
  return mapProfileRow(existing);
}

export async function getProfileByUserId(
  userId: string,
): Promise<CandidateProfile | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, userId))
    .limit(1);
  return row ? mapProfileRow(row) : null;
}

export async function updateProfileForUser(
  owner: ProfileOwner,
  input: ParsedProfileInput,
): Promise<CandidateProfile> {
  const existing = await getProfileForUser(owner);
  const db = getDb();
  const now = new Date();

  const [updated] = await db
    .update(candidateProfiles)
    .set({ ...input, updatedAt: now })
    .where(eq(candidateProfiles.id, existing.id))
    .returning();

  // Keep the auth user's display name/avatar in sync for the header menu.
  await db
    .update(user)
    .set({ name: input.fullName, image: input.avatarUrl, updatedAt: now })
    .where(eq(user.id, owner.id));

  return mapProfileRow(updated);
}
