"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { HoverBorderGradient } from "./hover-border-gradient";
import Link from "next/link";
import { ShimmerButton } from "./shimmer-button";
import { Check } from "lucide-react";

const colors = {
  50: "#FBFAF8",
  100: "#FFFFFF",
  200: "#E7E5E4",
  300: "#D6D3D1",
  400: "#A8A29E",
  500: "#6B7280",
  600: "#4B5563",
  700: "#1F2937",
  800: "#111827",
  900: "#0B1220",
  accent: "#2563EB",
};

const WORKS_WITH = ["Zapier", "Make", "n8n", "HubSpot", "Notion", "Stripe", "Airtable", "OpenAI"];

const TRUST_STATS = [
  { label: "Get your evenings back" },
  { label: "Reclaim 10+ hours per week" },
  { label: "Fixed price" },
  { label: "See it work before you pay" },
  { label: "Live in days" },
];

const DEFAULT_HEADLINE = "Automate your daily grind.";
const DEFAULT_SUBHEADING = "Browse proven automations. See them work. Deploy in days.";
const DEFAULT_SEARCH_PLACEHOLDER = 'e.g., "Sync Shopify to HubSpot" or "AI Phone Receptionist"';
const DEFAULT_CTA_LABEL = "Browse Solutions";

function splitSubheading(text: string): string[] {
  const parts = text
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text];
}

export interface HeroProps {
  headline?: string;
  subheading?: string;
  trustStats?: string[];
  worksWith?: string[];
  searchPlaceholder?: string;
  ctaLabel?: string;
}

interface Dot {
  top: number;
  left: number;
  size: number;
  animationName: string;
  duration: number;
  delay: number;
}

export function Hero({
  headline = DEFAULT_HEADLINE,
  subheading = DEFAULT_SUBHEADING,
  trustStats,
  worksWith,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  ctaLabel = DEFAULT_CTA_LABEL,
}: HeroProps = {}) {
  const router = useRouter();
  const gradientRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [dots, setDots] = useState<Dot[]>([]);

  const headlineWords = headline.trim().split(/\s+/).filter(Boolean);
  const subheadingChunks = splitSubheading(subheading);
  const trustList =
    trustStats && trustStats.length > 0
      ? trustStats.map((label) => ({ label }))
      : TRUST_STATS;
  const worksWithList = worksWith && worksWith.length > 0 ? worksWith : WORKS_WITH;

  useEffect(() => {
    const newDots = Array.from({ length: 34 }).map(() => {
      let top = Math.random() * 100;
      let left = Math.random() * 100;
      if (left > 15 && left < 85 && top > 20 && top < 80) {
        if (Math.random() > 0.5) {
          left = Math.random() > 0.5 ? Math.random() * 15 : 85 + Math.random() * 15;
        } else {
          top = Math.random() > 0.5 ? Math.random() * 20 : 80 + Math.random() * 20;
        }
      }
      return {
        top,
        left,
        size: [4, 6, 8, 10][Math.floor(Math.random() * 4)],
        animationName: `float-drift-${Math.floor(Math.random() * 4) + 1}`,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * -20,
      };
    });
    setDots(newDots);
  }, []);

  useEffect(() => {
    // Hover shimmer on headline words (non-touch only)
    const words = document.querySelectorAll<HTMLElement>(".hero-light .word");
    const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const handlers: Array<{ el: HTMLElement; enter: () => void; leave: () => void }> = [];

    if (!isTouch) {
      words.forEach((word) => {
        word.style.transition = "color 0.25s ease-out, text-shadow 0.25s ease-out";
        word.style.cursor = "default";
        const enter = () => {
          word.style.textShadow = "0 0 18px rgba(17, 24, 39, 0.15)";
          word.style.color = "#111827";
        };
        const leave = () => {
          word.style.textShadow = "none";
          word.style.color = "";
        };
        word.addEventListener("mouseenter", enter);
        word.addEventListener("mouseleave", leave);
        handlers.push({ el: word, enter, leave });
      });
    }

    function onClick(e: MouseEvent) {
      const ripple = document.createElement("div");
      ripple.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:4px;height:4px;background:rgba(132,204,22,0.35);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;animation:pulse-glow 0.9s ease-out forwards`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 900);
    }
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      handlers.forEach(({ el, enter, leave }) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const animating = useRef(false);

  const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

  const animate = () => {
    const gradient = gradientRef.current;
    if (!gradient) return;

    currentPos.current.x = lerp(currentPos.current.x, mousePos.current.x, 0.12);
    currentPos.current.y = lerp(currentPos.current.y, mousePos.current.y, 0.12);

    gradient.style.left = `${currentPos.current.x - 192}px`;
    gradient.style.top = `${currentPos.current.y - 192}px`;

    if (animating.current) requestAnimationFrame(animate);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePos.current.x = e.clientX - rect.left;
    mousePos.current.y = e.clientY - rect.top;

    const gradient = gradientRef.current;
    if (gradient) gradient.style.opacity = "1";

    if (!animating.current) {
      animating.current = true;
      requestAnimationFrame(animate);
    }
  };

  const handleMouseLeave = () => {
    animating.current = false;
    const gradient = gradientRef.current;
    if (gradient) gradient.style.opacity = "0";
  };

  function runSearch() {
    const q = query.trim();
    if (!q) return;
    router.push(`/solutions?q=${encodeURIComponent(q)}`);
  }

  return (
    <div
      ref={containerRef}
      className="hero-light min-h-[88vh] w-full overflow-hidden relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: colors[50] }} />

      {/* Floating dots */}
      {dots.map((dot, i) => (
        <div
          key={i}
          className="bg-floating-dot"
          style={{
            top: `${dot.top}%`,
            left: `${dot.left}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            animationName: dot.animationName,
            animationDuration: `${dot.duration}s`,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}

      {/* Grid */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grid-mask" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </radialGradient>
          <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke="rgba(17,24,39,0.2)" strokeWidth="1.0" />
          </pattern>
        </defs>
        <mask id="hero-mask">
          <rect width="100%" height="100%" fill="url(#grid-mask)" />
        </mask>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#hero-mask)" />
        <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: "0.4s" }} />
        <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: "0.8s" }} />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: "1.2s" }} />
        <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: "1.6s" }} />
        <circle cx="20%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: "1.8s" }} />
        <circle cx="80%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: "2.0s" }} />
        <circle cx="20%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: "2.2s" }} />
        <circle cx="80%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: "2.4s" }} />
      </svg>

      <div className="relative z-10 min-h-[88vh] flex flex-col justify-center items-center px-6 py-14 md:px-12 md:py-20">

        {/* Headline */}
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="tracking-tight flex flex-col items-center">
            <div className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight" style={{ color: colors[800] }}>
              {headlineWords.map((word, i) => (
                <React.Fragment key={`${word}-${i}`}>
                  <span
                    className="word"
                    style={{ animation: `word-appear 0.7s ease-out ${i * 110}ms both` }}
                  >
                    {word}
                  </span>
                  {i < headlineWords.length - 1 ? " " : null}
                </React.Fragment>
              ))}
            </div>
            <div
              className="mt-4 md:mt-5 text-xl md:text-3xl lg:text-4xl font-medium leading-[1.35] text-balance"
              style={{ color: "rgba(17,24,39,0.52)" }}
            >
              {subheadingChunks.map((chunk, i) => (
                <React.Fragment key={`${chunk}-${i}`}>
                  <span
                    className="word"
                    style={{ animation: `word-appear 0.7s ease-out ${500 + i * 160}ms both` }}
                  >
                    {chunk}
                  </span>
                  {i < subheadingChunks.length - 1 ? " " : null}
                </React.Fragment>
              ))}
            </div>
          </h1>

          {/* Trust stat pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {trustList.map((s, i) => (
              <div
                key={s.label}
                className="flex items-center gap-2 px-3 py-2.5 rounded-full border bg-white shadow-md text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  borderColor: "rgba(17,24,39,0.18)",
                  animation: `word-appear 0.6s ease-out ${900 + i * 90}ms both`,
                }}
              >
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white font-bold leading-none">
                  <Check className="p-0.5 font-bold" strokeWidth={4} />
                </span>
                <span className="font-semibold" style={{ color: colors[800] }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Search bar */}
          <div
            className="mt-7 w-full max-w-2xl mx-auto"
            style={{ animation: "word-appear 0.7s ease-out 1100ms both" }}
          >
            <div
              className="flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm bg-white"
              style={{ borderColor: "rgba(17,24,39,0.12)" }}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent outline-none text-sm md:text-base"
                style={{ color: colors[800] }}
              />
              <button
                onClick={runSearch}
                disabled={!query.trim()}
                className="rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap transition-all duration-200 hover:brightness-95 active:scale-[0.98] disabled:hover:brightness-100 disabled:active:scale-100"
                style={{ background: colors[800], color: "#fff" }}
              >
                Search
              </button>
            </div>

            {/* CTA */}
            <div className="mt-4 flex items-center justify-center">
              {/* <a
                href="/solutions"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border transition-all duration-200 hover:bg-white/60 hover:scale-[1.02] active:scale-[0.98]"
                style={{ borderColor: "rgba(17,24,39,0.14)", color: colors[600] }}
              >
                Browse Solutions
              </a> */}
              <Link href={"/solutions"}>
                <ShimmerButton className="shadow-2xl">
                  <span className="text-center text-sm leading-none font-medium tracking-tight whitespace-pre-wrap text-white lg:text-sm dark:from-white dark:to-slate-900/10">
                    {ctaLabel}
                  </span>
                </ShimmerButton>
              </Link>
            </div>
          </div>

          {/* Static works-with row */}
          <div
            className="mt-10"
            style={{ animation: "word-appear 0.6s ease-out 1500ms both" }}
          >
            <p className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: colors[400] }}>
              Works with
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {worksWithList.map((tool) => (
                <span key={tool} className="text-sm font-semibold" style={{ color: "rgba(17,24,39,0.28)" }}>
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mouse gradient */}
      <div
        ref={gradientRef}
        className="absolute pointer-events-none w-96 h-96 rounded-full blur-3xl transition-opacity duration-300 ease-out opacity-0 z-[5]"
        style={{ background: "radial-gradient(circle, rgba(21,128,61,0.27) 0%, transparent 65%)" }}
      />
    </div>
  );
}
