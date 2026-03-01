"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface ProfilePicUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  name: string;
  disabled?: boolean;
  /** If true, persist to server on change (for settings page) */
  persistOnChange?: boolean;
}

/** Client-side resize to square (center crop) before upload */
async function resizeToSquare(
  file: File,
  maxSize = 400
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const size = Math.min(img.width, img.height, maxSize);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
        "image/jpeg",
        0.9
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}

export function ProfilePicUpload({ value, onChange, name, disabled, persistOnChange }: ProfilePicUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const displayUrl = localUrl ?? value;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const resized = await resizeToSquare(file);
      const formData = new FormData();
      formData.append("file", new File([resized], "avatar.jpg", { type: "image/jpeg" }));

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      onChange(data.url);
      if (persistOnChange && data.url) {
        setLocalUrl(data.url);
        await fetch("/api/user/profile-image", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profileImageUrl: data.url }),
        });
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <label
        className={`
          relative cursor-pointer group
          ${disabled ? "pointer-events-none opacity-60" : ""}
        `}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <div className="relative">
          <Avatar
            src={displayUrl}
            name={name}
            size="lg"
            className="h-24 w-24 md:h-28 md:w-28"
          />
          <div
            className={`
              absolute inset-0 rounded-full flex items-center justify-center
              bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity
              ${uploading ? "opacity-100" : ""}
            `}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            ) : (
              <Camera className="h-8 w-8 text-white" />
            )}
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="sr-only"
        />
      </label>
      <p className="text-xs text-muted-foreground text-center">
        {displayUrl ? "Click to change" : "Add a profile photo"}
      </p>
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
