"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type SaveJobButtonProps = {
  jobId: string;
  saved: boolean;
  size?: "sm" | "md";
};

export function SaveJobButton({ jobId, saved, size = "md" }: SaveJobButtonProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(saved);
  const [previousSaved, setPreviousSaved] = useState(saved);
  const [pending, setPending] = useState(false);

  if (saved !== previousSaved) {
    setPreviousSaved(saved);
    setLiked(saved);
  }

  async function toggle() {
    const next = !liked;
    setLiked(next);
    setPending(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ saved: next }),
      });
      if (!response.ok) {
        setLiked(!next);
        return;
      }
      router.refresh();
    } catch {
      setLiked(!next);
    } finally {
      setPending(false);
    }
  }

  const box = size === "sm" ? "h-8 w-8" : "h-10 w-10";

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={liked ? "Unlike this job" : "Like this job"}
      disabled={pending}
      onClick={() => {
        void toggle();
      }}
      className={`${box} inline-flex shrink-0 items-center justify-center rounded-full border transition disabled:opacity-60 ${
        liked
          ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "border-slate-200 bg-white text-slate-400 hover:border-rose-200 hover:text-rose-500"
      }`}
    >
      <Heart filled={liked} />
    </button>
  );
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 20s-7-4.4-7-9.1C5 8 6.8 6.2 9.2 6.2c1.3 0 2.4.6 2.8 1.6.4-1 1.5-1.6 2.8-1.6C17.2 6.2 19 8 19 10.9 19 15.6 12 20 12 20Z" />
    </svg>
  );
}
