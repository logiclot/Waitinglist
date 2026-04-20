"use client";

import { useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";

interface Props {
  solutionId: string;
  slug?: string | null;
  title: string;
  category?: string | null;
  expertId?: string | null;
  priceCents: number;
}

export function TrackSolutionView({
  solutionId,
  slug,
  title,
  category,
  expertId,
  priceCents,
}: Props) {
  const ph = usePostHog();
  const fired = useRef<string | null>(null);

  useEffect(() => {
    if (!ph) return;
    if (fired.current === solutionId) return;
    fired.current = solutionId;

    ph.capture("solution_viewed", {
      solution_id: solutionId,
      slug: slug ?? undefined,
      title,
      category: category ?? undefined,
      expert_id: expertId ?? undefined,
      price_cents: priceCents,
    });
  }, [ph, solutionId, slug, title, category, expertId, priceCents]);

  return null;
}
