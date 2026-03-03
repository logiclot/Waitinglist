"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Paintbrush, X, RotateCcw, Loader2, Check, Upload, Trash2, ImageIcon, Pin } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updatePortfolioCustomization, updateFeaturedSolutions } from "@/actions/portfolio";
import { ImageCropModal } from "@/components/ImageCropModal";
import {
  PORTFOLIO_BACKGROUNDS,
  PORTFOLIO_BACKGROUND_COLORS,
  PORTFOLIO_BORDER_COLORS,
  PORTFOLIO_FONTS,
  PORTFOLIO_PATTERN_COLORS,
} from "@/lib/portfolio-customization";

interface PortfolioCustomizerProps {
  currentBio: string | null;
  currentBackground: string | null;
  currentBorderColor: string | null;
  currentFont: string | null;
  currentCoverImage: string | null;
  currentBackgroundColor: string | null;
  currentPatternColor: string | null;
  currentFeaturedSolutionIds: string[];
  solutions: { id: string; title: string }[];
}

export function PortfolioCustomizer({
  currentBio,
  currentBackground,
  currentBorderColor,
  currentFont,
  currentCoverImage,
  currentBackgroundColor,
  currentPatternColor,
  currentFeaturedSolutionIds,
  solutions,
}: PortfolioCustomizerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [bio, setBio] = useState<string | null>(currentBio);
  const [background, setBackground] = useState<string | null>(currentBackground);
  const [borderColor, setBorderColor] = useState<string | null>(currentBorderColor);
  const [font, setFont] = useState<string | null>(currentFont);
  const [coverImage, setCoverImage] = useState<string | null>(currentCoverImage);
  const [bgColor, setBgColor] = useState<string | null>(currentBackgroundColor);
  const [patternColor, setPatternColor] = useState<string | null>(currentPatternColor);
  const [featuredIds, setFeaturedIds] = useState<string[]>(currentFeaturedSolutionIds);

  // Save status indicator
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Cover image upload state
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Auto-save on every change ──────────────────────────────────────────────
  const isInitialMount = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Memoize the save function
  const doSave = useCallback(
    (b: string | null, bg: string | null, border: string | null, f: string | null, cover: string | null, bgC: string | null, patC: string | null) => {
      setSaveStatus("saving");
      updatePortfolioCustomization({
        bio: b,
        portfolioBackground: bg,
        portfolioBorderColor: border,
        portfolioFont: f,
        portfolioCoverImage: cover,
        portfolioBackgroundColor: bgC,
        portfolioPatternColor: patC,
      }).then((result) => {
        if ("error" in result) {
          toast.error(result.error);
          setSaveStatus("idle");
        } else {
          setSaveStatus("saved");
          router.refresh();
          setTimeout(() => setSaveStatus("idle"), 1500);
        }
      });
    },
    [router],
  );

  useEffect(() => {
    // Skip auto-save on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only save if something actually changed from server values
    const changed =
      bio !== currentBio ||
      background !== currentBackground ||
      borderColor !== currentBorderColor ||
      font !== currentFont ||
      coverImage !== currentCoverImage ||
      bgColor !== currentBackgroundColor ||
      patternColor !== currentPatternColor;
    if (!changed) return;

    // Debounce: wait 500ms after last change before saving
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      doSave(bio, background, borderColor, font, coverImage, bgColor, patternColor);
    }, 500);

    return () => clearTimeout(saveTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bio, background, borderColor, font, coverImage, bgColor, patternColor]);

  // ── Reset to defaults ──────────────────────────────────────────────────────
  const handleReset = () => {
    setBio(null);
    setBackground(null);
    setBorderColor(null);
    setFont(null);
    setCoverImage(null);
    setBgColor(null);
    setPatternColor(null);
    setFeaturedIds([]);
    clearTimeout(saveTimeoutRef.current);
    setSaveStatus("saving");
    Promise.all([
      updatePortfolioCustomization({
        bio: null,
        portfolioBackground: null,
        portfolioBorderColor: null,
        portfolioFont: null,
        portfolioCoverImage: null,
        portfolioBackgroundColor: null,
        portfolioPatternColor: null,
      }),
      updateFeaturedSolutions([]),
    ]).then(([result]) => {
      if ("error" in result) {
        toast.error(result.error);
        setSaveStatus("idle");
      } else {
        setSaveStatus("saved");
        router.refresh();
        setTimeout(() => setSaveStatus("idle"), 1500);
      }
    });
  };

  // ── Cover image handlers ───────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setCropImageUrl(objectUrl);
    e.target.value = "";
  };

  const handleCropConfirm = async (croppedBlob: Blob) => {
    setCropImageUrl(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", new File([croppedBlob], "cover.png", { type: "image/png" }));
      const res = await fetch("/api/upload/cover", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCoverImage(data.url); // triggers auto-save via useEffect
      toast.success("Cover uploaded!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCropCancel = () => {
    if (cropImageUrl) URL.revokeObjectURL(cropImageUrl);
    setCropImageUrl(null);
  };

  // Mini background preview patterns for the selector
  const bgPreviewStyle = (key: string): React.CSSProperties => {
    switch (key) {
      case "grid":
        return {
          backgroundImage: [
            "linear-gradient(to bottom right, rgba(139,195,74,0.15), transparent)",
            "linear-gradient(rgba(200,200,200,0.5) 1px, transparent 1px)",
            "linear-gradient(90deg, rgba(200,200,200,0.5) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "100% 100%, 8px 8px, 8px 8px",
        };
      case "dots":
        return {
          backgroundImage: [
            "radial-gradient(circle, rgba(139,195,74,0.3) 1px, transparent 1px)",
            "linear-gradient(to bottom right, rgba(139,195,74,0.1), transparent)",
          ].join(", "),
          backgroundSize: "6px 6px, 100% 100%",
        };
      case "wave":
        return {
          backgroundImage: [
            "radial-gradient(ellipse 100% 80% at 50% 120%, rgba(139,195,74,0.2), transparent)",
            "radial-gradient(ellipse 80% 50% at 80% 0%, rgba(139,195,74,0.15), transparent)",
          ].join(", "),
        };
      case "stripe":
        return {
          backgroundImage: "repeating-linear-gradient(135deg, rgba(139,195,74,0.15) 0px, rgba(139,195,74,0.15) 1px, transparent 1px, transparent 12px)",
        };
      default: // gradient_default
        return {
          backgroundImage: "linear-gradient(to bottom right, rgba(139,195,74,0.2), rgba(139,195,74,0.05), transparent)",
        };
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 border border-border bg-background hover:bg-secondary text-foreground px-3 py-2 rounded-lg text-sm font-bold transition-colors"
      >
        <Paintbrush className="w-3.5 h-3.5" />
        Personalize
      </button>

      {/* Slide-out panel — portaled to body to escape stacking contexts */}
      {open && mounted && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-[60]"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-card border-l border-border shadow-2xl z-[70] flex flex-col">
            {/* Header with save status */}
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-foreground">Personalize</h2>
                {saveStatus === "saving" && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground animate-in fade-in">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Saving…
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary animate-in fade-in">
                    <Check className="w-3 h-3" />
                    Saved
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-8">
              {/* ── Bio ────────────────────────────────────────────── */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Bio</h3>
                <textarea
                  value={bio ?? ""}
                  onChange={(e) => setBio(e.target.value || null)}
                  maxLength={500}
                  rows={3}
                  placeholder="Tell visitors about your expertise..."
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {(bio?.length ?? 0)}/500 — shown below your name on your portfolio &amp; profile
                </p>
              </div>

              {/* ── Featured Solutions ──────────────────────────────── */}
              {solutions.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">
                    Featured Solutions
                    <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">(max 3)</span>
                  </h3>
                  <div className="space-y-1.5">
                    {solutions.map((sol) => {
                      const isFeatured = featuredIds.includes(sol.id);
                      return (
                        <button
                          key={sol.id}
                          onClick={async () => {
                            let next: string[];
                            if (isFeatured) {
                              next = featuredIds.filter((id) => id !== sol.id);
                            } else {
                              if (featuredIds.length >= 3) {
                                toast.error("You can feature up to 3 solutions");
                                return;
                              }
                              next = [...featuredIds, sol.id];
                            }
                            setFeaturedIds(next);
                            const result = await updateFeaturedSolutions(next);
                            if ("error" in result) {
                              toast.error(result.error);
                              setFeaturedIds(featuredIds);
                            } else {
                              router.refresh();
                            }
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all flex items-center justify-between ${
                            isFeatured
                              ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <span className="text-sm font-medium text-foreground truncate pr-2">
                            {sol.title}
                          </span>
                          {isFeatured && <Pin className="w-4 h-4 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Featured solutions appear first on your portfolio.
                  </p>
                </div>
              )}

              {/* ── Cover Image ──────────────────────────────────── */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Cover Image</h3>
                {coverImage ? (
                  <div className="space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-24 object-cover rounded-lg border border-border"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        Replace
                      </button>
                      <button
                        onClick={() => setCoverImage(null)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-destructive border border-destructive/20 rounded-lg hover:bg-destructive/5 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-24 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-xs font-medium">Upload a cover image</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="sr-only"
                />
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Recommended: landscape image, at least 1200px wide. Max 5MB.
                </p>
              </div>

              {/* ── Background Color ────────────────────────────── */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Background Color</h3>
                <div className="grid grid-cols-6 gap-2">
                  {PORTFOLIO_BACKGROUND_COLORS.map((c) => {
                    const isActive = bgColor === c.hex;
                    const isDark = c.hex && parseInt(c.hex.slice(1, 3), 16) < 80;
                    return (
                      <button
                        key={c.hex ?? "default"}
                        onClick={() => setBgColor(c.hex)}
                        title={c.name}
                        className={`relative w-full aspect-square rounded-lg border-2 transition-all ${
                          isActive
                            ? "border-primary ring-2 ring-primary/30 scale-105"
                            : "border-border hover:border-primary/40 hover:scale-105"
                        }`}
                        style={{
                          backgroundColor: c.hex ?? undefined,
                          backgroundImage: c.hex === null
                            ? "linear-gradient(135deg, #f8fafc 45%, #e2e8f0 45%, #e2e8f0 55%, #f8fafc 55%)"
                            : undefined,
                        }}
                      >
                        {isActive && (
                          <Check className={`w-3 h-3 absolute inset-0 m-auto drop-shadow-md ${isDark ? "text-white" : "text-primary"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Pick a color for the entire page background.
                </p>
              </div>

              {/* ── Page Background Pattern ──────────────────────── */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Background Pattern</h3>
                <div className="grid grid-cols-3 gap-2">
                  {PORTFOLIO_BACKGROUNDS.map((bg) => {
                    const isActive = (background ?? "gradient_default") === bg.key;
                    return (
                      <button
                        key={bg.key}
                        onClick={() => setBackground(bg.key === "gradient_default" ? null : bg.key)}
                        className={`relative rounded-lg border-2 p-1 transition-all ${
                          isActive
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <div
                          className="h-14 rounded-md"
                          style={bgPreviewStyle(bg.key)}
                        />
                        <span className="block text-[10px] font-medium text-muted-foreground mt-1 text-center truncate">
                          {bg.label}
                        </span>
                        {isActive && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Pattern Color ─────────────────────────────────── */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Pattern Color</h3>
                <div className="flex flex-wrap gap-3">
                  {PORTFOLIO_PATTERN_COLORS.map((c) => {
                    const isActive = patternColor === c.hex;
                    const isDark = c.hex && parseInt(c.hex.slice(1, 3), 16) < 80;
                    return (
                      <button
                        key={c.hex ?? "default"}
                        onClick={() => setPatternColor(c.hex)}
                        title={c.name}
                        className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                          isActive
                            ? "border-foreground ring-2 ring-primary/30 scale-110"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{
                          backgroundColor: c.hex ?? undefined,
                          backgroundImage: c.hex === null
                            ? "linear-gradient(135deg, #94a3b8 45%, #cbd5e1 45%, #cbd5e1 55%, #94a3b8 55%)"
                            : undefined,
                        }}
                      >
                        {isActive && (
                          <Check className={`w-3.5 h-3.5 absolute inset-0 m-auto drop-shadow-md ${c.hex === "#FFFFFF" ? "text-primary" : "text-white"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  Change the color of the background pattern.
                </p>
              </div>

              {/* ── Border Color ──────────────────────────────────── */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Border Glow</h3>
                <div className="flex flex-wrap gap-3">
                  {PORTFOLIO_BORDER_COLORS.map((c) => {
                    const isActive = (borderColor ?? "#8DC63F") === c.hex;
                    return (
                      <button
                        key={c.hex}
                        onClick={() => setBorderColor(c.hex === "#8DC63F" ? null : c.hex)}
                        title={c.name}
                        className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                          isActive
                            ? "border-foreground ring-2 ring-primary/30 scale-110"
                            : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {isActive && (
                          <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto drop-shadow-md" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Font ──────────────────────────────────────────── */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Font</h3>
                <div className="space-y-1.5">
                  {PORTFOLIO_FONTS.map((f) => {
                    const isActive = (font ?? "default") === f.key;
                    const familyDisplay = f.googleFamily?.replace(/\+/g, " ");
                    return (
                      <button
                        key={f.key}
                        onClick={() => setFont(f.key === "default" ? null : f.key)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all flex items-center justify-between ${
                          isActive
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:border-primary/40 hover:bg-secondary/50"
                        }`}
                      >
                        <span
                          className="text-sm font-medium text-foreground"
                          style={familyDisplay ? { fontFamily: `'${familyDisplay}', sans-serif` } : undefined}
                        >
                          {f.label}
                        </span>
                        {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer — Reset only */}
            <div className="p-5 border-t border-border shrink-0">
              <button
                onClick={handleReset}
                disabled={saveStatus === "saving"}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to defaults
              </button>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Crop modal for cover image */}
      {cropImageUrl && (
        <ImageCropModal
          imageUrl={cropImageUrl}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
          aspect={3}
          cropShape="rect"
          title="Crop cover image"
        />
      )}
    </>
  );
}
