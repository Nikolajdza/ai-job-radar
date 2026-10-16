import type { CandidateProfile } from "@/lib/types/profile";

export type CompletenessItem = {
  key: string;
  label: string;
  done: boolean;
};

export type ProfileCompleteness = {
  percent: number;
  items: CompletenessItem[];
  missing: CompletenessItem[];
};

type CompletenessInput = Pick<
  CandidateProfile,
  | "fullName"
  | "headline"
  | "bio"
  | "avatarUrl"
  | "currentLocation"
  | "experienceSummary"
  | "skills"
  | "targetRoles"
  | "cvText"
  | "linkedinUrl"
  | "githubUrl"
  | "portfolioUrl"
>;

export function getProfileCompleteness(
  profile: CompletenessInput,
): ProfileCompleteness {
  const items: CompletenessItem[] = [
    { key: "photo", label: "Profile photo", done: Boolean(profile.avatarUrl) },
    {
      key: "headline",
      label: "Headline",
      done: profile.headline.trim().length >= 2,
    },
    { key: "bio", label: "About you", done: Boolean(profile.bio?.trim()) },
    {
      key: "location",
      label: "Location",
      done: Boolean(profile.currentLocation?.trim()),
    },
    {
      key: "skills",
      label: "At least 5 skills",
      done: profile.skills.length >= 5,
    },
    {
      key: "experience",
      label: "Experience summary",
      done: profile.experienceSummary.trim().length >= 40,
    },
    {
      key: "roles",
      label: "Target roles",
      done: profile.targetRoles.length > 0,
    },
    { key: "cv", label: "CV uploaded", done: Boolean(profile.cvText?.trim()) },
    {
      key: "links",
      label: "A professional link",
      done: Boolean(
        profile.linkedinUrl || profile.githubUrl || profile.portfolioUrl,
      ),
    },
  ];

  const doneCount = items.filter((item) => item.done).length;
  return {
    percent: Math.round((doneCount / items.length) * 100),
    items,
    missing: items.filter((item) => !item.done),
  };
}

/** Enough signal for AI matching / letters to be meaningful. */
export function hasAiReadyProfile(
  profile: Pick<CandidateProfile, "skills" | "cvText" | "experienceSummary">,
): boolean {
  return (
    profile.skills.length > 0 ||
    Boolean(profile.cvText?.trim()) ||
    profile.experienceSummary.trim().length >= 40
  );
}
