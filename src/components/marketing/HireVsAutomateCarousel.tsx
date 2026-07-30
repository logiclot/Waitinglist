"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, User, Zap } from "lucide-react";
import { HIRE_VS_AUTOMATE_ROLES } from "@/data/hire-vs-automate";
import { GlowBorder } from "@/components/ui/glow-border";

const INTERVAL_MS = 5500000;

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
      <p className="text-sm font-semibold uppercase tracking-widest">
        Hire vs. Automate
      </p>

      {/* Job title */}
      <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
        {role.title}
      </h3>

      {/* Cards with overlaid arrows */}
      <div className="max-w-4xl mx-auto relative flex-1 min-h-0">
        {/* Left arrow */}
        <button
          onClick={handlePrev}
          className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-border bg-white shadow-md hover:shadow-lg hover:scale-110 hover:border-primary/30 flex items-center justify-center transition-all duration-200"
          aria-label="Previous role"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Right arrow */}
        <button
          onClick={handleNext}
          className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-border bg-white shadow-md hover:shadow-lg hover:scale-110 hover:border-primary/30 flex items-center justify-center transition-all duration-200"
          aria-label="Next role"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Two cards side by side */}
        <div
          key={currentIndex}
          className="h-full grid gap-2 mt-10 animate-slide-in md:grid-cols-2"
        >
          {/* Hire card */}
          <div className="h-full bg-white flex flex-col relative p-6 border border-ash-300 shadow-2xl shadow-ash-200 rounded-3xl z-10 md:p-8">
            <User className="size-60 text-ash-100 absolute -top-20 -right-20 stroke-[0.25] -rotate-45 transition-[color] -z-10 group-hover:text-ash-200" />
            <div className="flex flex-col gap-2">
              <User className="size-5" />
              <p className="text-3xl text-ash-800 font-noto font-semibold tracking-tight">
                Hire
              </p>
            </div>
            <ul className="grid gap-2 mt-6">
              {role.hire.bullets.map((b, i) => (
                <li
                  key={i}
                  className="text-sm flex gap-2"
                >
                  <span className="shrink-0">
                    &bull;
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-black/[0.06]">
              <span className="text-sm">
                Per month
              </span>
              <p className="text-sm text-ash-800 font-semibold">
                &euro;{role.hire.monthlyCostLow.toLocaleString()}&ndash;
                {role.hire.monthlyCostHigh.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Automate card */}
          <div className="h-full bg-white flex flex-col relative p-6 border border-ash-300 shadow-2xl shadow-ash-200 rounded-3xl z-10 md:p-8">
            <Zap className="size-60 text-ash-100 absolute -top-20 -right-20 stroke-[0.25] -rotate-45 transition-[color] -z-10 group-hover:text-ash-200" />
            <div className="flex flex-col gap-2">
              <Zap className="size-5 text-[#8DC63F]" />
              <p className="text-3xl text-ash-800 font-noto font-semibold tracking-tight">
                Automate
              </p>
            </div>
            <ul className="grid gap-2 mt-6">
              {role.automate.bullets.map((b, i) => (
                <li
                  key={i}
                  className="text-sm flex gap-2"
                >
                  <span className="shrink-0">
                    &bull;
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between gap-4 mt-4 pt-3 border-t border-black/[0.06]">
              <div>
                <span className="text-sm">
                  {" "}One-time payment
                </span>
                <p className="text-sm text-ash-800 font-semibold">
                  &euro;{role.automate.setupCostLow.toLocaleString()}&ndash;
                  {role.automate.setupCostHigh.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-sm">
                  Maintenance/month
                </span>
                <p className="text-sm text-ash-800 font-semibold">
                  + &euro;{role.automate.monthlyCost}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA link */}
      <div className="mt-4">
        <Link
          href={`/solutions?category=${role.categorySlug}`}
          className="text-sm hover:text-primary transition-colors"
        >
          See {role.categoryLabel.toLowerCase()} solutions{" "}
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
