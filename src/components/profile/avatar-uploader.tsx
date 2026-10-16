"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/avatar";

const AVATAR_SIZE = 256;

/** Center-crop and downscale so the data URL stays small (~20–40 KB). */
async function resizeToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas not supported");
  context.drawImage(bitmap, sx, sy, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.85);
}

export function AvatarUploader({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image is larger than 8 MB.");
      return;
    }
    setBusy(true);
    try {
      onChange(await resizeToDataUrl(file));
    } catch {
      setError("Could not read that image.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:items-start">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        aria-label="Change profile photo"
      >
        <Avatar name={name || "You"} src={value} size="xl" className="shadow-md" />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/55 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
          {busy ? "…" : "Change"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => {
          void onFile(event.target.files?.[0]);
        }}
      />
      <div className="flex gap-3 text-xs">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="font-medium text-slate-700 hover:text-slate-900"
        >
          Upload photo
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="font-medium text-rose-600 hover:text-rose-700"
          >
            Remove
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
