import React from "react";

interface GlowBorderProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  backgroundColor?: string;
  borderRadius?: string;
  borderWidth?: string;
}

export function GlowBorder({
  children,
  className = "",
  accentColor = "#8DC63F",
  backgroundColor = "#ffffff",
  borderRadius = "1.25rem",
  borderWidth = "2px",
}: GlowBorderProps) {
  /* Top-right corner = 225deg ≈ 3.93rad */
  const rotation = "3.93rad";

  return (
    <div
      className={className}
      style={{
        borderRadius,
        border: `${borderWidth} solid transparent`,
        backgroundImage: `linear-gradient(${backgroundColor}, ${backgroundColor}), linear-gradient(calc(${rotation}), ${accentColor} 0%, ${backgroundColor} 30%, transparent 80%)`,
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
      }}
    >
      {children}
    </div>
  );
}
