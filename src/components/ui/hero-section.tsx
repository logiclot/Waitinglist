"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const colors = {
  // Light/cream theme palette (trustworthy marketplace vibe)
  50: "#FBFAF8",   // page bg (cream)
  100: "#FFFFFF",  // surfaces
  200: "#E7E5E4",  // borders
  300: "#D6D3D1",  // stronger borders
  400: "#A8A29E",  // muted elements
  500: "#6B7280",  // muted text
  600: "#4B5563",  // secondary text
  700: "#1F2937",  // dark text
  800: "#111827",  // near-black text
  900: "#0B1220",  // deepest near-black
  accent: "#2563EB", // LogicLot Blue for hover highlights
};

// Expanded list of partners for marquee
const TRUST_LOGOS = [
  "Zapier", "Make", "HubSpot", "Salesforce", "OpenAI",
  "n8n", "Pipedrive", "Stripe", "Notion", "Airtable", "Typeform"
];

interface Dot {
  top: number;
  left: number;
  size: number;
  animationName: string;
  duration: number;
  delay: number;
}

export function Hero() {
  const router = useRouter();
  const gradientRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    // Generate random dots avoiding the center text area
    const newDots = Array.from({ length: 34 }).map(() => {
      let top = Math.random() * 100;
      let left = Math.random() * 100;
      
      // Exclusion Zone (approx text area): Left 20-80%, Top 25-75%
      // We push dots out of this zone to ensure they don't overlap text
      // Added slightly larger buffer for "bounce" effect visual clearance
      if (left > 15 && left < 85 && top > 20 && top < 80) {
        // Randomly decide whether to push horizontally or vertically
        if (Math.random() > 0.5) {
           // Push Horizontal
           left = Math.random() > 0.5 ? Math.random() * 15 : 85 + Math.random() * 15;
        } else {
           // Push Vertical
           top = Math.random() > 0.5 ? Math.random() * 20 : 80 + Math.random() * 20;
        }
      }

      return {
        top,
        left,
        size: [4, 6, 8, 10][Math.floor(Math.random() * 4)],
        animationName: `float-drift-${Math.floor(Math.random() * 4) + 1}`,
        duration: 8 + Math.random() * 12, // 8s - 20s duration
        delay: Math.random() * -20 // Start mid-animation
      };
    });
    setDots(newDots);
  }, []);

  useEffect(() => {
    // Animate words
    const words = document.querySelectorAll<HTMLElement>(".hero-light .word");
    words.forEach((word) => {
      const delay = parseInt(word.getAttribute("data-delay") || "0", 10);
      setTimeout(() => {
        word.style.animation = "word-appear 0.7s ease-out forwards";
        word.style.opacity = "1"; // Ensure opacity is set to 1 after animation trigger
      }, delay);
    });

    // Subtle word hover (keep professional)
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (!isTouch) {
      words.forEach((word) => {
        word.style.transition = "color 0.25s ease-out, text-shadow 0.25s ease-out";
        word.style.cursor = "default";
        
        word.addEventListener("mouseenter", () => {
          word.style.textShadow = "0 0 14px rgba(17, 24, 39, 0.10)";
          word.style.color = "#111827"; // Near-black on hover
        });
        
        word.addEventListener("mouseleave", () => {
          word.style.textShadow = "none";
           word.style.color = ""; 
        });
      });
    }

    // Click ripple effect
    function onClick(e: MouseEvent) {
      const ripple = document.createElement("div");
      ripple.style.position = "fixed";
      ripple.style.left = e.clientX + "px";
      ripple.style.top = e.clientY + "px";
      ripple.style.width = "4px";
      ripple.style.height = "4px";
      ripple.style.background = "rgba(17, 24, 39, 0.18)";
      ripple.style.borderRadius = "50%";
      ripple.style.transform = "translate(-50%, -50%)";
      ripple.style.pointerEvents = "none";
      ripple.style.animation = "pulse-glow 0.9s ease-out forwards";
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 900);
    }
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
    };
  }, []);

  // Handle Mouse Move specific to the Hero Container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const gradient = gradientRef.current;
    if (gradient) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      gradient.style.left = `${x - 192}px`; // Center of 384px width
      gradient.style.top = `${y - 192}px`;  // Center of 384px height
      gradient.style.opacity = "1";
    }
  };

  const handleMouseLeave = () => {
    const gradient = gradientRef.current;
    if (gradient) {
      gradient.style.opacity = "0";
    }
  };

  function runSearch() {
    const q = query.trim();
    if (!q) return;
    router.push(`/solutions?q=${encodeURIComponent(q)}`);
  }

  return (
    <div 
      ref={containerRef}
      className="hero-light min-h-[85vh] w-full overflow-hidden relative"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Light cream background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${colors[50]}, ${colors[50]})`,
        }}
      />

      {/* Randomized Floating Background Dots (Excluded from Center) */}
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
            animationDelay: `${dot.delay}s`
          }} 
        />
      ))}

      {/* Subtle grid */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="grid-mask" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </radialGradient>
          <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="rgba(17,24,39,0.2)"
              strokeWidth="1.0"
            />
          </pattern>
        </defs>
        <mask id="hero-mask">
          <rect width="100%" height="100%" fill="url(#grid-mask)" />
        </mask>
        <rect width="100%" height="100%" fill="url(#grid)" mask="url(#hero-mask)" />
        
        {/* Decorative Grid Elements */}
        <line x1="0" y1="20%" x2="100%" y2="20%" className="grid-line" style={{ animationDelay: "0.4s" }} />
        <line x1="0" y1="80%" x2="100%" y2="80%" className="grid-line" style={{ animationDelay: "0.8s" }} />
        <line x1="20%" y1="0" x2="20%" y2="100%" className="grid-line" style={{ animationDelay: "1.2s" }} />
        <line x1="80%" y1="0" x2="80%" y2="100%" className="grid-line" style={{ animationDelay: "1.6s" }} />
        <circle cx="20%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: "1.8s" }} />
        <circle cx="80%" cy="20%" r="2" className="detail-dot" style={{ animationDelay: "2.0s" }} />
        <circle cx="20%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: "2.2s" }} />
        <circle cx="80%" cy="80%" r="2" className="detail-dot" style={{ animationDelay: "2.4s" }} />
      </svg>

      <div className="relative z-10 min-h-[85vh] flex flex-col justify-center items-center px-6 py-14 md:px-12 md:py-20">
        {/* Top micro trust */}
        <div className="text-center">
          <h2
            className="text-xs md:text-sm font-mono font-medium uppercase tracking-[0.18em]"
            style={{ color: colors[600] }}
          >
            <span className="word opacity-0" data-delay="0">Vetted specialists</span>
            <span className="word opacity-0" data-delay="160"> · </span>
            <span className="word opacity-0" data-delay="320">Platform NDA</span>
            <span className="word opacity-0" data-delay="480"> · </span>
            <span className="word opacity-0" data-delay="640">Zero-data handover</span>
          </h2>
        </div>

        {/* Main headline (LogicLot copy, marketplace tone) */}
        <div className="text-center max-w-5xl mx-auto mt-6">
          <h1 className="tracking-tight flex flex-col items-center">
            <div
              className="text-4xl md:text-6xl lg:text-7xl font-semibold leading-[1.05]"
              style={{ color: colors[800] }}
            >
              <span className="word opacity-0" data-delay="900">Automate</span>{" "}
              <span className="word opacity-0" data-delay="1040">your</span>{" "}
              <span className="word opacity-0" data-delay="1180">daily</span>{" "}
              <span className="word opacity-0" data-delay="1320">grind.</span>
            </div>

            <div
              className="mt-3 md:mt-4 text-3xl md:text-5xl lg:text-6xl font-semibold leading-[1.15]"
              style={{ color: "rgba(17,24,39,0.8)" }}
            >
              <span className="word opacity-0" data-delay="1560">Find</span>{" "}
              <span className="word opacity-0" data-delay="1700">automation</span>{" "}
              <span className="word opacity-0" data-delay="1840">solutions</span>{" "}
              <span className="word opacity-0" data-delay="1980">that</span>{" "}
              <span className="word opacity-0" data-delay="2120">fit</span>{" "}
              <span className="word opacity-0" data-delay="2260">your</span>{" "}
              <span className="word opacity-0" data-delay="2400">business.</span>
            </div>
          </h1>

          <p
            className="mt-6 text-base md:text-lg opacity-0"
            style={{ color: colors[600], animation: "word-appear 0.7s ease-out forwards", animationDelay: "2.6s" }}
          >
            Browse proven automations or request a custom workflow.
          </p>

          {/* Search (MUST KEEP FUNCTIONALITY: Enter/click -> /solutions?q=...) */}
          <div className="mt-10 w-full max-w-2xl mx-auto opacity-0" style={{ animation: "word-appear 0.7s ease-out forwards", animationDelay: "2.8s" }}>
            <div
              className="flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm bg-white"
              style={{ borderColor: "rgba(17,24,39,0.12)" }}
            >
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runSearch();
                }}
                placeholder="e.g., “Sync Shopify to HubSpot” or “AI Phone Receptionist”"
                className="w-full bg-transparent outline-none text-sm md:text-base"
                style={{ color: colors[800] }}
              />
              <button
                onClick={runSearch}
                disabled={!query.trim()}
                className="rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: colors[800],
                  color: "#fff",
                }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Trust bar (Marquee implementation adapted from previous Hero) */}
          <div className="mt-12 opacity-0" style={{ animation: "word-appear 0.7s ease-out forwards", animationDelay: "3.0s" }}>
            
            <div 
              className="relative flex w-full overflow-hidden max-w-3xl mx-auto"
              style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
            >
              {/* First copy */}
              <div className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-12 px-4">
                {TRUST_LOGOS.map((logo) => (
                  <span key={logo} className="text-lg font-bold whitespace-nowrap transition-colors cursor-default" style={{ color: "rgba(17,24,39,0.35)" }}>
                    {logo}
                  </span>
                ))}
              </div>
              {/* Second copy for seamless loop */}
              <div className="flex animate-marquee min-w-full shrink-0 items-center justify-around gap-12 px-4" aria-hidden="true">
                {TRUST_LOGOS.map((logo) => (
                  <span key={`dup-${logo}`} className="text-lg font-bold whitespace-nowrap transition-colors cursor-default" style={{ color: "rgba(17,24,39,0.35)" }}>
                    {logo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle mouse gradient - Now Absolute and controlled by Container */}
      <div
        ref={gradientRef}
        className="absolute pointer-events-none w-96 h-96 rounded-full blur-3xl transition-all duration-300 ease-out opacity-0 z-0"
        style={{
          background: "radial-gradient(circle, rgba(17,24,39,0.12) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
