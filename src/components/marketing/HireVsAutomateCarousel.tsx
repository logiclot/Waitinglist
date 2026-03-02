"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, User, Zap } from "lucide-react";
import { HIRE_VS_AUTOMATE_ROLES } from "@/data/hire-vs-automate";
import { GlowBorder } from "@/components/ui/glow-border";

const INTERVAL_MS = 5500;

export function HireVsAutomateCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPaused || isUserInteracted) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HIRE_VS_AUTOMATE_ROLES.length);
    }, INTERVAL_MS);

    return clearTimer;
  }, [isPaused, isUserInteracted, clearTimer]);

  function handlePrev() {
    setIsUserInteracted(true);
    setCurrentIndex(
      (prev) =>
        (prev - 1 + HIRE_VS_AUTOMATE_ROLES.length) %
        HIRE_VS_AUTOMATE_ROLES.length
    );
  }

  function handleNext() {
    setIsUserInteracted(true);
    setCurrentIndex(
      (prev) => (prev + 1) % HIRE_VS_AUTOMATE_ROLES.length
    );
  }

  const role = HIRE_VS_AUTOMATE_ROLES[currentIndex];

  return (
    <div
      className="flex flex-col h-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section label */}
      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-3">
        Hire vs. Automate
      </p>

      {/* Job title */}
      <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-5">
        {role.title}
      </h3>

      {/* Cards with overlaid arrows */}
      <div className="relative flex-1 min-h-0">
        {/* Left arrow */}
        <button
          onClick={handlePrev}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-border bg-white shadow-md hover:shadow-lg hover:scale-110 hover:border-primary/30 flex items-center justify-center transition-all duration-200"
          aria-label="Previous role"
        >
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Right arrow */}
        <button
          onClick={handleNext}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-border bg-white shadow-md hover:shadow-lg hover:scale-110 hover:border-primary/30 flex items-center justify-center transition-all duration-200"
          aria-label="Next role"
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Two cards side by side */}
        <div
          key={currentIndex}
          className="animate-slide-in grid grid-cols-2 gap-4 h-full"
        >
          {/* Hire card */}
          <GlowBorder accentColor="#111827" backgroundColor="#FBFAF8" borderRadius="1rem" className="h-full">
            <div className="rounded-2xl bg-white p-5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-foreground" />
                <p className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Hire
                </p>
              </div>
              <ul className="space-y-2 flex-1">
                {role.hire.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="text-xs text-foreground leading-relaxed flex gap-2"
                  >
                    <span className="text-foreground/30 shrink-0 leading-relaxed">
                      &bull;
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-black/[0.06]">
                <p className="text-base font-bold text-foreground">
                  &euro;{role.hire.monthlyCostLow.toLocaleString()}&ndash;
                  {role.hire.monthlyCostHigh.toLocaleString()}
                  <span className="text-xs font-normal text-foreground/50">
                    /mo
                  </span>
                </p>
              </div>
            </div>
          </GlowBorder>

          {/* Automate card */}
          <GlowBorder accentColor="#111827" backgroundColor="#FBFAF8" borderRadius="1rem" className="h-full">
            <div className="rounded-2xl bg-white p-5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-[#8DC63F]" />
                <p className="text-sm font-semibold text-foreground uppercase tracking-wider">
                  Automate
                </p>
              </div>
              <ul className="space-y-2 flex-1">
                {role.automate.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="text-xs text-foreground leading-relaxed flex gap-2"
                  >
                    <span className="text-foreground/30 shrink-0 leading-relaxed">
                      &bull;
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-3 border-t border-black/[0.06]">
                <p className="text-base font-bold text-foreground">
                  &euro;{role.automate.setupCostLow.toLocaleString()}&ndash;
                  {role.automate.setupCostHigh.toLocaleString()}
                  <span className="text-xs font-normal text-foreground/50">
                    {" "}one-time
                  </span>
                </p>
                <p className="text-xs text-foreground/50 mt-0.5">
                  + &euro;{role.automate.monthlyCost}/mo maintenance
                </p>
              </div>
            </div>
          </GlowBorder>
        </div>
      </div>

      {/* CTA link */}
      <div className="mt-4">
        <Link
          href={`/solutions?category=${role.categorySlug}`}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          See {role.categoryLabel.toLowerCase()} solutions{" "}
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
