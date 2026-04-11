"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

// ── PostHog page view tracker ─────────────────────────────────────────────────

function PostHogPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!ph) return;
    const url =
      window.location.origin +
      pathname +
      (searchParams.toString() ? `?${searchParams}` : "");
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}

// ── User identity sync ────────────────────────────────────────────────────────

function UserIdentifier() {
  const { data: session } = useSession();
  const ph = usePostHog();
  const identified = useRef<string | null>(null);

  useEffect(() => {
    if (!ph || !session?.user?.id) return;
    if (identified.current === session.user.id) return;

    ph.identify(session.user.id, {
      email: session.user.email,
      role: session.user.role,
    });
    identified.current = session.user.id;
  }, [session, ph]);

  return null;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!KEY || posthog.__loaded) return;

    posthog.init(KEY, {
      api_host: "/a",
      ui_host: "https://eu.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_pageleave: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: "[data-ph-mask]",
      },
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug(false);
      },
    });
  }, []);

  if (!KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogPageViewTracker />
      <UserIdentifier />
      {children}
    </PHProvider>
  );
}
