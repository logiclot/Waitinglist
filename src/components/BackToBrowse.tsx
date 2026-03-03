"use client";

import { useRouter } from "next/navigation";

export function BackToBrowse() {
  const router = useRouter();

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => {
          // If the user came from the solutions listing, go back to preserve scroll position
          if (document.referrer && new URL(document.referrer).pathname.startsWith("/solutions")) {
            router.back();
          } else {
            router.push("/solutions");
          }
        }}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Back to Browse
      </button>
    </div>
  );
}
