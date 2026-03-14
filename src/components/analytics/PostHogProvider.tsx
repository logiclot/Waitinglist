"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

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

// ── Local DB page view tracker (fires for ALL visitors) ───────────────────────

function DbPageViewTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    try {
      const blob = new Blob(
        [JSON.stringify({
          sessionId: getSessionId(),
          pathname,
          referrer: isFirst.current ? document.referrer || null : null,
        })],
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
    if (!ph) return;
    const url = window.location.origin + pathname + (searchParams.toString() ? `?${searchParams}` : "");
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
    if (!KEY) return;

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
  }, []);

  // DbPageViewTracker always renders (tracks all visitors to local DB)
  if (!KEY) {
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
