import type { CSSProperties } from "react";

// ── Background Templates (applied to full page wrapper) ─────────────────────

export const PORTFOLIO_BACKGROUNDS = [
  { key: "gradient_default", label: "Classic Gradient" },
  { key: "grid",             label: "Grid" },
  { key: "dots",             label: "Dot Matrix" },
  { key: "wave",             label: "Wave" },
  { key: "stripe",           label: "Accent Stripe" },
] as const;

export type PortfolioBackgroundKey = (typeof PORTFOLIO_BACKGROUNDS)[number]["key"];

const VALID_BACKGROUNDS = new Set<string>(PORTFOLIO_BACKGROUNDS.map((b) => b.key));

// ── Pattern Color Palette ────────────────────────────────────────────────────

export const PORTFOLIO_PATTERN_COLORS = [
  { name: "Default",    hex: null },       // uses --border
  { name: "Slate",      hex: "#94A3B8" },
  { name: "Gray",       hex: "#9CA3AF" },
  { name: "Zinc",       hex: "#A1A1AA" },
  { name: "Stone",      hex: "#A8A29E" },
  { name: "White",      hex: "#FFFFFF" },
  { name: "Charcoal",   hex: "#374151" },
  { name: "Navy",       hex: "#1E3A5F" },
  { name: "Forest",     hex: "#166534" },
  { name: "Rose",       hex: "#BE123C" },
  { name: "Yellow",     hex: "#EAB308" },
] as const;

const VALID_PATTERN_COLORS = new Set<string>(
  PORTFOLIO_PATTERN_COLORS.filter((c) => c.hex !== null).map((c) => c.hex as string)
);

export function isValidPatternColor(v: string): boolean {
  return VALID_PATTERN_COLORS.has(v);
}

/** Convert hex (#RRGGBB) to rgba string at given opacity */
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

/**
 * Returns styles for the full page wrapper (`min-h-screen` div).
 * These are subtle, page-level background patterns.
 * When `patternColor` is provided, uses that hex color instead of the default --border CSS var.
 */
export function getPageBackgroundStyles(key: string | null, patternColor?: string | null): {
  className: string;
  style?: CSSProperties;
} {
  // Helper: returns the color string at given opacity
  const c = (opacity: number) =>
    patternColor
      ? hexToRgba(patternColor, opacity)
      : `hsl(var(--border) / ${opacity})`;

  switch (key) {
    case "grid":
      return {
        className: "min-h-screen",
        style: {
          backgroundColor: "hsl(var(--background))",
          backgroundImage: [
            `linear-gradient(to bottom right, ${c(0.06)}, transparent 60%)`,
            `linear-gradient(${c(0.18)} 1px, transparent 1px)`,
            `linear-gradient(90deg, ${c(0.18)} 1px, transparent 1px)`,
          ].join(", "),
          backgroundSize: "100% 100%, 32px 32px, 32px 32px",
        },
      };

    case "dots":
      return {
        className: "min-h-screen",
        style: {
          backgroundColor: "hsl(var(--background))",
          backgroundImage: [
            `radial-gradient(circle, ${c(0.22)} 1px, transparent 1px)`,
            `linear-gradient(to bottom right, ${c(0.06)}, transparent 60%)`,
          ].join(", "),
          backgroundSize: "20px 20px, 100% 100%",
        },
      };

    case "wave":
      return {
        className: "min-h-screen",
        style: {
          backgroundColor: "hsl(var(--background))",
          backgroundImage: [
            `radial-gradient(ellipse 100% 80% at 50% 120%, ${c(0.18)}, transparent)`,
            `radial-gradient(ellipse 80% 50% at 80% 0%, ${c(0.14)}, transparent)`,
          ].join(", "),
        },
      };

    case "stripe":
      return {
        className: "min-h-screen",
        style: {
          backgroundColor: "hsl(var(--background))",
          backgroundImage: `repeating-linear-gradient(135deg, ${c(0.18)} 0px, ${c(0.18)} 2px, transparent 2px, transparent 20px)`,
        },
      };

    // "gradient_default" or null/unknown
    default:
      return {
        className: "min-h-screen bg-background",
        style: key === "gradient_default" ? {
          backgroundImage: `linear-gradient(to bottom right, ${c(0.12)}, ${c(0.04)}, transparent 60%)`,
        } : undefined,
      };
  }
}

/**
 * @deprecated Use getPageBackgroundStyles instead. Kept for reference during migration.
 */
export function getBackgroundStyles(key: string | null): {
  className: string;
  style?: CSSProperties;
  hasTopStripe: boolean;
} {
  return getPageBackgroundStyles(key) as ReturnType<typeof getBackgroundStyles>;
}

// ── Background Color Palette ─────────────────────────────────────────────────

export const PORTFOLIO_BACKGROUND_COLORS = [
  { name: "Default",      hex: null },       // uses theme default
  { name: "White",        hex: "#FFFFFF" },
  { name: "Snow",         hex: "#F8FAFC" },
  { name: "Warm Gray",    hex: "#F5F5F4" },
  { name: "Mint",         hex: "#F0FDF4" },
  { name: "Sky",          hex: "#F0F9FF" },
  { name: "Lavender",     hex: "#FAF5FF" },
  { name: "Blush",        hex: "#FFF1F2" },
  { name: "Cream",        hex: "#FFFBEB" },
  { name: "Charcoal",     hex: "#1C1917" },
  { name: "Midnight",     hex: "#0F172A" },
  { name: "Deep Ocean",   hex: "#0C1222" },
] as const;

const VALID_BG_COLORS = new Set<string>(
  PORTFOLIO_BACKGROUND_COLORS.filter((c) => c.hex !== null).map((c) => c.hex as string)
);

export function isValidBackgroundColor(v: string): boolean {
  return VALID_BG_COLORS.has(v);
}

/** Returns true if the background color is a dark shade (needs light text) */
export function isDarkBackground(hex: string | null): boolean {
  if (!hex) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Relative luminance approximation
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.45;
}

// ── Border Color Palette ─────────────────────────────────────────────────────

export const PORTFOLIO_BORDER_COLORS = [
  { name: "Lime",     hex: "#8DC63F" },
  { name: "Charcoal", hex: "#111827" },
  { name: "Ocean",    hex: "#2563EB" },
  { name: "Violet",   hex: "#7C3AED" },
  { name: "Rose",     hex: "#E11D48" },
  { name: "Amber",    hex: "#D97706" },
  { name: "Teal",     hex: "#0D9488" },
  { name: "Slate",    hex: "#64748B" },
  { name: "Yellow",   hex: "#EAB308" },
] as const;

const VALID_BORDER_COLORS = new Set<string>(PORTFOLIO_BORDER_COLORS.map((c) => c.hex));

// ── Font Choices ─────────────────────────────────────────────────────────────

export const PORTFOLIO_FONTS = [
  { key: "default",        label: "Default (Geist)",  googleFamily: null },
  { key: "inter",          label: "Inter",            googleFamily: "Inter" },
  { key: "dm_sans",        label: "DM Sans",          googleFamily: "DM+Sans" },
  { key: "space_grotesk",  label: "Space Grotesk",    googleFamily: "Space+Grotesk" },
  { key: "lora",           label: "Lora",             googleFamily: "Lora" },
  { key: "jetbrains_mono", label: "JetBrains Mono",   googleFamily: "JetBrains+Mono" },
] as const;

export type PortfolioFontKey = (typeof PORTFOLIO_FONTS)[number]["key"];

const VALID_FONTS = new Set<string>(PORTFOLIO_FONTS.map((f) => f.key));

export function getFontConfig(key: string | null): {
  fontFamily: string | undefined;
  googleFontUrl: string | null;
} {
  if (!key || key === "default") return { fontFamily: undefined, googleFontUrl: null };

  const font = PORTFOLIO_FONTS.find((f) => f.key === key);
  if (!font || !font.googleFamily) return { fontFamily: undefined, googleFontUrl: null };

  const familyDisplay = font.googleFamily.replace(/\+/g, " ");
  return {
    fontFamily: `'${familyDisplay}', sans-serif`,
    googleFontUrl: `https://fonts.googleapis.com/css2?family=${font.googleFamily}:wght@400;500;600;700&display=swap`,
  };
}

// ── Validation ───────────────────────────────────────────────────────────────

export function isValidBackground(v: string): boolean {
  return VALID_BACKGROUNDS.has(v);
}

export function isValidBorderColor(v: string): boolean {
  return VALID_BORDER_COLORS.has(v);
}

export function isValidFont(v: string): boolean {
  return VALID_FONTS.has(v);
}

export function isValidCoverUrl(v: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;
  return v.startsWith(supabaseUrl);
}
