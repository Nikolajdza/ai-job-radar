import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthFormSkeleton, AuthShell } from "@/components/auth/auth-shell";
import { getEnabledSocialProviders } from "@/lib/env";
import { safeNextPath } from "@/lib/safe-redirect";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in · AI Job Radar",
};

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <AuthShell>
      <Suspense fallback={<AuthFormSkeleton />}>
        <SignInContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}

async function SignInContent({
  searchParams,
}: {
  searchParams: PageProps<"/sign-in">["searchParams"];
}) {
  const params = await searchParams;
  const next = safeNextPath(params.next);

  if (await getCurrentUser()) {
    redirect(next);
  }

  return (
    <AuthForm mode="sign-in" next={next} providers={getEnabledSocialProviders()} />
  );
}
