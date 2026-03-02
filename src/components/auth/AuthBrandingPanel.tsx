"use client";

import { LogoMark } from "@/components/LogoMark";
import { useMorseCode } from "@/hooks/useMorseCode";

/* ── Panel component ───────────────────────────────────────────────── */

export function AuthBrandingPanel() {
  const { on: morseOn, cycleCount } = useMorseCode();
  // Rotate one node position (45°) after each full morse message
  const rotation = cycleCount * 45;

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden select-none">
      {/* Subtle radial glow behind logo */}
      <div
        className="absolute rounded-full blur-3xl opacity-20"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, #8DC63F 0%, transparent 70%)",
        }}
      />

      {/* Rotation wrapper — turns one position after each morse cycle */}
      <div
        className="relative z-10"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "transform",
        }}
      >
        {/* Breathing wrapper — GPU-promoted to avoid sub-pixel jitter on SVG strokes */}
        <div style={{ animation: "breathe 4s ease-in-out infinite", willChange: "transform", backfaceVisibility: "hidden" }}>
          <LogoMark
            size={160}
            greenDotStyle={{
              filter: morseOn
                ? "brightness(1.45) drop-shadow(0 0 4px #8DC63F) drop-shadow(0 0 10px #8DC63F)"
                : "brightness(0.7)",
              transition: "filter 80ms ease",
            }}
          />
        </div>
      </div>

      {/* Brand text */}
      <div className="relative z-10 mt-8 text-center">
        <h2
          className="text-4xl font-bold text-white tracking-tight leading-none"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Log<span className="opacity-60">|</span>cLot
        </h2>
        <p className="mt-3 text-white/50 text-sm tracking-wide">
          Automate your daily grind.
        </p>
      </div>
    </div>
  );
}
