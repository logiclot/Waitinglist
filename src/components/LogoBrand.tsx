import Link from "next/link";
import { LogoMark } from "./LogoMark";

interface LogoBrandProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 22, text: "text-base", gap: "gap-1.5" },
  md: { icon: 28, text: "text-lg", gap: "gap-2" },
  lg: { icon: 40, text: "text-2xl", gap: "gap-3" },
};

/**
 * Full LogicLot brand logo: spider-web icon + "Log|cLot" styled text.
 * Renders as a <Link> when `href` is provided, otherwise as a <div>.
 */
export function LogoBrand({ href, size = "md", showTagline = false, className = "" }: LogoBrandProps) {
  const { icon, text, gap } = sizeMap[size];

  const inner = (
    <span className={`inline-flex items-center ${gap} ${className}`}>
      <LogoMark size={icon} />
      <span
        className={`font-bold leading-none tracking-tight text-[#1C2B47] dark:text-white ${text}`}
        style={{ fontFamily: "var(--font-geist-sans)" }}
      >
        Log<span className="opacity-60">|</span>cLot
      </span>
      {showTagline && (
        <span className="hidden sm:block text-xs text-muted-foreground font-normal ml-1 self-end mb-0.5">
          Marketplace for Automations &amp; AI Solutions
        </span>
      )}
    </span>
  );

  if (!href) return <div>{inner}</div>;

  return (
    <Link href={href} className="inline-flex">
      {inner}
    </Link>
  );
}
