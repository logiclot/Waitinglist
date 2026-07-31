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
          <div className="inline-flex flex-col sm:flex-row gap-2 sm:gap-0 bg-secondary p-1.5 rounded-2xl sm:rounded-full border border-border w-full sm:w-auto max-w-sm sm:max-w-none mx-auto">
            <button
              onClick={() => setView("business")}
              className={`text-sm font-noto font-bold tracking-tight px-6 px-8 py-3.5 rounded-xl sm:rounded-full transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-[0.98] ${
                view === "business"
                  ? "bg-ash-900 transition-colors hover:bg-ash-800"
                  : "text-ash-800"
              }`}
            >
              I&apos;m a Business Owner
            </button>
            <button
              onClick={() => setView("expert")}
              className={`text-sm font-noto font-bold tracking-tight px-6 px-8 py-3.5 rounded-xl sm:rounded-full transition-all duration-300 hover:bg-primary/10 hover:text-primary active:scale-[0.98] ${
                view === "expert"
                  ? "bg-ash-900 transition-colors hover:bg-ash-800"
                  : "text-ash-800"
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
