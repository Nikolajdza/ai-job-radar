import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

function toSessionUser(
  value: { id: string; name: string; email: string; image?: string | null } | null | undefined,
): SessionUser | null {
  if (!value) return null;
  return {
    id: value.id,
    name: value.name,
    email: value.email,
    image: value.image ?? null,
  };
}

/** Current user in Server Components (call inside a Suspense boundary). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const result = await getAuth().api.getSession({ headers: await headers() });
    return toSessionUser(result?.user);
  } catch {
    return null;
  }
}

/** Server Component guard: redirect to sign-in when signed out. */
export async function requireUser(nextPath: string): Promise<SessionUser> {
  const current = await getCurrentUser();
  if (!current) {
    redirect(`/sign-in?next=${encodeURIComponent(nextPath)}`);
  }
  return current;
}

/** Route Handler helpers. */
export async function getRequestUser(request: Request): Promise<SessionUser | null> {
  const result = await getAuth().api.getSession({ headers: request.headers });
  return toSessionUser(result?.user);
}

export async function requireRequestUser(request: Request): Promise<SessionUser> {
  const current = await getRequestUser(request);
  if (!current) throw new UnauthorizedError();
  return current;
}
