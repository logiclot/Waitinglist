"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { X, ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropModalProps {
  imageUrl: string;
  onConfirm: (croppedBlob: Blob) => void;
  onCancel: () => void;
  /** Aspect ratio for the crop area (default: 1 for square) */
  aspect?: number;
  /** Shape of the crop area (default: "round") */
  cropShape?: "round" | "rect";
  /** Modal title (default: "Edit image") */
  title?: string;
}

const MAX_OUTPUT_WIDTH = 1920;
const MIN_OUTPUT_WIDTH = 400;

/** Crop the image at native resolution (no upscaling) and return a PNG Blob */
async function getCroppedImg(imageSrc: string, cropArea: Area, aspect: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const outputWidth = Math.max(MIN_OUTPUT_WIDTH, Math.min(MAX_OUTPUT_WIDTH, Math.round(cropArea.width)));
      const outputHeight = Math.round(outputWidth / aspect);

      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }

      // High-quality downscaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        outputWidth,
        outputHeight
      );

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
        "image/png"
      );
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = imageSrc;
  });
}

export function ImageCropModal({
  imageUrl,
  onConfirm,
  onCancel,
  aspect = 1,
  cropShape = "round",
  title = "Edit image",
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImg(imageUrl, croppedAreaPixels, aspect);
      onConfirm(blob);
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Crop area */}
        <div className="relative w-full" style={{ height: 360 }}>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={cropShape}
            showGrid={cropShape === "rect"}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            minZoom={1}
            maxZoom={3}
            style={{
              containerStyle: { background: "#1a1a1a" },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="px-6 py-4 flex items-center gap-3">
          <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1.5 accent-primary cursor-pointer"
          />
          <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-5">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-foreground border border-border rounded-xl hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
