import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthFormSkeleton, AuthShell } from "@/components/auth/auth-shell";
import { getEnabledSocialProviders } from "@/lib/env";
import { safeNextPath } from "@/lib/safe-redirect";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create account · AI Job Radar",
};

export default function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  return (
    <AuthShell>
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignUpContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function SignUpContent({
  searchParams,
}: {
  searchParams: PageProps<"/sign-up">["searchParams"];
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next, "/profile");

  if (await getCurrentUser()) {
    redirect(next);
  }

  return (
    <AuthForm mode="sign-up" next={next} providers={getEnabledSocialProviders()} />
  );
}
