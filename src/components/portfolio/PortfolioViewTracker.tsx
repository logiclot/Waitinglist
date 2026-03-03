"use client";

import { useEffect } from "react";

interface Props {
  slug: string;
  isOwner: boolean;
}

export function PortfolioViewTracker({ slug, isOwner }: Props) {
  useEffect(() => {
    if (isOwner) return;

    const key = `__ll_pv_${slug}`;
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, "1");

    try {
      const blob = new Blob(
        [JSON.stringify({ slug })],
        { type: "application/json" },
      );
      navigator.sendBeacon("/api/portfolio-view", blob);
    } catch {
      // silently ignore
    }
  }, [slug, isOwner]);

  return null;
}
