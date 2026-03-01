"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

// ── Page view tracker ─────────────────────────────────────────────────────────
// Captures $pageview on every route change (App Router doesn't reload the page).

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!ph) return;
    const url = window.location.origin + pathname + (searchParams.toString() ? `?${searchParams}` : "");
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}

// ── User identity sync ────────────────────────────────────────────────────────
// Identifies the logged-in user so events are linked to a person in PostHog.

function UserIdentifier() {
  const { data: session } = useSession();
  const ph = usePostHog();
  const identified = useRef<string | null>(null);

  useEffect(() => {
    if (!ph || !session?.user?.id) return;
    if (identified.current === session.user.id) return; // already identified this session

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
    if (!KEY) return; // Skip silently in dev if key not configured

    posthog.init(KEY, {
      api_host: HOST,
      person_profiles: "identified_only", // Don't create anonymous profiles
      capture_pageview: false,            // We track manually via PageViewTracker
      capture_pageleave: true,
      session_recording: {
        maskAllInputs: true,              // GDPR: never record passwords or form fields
        maskTextSelector: "[data-ph-mask]",
      },
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug(false);
      },
    });
  }, []);

  if (!KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PageViewTracker />
      <UserIdentifier />
      {children}
    </PHProvider>
  );
}
