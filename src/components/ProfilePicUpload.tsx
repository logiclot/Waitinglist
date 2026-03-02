"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ImageCropModal } from "@/components/ImageCropModal";

interface ProfilePicUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
  name: string;
  disabled?: boolean;
  /** If true, persist to server on change (for settings page) */
  persistOnChange?: boolean;
}

export function ProfilePicUpload({ value, onChange, name, disabled, persistOnChange }: ProfilePicUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const displayUrl = localUrl ?? value;

  // Step 1: User picks a file → open crop modal
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setCropImageUrl(objectUrl);
    e.target.value = "";
  };

  // Step 2: User confirms crop → upload the cropped blob
  const handleCropConfirm = async (croppedBlob: Blob) => {
    setCropImageUrl(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", new File([croppedBlob], "avatar.png", { type: "image/png" }));

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
    }
  };

  const handleCropCancel = () => {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div
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
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {displayUrl ? "Click to change" : "Add a profile photo"}
        </p>
        {error && (
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}
      </div>

      {/* Crop modal — opens after file selection */}
      {cropImageUrl && (
        <ImageCropModal
          imageUrl={cropImageUrl}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
