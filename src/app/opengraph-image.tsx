import { ImageResponse } from "next/og";
import { BRAND_NAME } from "@/lib/branding";

export const runtime = "edge";
export const alt = BRAND_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Pre-compute spider-web node positions for inline SVG in OG image
  const outerRadius = 36;
  const cx = 50;
  const cy = 50;
  const nodes = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 * Math.PI) / 180;
    return { x: cx + outerRadius * Math.sin(angle), y: cy - outerRadius * Math.cos(angle) };
  });

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          gap: 0,
        }}
      >
        {/* Logo mark + brand name row */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "24px" }}>
          {/* Spider-web SVG */}
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
            {nodes.map((pos, i) => {
              const next = nodes[(i + 1) % 8];
              return (
                <g key={i}>
                  <line x1={pos.x} y1={pos.y} x2={next.x} y2={next.y} stroke="#4a5e78" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1={cx} y1={cy} x2={pos.x} y2={pos.y} stroke="#4a5e78" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx={pos.x} cy={pos.y} r="4.5" fill="#5a7a9a" />
                </g>
              );
            })}
            <circle cx={cx} cy={cy} r="6.5" fill="#8DC63F" />
          </svg>
          {/* Brand text: Log|cLot */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <span style={{ fontSize: 72, fontWeight: 700, color: "white", letterSpacing: "-2px" }}>Log</span>
            <span style={{ fontSize: 72, fontWeight: 300, color: "rgba(255,255,255,0.45)", letterSpacing: "-2px" }}>|</span>
            <span style={{ fontSize: 72, fontWeight: 700, color: "white", letterSpacing: "-2px" }}>cLot</span>
          </div>
        </div>
        <div
          style={{
            fontSize: 26,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Buy ready-to-implement automations. Work directly with specialists.
        </div>
      </div>
    ),
    { ...size }
  );
}
