"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { hasAnalyticsConsent, CONSENT_CHANGED_EVENT } from "@/lib/consent";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

// ── Session ID for local DB tracking ──────────────────────────────────────────

function getSessionId() {
  const SK = "__lol_sid";
  let sid = sessionStorage.getItem(SK);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SK, sid);
  }
  return sid;
}

// ── Local DB page view tracker (respects analytics consent) ─────────────────

function DbPageViewTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (!hasAnalyticsConsent()) return;

    try {
      const blob = new Blob(
        [
          JSON.stringify({
            sessionId: getSessionId(),
            pathname,
            referrer: isFirst.current ? document.referrer || null : null,
          }),
        ],
        { type: "application/json" },
      );
      isFirst.current = false;
      navigator.sendBeacon("/api/track", blob);
    } catch {
      // silently ignore
    }
  }, [pathname]);

  return null;
}

// ── PostHog page view tracker ─────────────────────────────────────────────────

function PostHogPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!ph || !hasAnalyticsConsent()) return;
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
    if (!ph || !session?.user?.id || !hasAnalyticsConsent()) return;
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
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  const updateConsent = useCallback(() => {
    setAnalyticsAllowed(hasAnalyticsConsent());
  }, []);

  useEffect(() => {
    updateConsent();
    const handleConsentChange = () => updateConsent();
    window.addEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
    return () =>
      window.removeEventListener(CONSENT_CHANGED_EVENT, handleConsentChange);
  }, [updateConsent]);

  // Initialize or teardown PostHog based on consent
  useEffect(() => {
    if (!KEY) return;

    if (analyticsAllowed) {
      if (!posthog.__loaded) {
        posthog.init(KEY, {
          api_host: "/ingest",
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
      } else {
        posthog.opt_in_capturing();
      }
    } else {
      if (posthog.__loaded) {
        posthog.opt_out_capturing();
      }
    }
  }, [analyticsAllowed]);

  // When no PostHog key or no consent, just render DB tracker + children
  if (!KEY || !analyticsAllowed) {
    return (
      <>
        <DbPageViewTracker />
        {children}
      </>
    );
  }

  return (
    <PHProvider client={posthog}>
      <DbPageViewTracker />
      <PostHogPageViewTracker />
      <UserIdentifier />
      {children}
    </PHProvider>
  );
}
