import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const title = searchParams.get("title") || "Solution";
  const category = searchParams.get("category") || "";
  const summary = searchParams.get("summary") || "";
  const outcome = searchParams.get("outcome") || "";
  const price = searchParams.get("price") || "0";
  const deliveryDays = searchParams.get("deliveryDays") || "";
  const supportDays = searchParams.get("supportDays") || "30";
  const monthlyCostMin = searchParams.get("monthlyCostMin") || "";
  const monthlyCostMax = searchParams.get("monthlyCostMax") || "";
  const expertName = searchParams.get("expertName") || "";
  const expertImage = searchParams.get("expertImage") || "";
  const tier = searchParams.get("tier") || "";
  const toolsRaw = searchParams.get("tools") || "";

  const tools = toolsRaw ? toolsRaw.split(",").filter(Boolean) : [];
  const displayTools = tools.slice(0, 3);
  const extraToolsCount = tools.length - displayTools.length;

  const hasMonthly =
    monthlyCostMin &&
    monthlyCostMax &&
    (monthlyCostMin !== "0" || monthlyCostMax !== "0");

  const tierLabel =
    tier === "FOUNDING"
      ? "Founding Expert"
      : tier === "ELITE"
        ? "Elite Expert"
        : tier === "PROVEN"
          ? "Proven Expert"
          : "";

  return new ImageResponse(
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        backgroundColor: "#ffffff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Left content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px",
          width: "750px",
        }}
      >
        {/* Top: Category + Support badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#15803d",
            }}
          >
            {category}
          </div>
          {supportDays && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "20px",
                padding: "4px 12px",
                fontSize: "13px",
                fontWeight: 500,
                color: "#16a34a",
              }}
            >
              Support: {supportDays}d
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginTop: "16px",
          }}
        >
          <div
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.2,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title.length > 60 ? title.slice(0, 57) + "..." : title}
          </div>

          {/* Summary */}
          {summary && (
            <div
              style={{
                fontSize: "18px",
                color: "#64748b",
                lineHeight: 1.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {summary.length > 120 ? summary.slice(0, 117) + "..." : summary}
            </div>
          )}
        </div>

        {/* Outcome */}
        {outcome && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "16px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #dcfce7",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "15px",
              fontWeight: 500,
              color: "#15803d",
            }}
          >
            <span style={{ fontSize: "16px" }}>📈</span>
            {outcome.length > 60 ? outcome.slice(0, 57) + "..." : outcome}
          </div>
        )}

        {/* Tools */}
        {displayTools.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            {displayTools.map((tool) => (
              <div
                key={tool}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "14px",
                  color: "#475569",
                  fontWeight: 500,
                }}
              >
                {tool}
              </div>
            ))}
            {extraToolsCount > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "6px 12px",
                  fontSize: "14px",
                  color: "#94a3b8",
                  fontWeight: 500,
                }}
              >
                +{extraToolsCount}
              </div>
            )}
          </div>
        )}

        {/* Expert row */}
        {expertName && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            {expertImage ? (
              <img
                src={expertImage}
                width={36}
                height={36}
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#475569",
                }}
              >
                {expertName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span
              style={{ fontSize: "16px", fontWeight: 500, color: "#1e293b" }}
            >
              {expertName}
            </span>
            {tierLabel && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  backgroundColor: "#18181b",
                  color: "#fbbf24",
                  borderRadius: "6px",
                  padding: "4px 12px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {tierLabel}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right panel — pricing */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "450px",
          padding: "48px 48px 48px 0",
          borderLeft: "1px solid #f1f5f9",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fafafa",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "36px 32px",
            gap: "20px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#6366f1",
              }}
            >
              Implementation
            </span>
            <span
              style={{ fontSize: "42px", fontWeight: 700, color: "#0f172a" }}
            >
              €{Number(price).toLocaleString("de-DE")}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              {deliveryDays && (
                <span style={{ fontSize: "14px", color: "#64748b" }}>
                  Delivery: ~{deliveryDays} days
                </span>
              )}
              <span style={{ fontSize: "14px", color: "#64748b" }}>
                Support: {supportDays} days
              </span>
            </div>

            {hasMonthly && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "2px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#94a3b8",
                  }}
                >
                  Est. Monthly AI
                </span>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#0f172a",
                  }}
                >
                  €{monthlyCostMin}–€{monthlyCostMax}
                </span>
              </div>
            )}
          </div>

          {/* CTA bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#18181b",
              color: "#ffffff",
              borderRadius: "12px",
              padding: "14px 0",
              fontSize: "16px",
              fontWeight: 600,
              marginTop: "4px",
            }}
          >
            View Solution
          </div>
        </div>

        {/* LogicLot branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "20px",
            gap: "6px",
            fontSize: "14px",
            color: "#94a3b8",
            fontWeight: 500,
          }}
        >
          logiclot.io
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
