"use client";

import { useState } from "react";
import { HowItWorksBusinessView } from "./HowItWorksBusinessView";
import { HowItWorksExpertView } from "./HowItWorksExpertView";

export function HowItWorks() {
  const [view, setView] = useState<"business" | "expert">("business");

  return (
    <section className="py-14 md:py-20 bg-[#FBFAF8]" id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6">

        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 tracking-tight text-foreground">
            How LogicLot works
          </h2>

          <div className="inline-flex flex-col sm:flex-row gap-2 sm:gap-0 bg-secondary p-1.5 rounded-2xl sm:rounded-full border border-border w-full sm:w-auto max-w-sm sm:max-w-none mx-auto">
            <button
              onClick={() => setView("business")}
              className={`px-6 sm:px-8 py-3.5 sm:py-3 rounded-xl sm:rounded-full text-sm sm:text-base font-bold transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-[0.98] ${
                view === "business"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground"
              }`}
            >
              I&apos;m a Business Owner
            </button>
            <button
              onClick={() => setView("expert")}
              className={`px-6 sm:px-8 py-3.5 sm:py-3 rounded-xl sm:rounded-full text-sm sm:text-base font-bold transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-[0.98] ${
                view === "expert"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground"
              }`}
            >
              I&apos;m an Expert
            </button>
          </div>
        </div>

        {view === "business" ? <HowItWorksBusinessView /> : <HowItWorksExpertView />}
      </div>
    </section>
  );
}
