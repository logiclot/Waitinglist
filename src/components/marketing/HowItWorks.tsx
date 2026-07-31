"use client";

import { useState } from "react";
import { HowItWorksBusinessView } from "./HowItWorksBusinessView";
import { HowItWorksExpertView } from "./HowItWorksExpertView";

export function HowItWorks() {
  const [view, setView] = useState<"business" | "expert">("business");

  return (
    <section className="pt-20 md:pt-40" id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6">

        <div className="flex justify-center text-center mb-20">
          <div className="bg-ash-200 flex gap-2 p-1 rounded-full">
            <button
              onClick={() => setView("business")}
              className={`text-sm font-noto font-bold tracking-tight py-2.5 px-5 rounded-full cursor-pointer ${
                view === "business"
                  ? "text-ash-50 bg-ash-900 transition-colors hover:bg-ash-800"
                  : "text-ash-800"
              }`}
            >
              I&apos;m a Business Owner
            </button>
            <button
              onClick={() => setView("expert")}
              className={`text-sm font-noto font-bold tracking-tight py-2.5 px-5 rounded-full cursor-pointer ${
                view === "expert"
                  ? "text-ash-50 bg-ash-900 transition-colors hover:bg-ash-800"
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
