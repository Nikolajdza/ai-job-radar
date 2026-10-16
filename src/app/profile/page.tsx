import { Suspense } from "react";
import { connection } from "next/server";
import { AppHeader } from "@/components/dashboard/app-header";
import { ProfileForm } from "@/components/profile/profile-form";
import { getCandidateProfile } from "@/lib/profile/service";

export default function ProfilePage() {
  return (
    <>
      <AppHeader currentPath="/profile" />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Candidate profile
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Skills, preferences, and optional CV text feed AI match analysis.
            Sign-in/auth can come later — this stays a single local profile for
            now.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-white" />
          }
        >
          <ProfileContent />
        </Suspense>
      </main>
    </>
  );
}

async function ProfileContent() {
  await connection();

  let profile: Awaited<ReturnType<typeof getCandidateProfile>> | null = null;
  let loadError: string | null = null;

  try {
    profile = await getCandidateProfile();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Could not load candidate profile.";
  }

  if (loadError || !profile) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-medium">Profile unavailable</p>
        <p className="mt-1">{loadError}</p>
        <p className="mt-2">
          Run <code className="rounded bg-amber-100 px-1">npm run db:seed</code>{" "}
          after the database is up.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <ProfileForm profile={profile} />
    </div>
  );
}
