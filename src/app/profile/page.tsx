import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { AppHeader } from "@/components/dashboard/app-header";
import { ProfileEditor } from "@/components/profile/profile-editor";
import { getProfileForUser } from "@/lib/profile/service";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Profile · AI Job Radar",
};

export default function ProfilePage() {
  return (
    <>
      <AppHeader currentPath="/profile" />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Your profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Import your CV, polish the details, and every match and cover letter
            gets sharper.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />
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
  const user = await requireUser("/profile");
  const profile = await getProfileForUser(user);

  return <ProfileEditor profile={profile} email={user.email} />;
}
