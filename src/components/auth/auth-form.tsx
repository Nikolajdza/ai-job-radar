"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import type { SocialProviderId } from "@/lib/env";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  next: string;
  providers: SocialProviderId[];
};

const PROVIDER_LABELS: Record<SocialProviderId, string> = {
  github: "GitHub",
  google: "Google",
};

export function AuthForm({ mode, next, providers }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"email" | SocialProviderId | null>(null);

  const isSignUp = mode === "sign-up";
  const altHref = `${isSignUp ? "/sign-in" : "/sign-up"}${
    next !== "/" ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending("email");

    try {
      const result = isSignUp
        ? await signUp.email({ name: name.trim(), email, password })
        : await signIn.email({ email, password });

      if (result.error) {
        setError(friendlyError(result.error.message, result.error.status));
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPending(null);
    }
  }

  async function onSocial(provider: SocialProviderId) {
    setError(null);
    setPending(provider);
    try {
      const result = await signIn.social({ provider, callbackURL: next });
      if (result?.error) {
        setError(friendlyError(result.error.message, result.error.status));
        setPending(null);
      }
    } catch {
      setError(`Could not reach ${PROVIDER_LABELS[provider]}. Try again.`);
      setPending(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          {isSignUp
            ? "Free forever. Upload your CV and let AI find your best-fit roles."
            : "Sign in to see your matches, cover letters, and pipeline."}
        </p>
      </div>

      {providers.length > 0 ? (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            {providers.map((provider) => (
              <button
                key={provider}
                type="button"
                disabled={pending !== null}
                onClick={() => {
                  void onSocial(provider);
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
              >
                {provider === "github" ? <GitHubIcon /> : <GoogleIcon />}
                {pending === provider
                  ? "Redirecting…"
                  : `Continue with ${PROVIDER_LABELS[provider]}`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or with email
            <span className="h-px flex-1 bg-slate-200" />
          </div>
        </>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4">
        {isSignUp ? (
          <Input
            label="Full name"
            autoComplete="name"
            value={name}
            onChange={setName}
            required
            minLength={2}
          />
        ) : null}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          required
        />
        <div>
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={password}
            onChange={setPassword}
            required
            minLength={8}
          />
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>{isSignUp ? "At least 8 characters." : ""}</span>
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="font-medium text-slate-600 hover:text-slate-900"
            >
              {showPassword ? "Hide" : "Show"} password
            </button>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending !== null}
          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-slate-900 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
        >
          {pending === "email"
            ? isSignUp
              ? "Creating account…"
              : "Signing in…"
            : isSignUp
              ? "Create account"
              : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        {isSignUp ? "Already have an account?" : "New to AI Job Radar?"}{" "}
        <Link href={altHref} className="font-medium text-slate-900 underline">
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}

function friendlyError(message: string | undefined, status: number): string {
  if (status === 429) return "Too many attempts. Wait a minute and try again.";
  if (!message) return "Something went wrong. Please try again.";
  if (/invalid email or password/i.test(message)) {
    return "Email or password is incorrect.";
  }
  if (/already exists/i.test(message)) {
    return "An account with this email already exists. Try signing in.";
  }
  return message;
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  ...rest
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
        {...rest}
      />
    </label>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.28a12 12 0 0 0 0 10.76l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77Z"
      />
    </svg>
  );
}
