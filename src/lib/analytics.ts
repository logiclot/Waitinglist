/**
 * Analytics helpers.
 *
 * Client-side tracking:  Use the `useAnalytics()` hook or `posthog` from posthog-js/react.
 * Server-side tracking:  Call `trackServer(event, properties, userId)` from server actions
 *                        and API routes (e.g. Stripe webhook, checkout completion).
 *
 * Environment variables required:
 *   NEXT_PUBLIC_POSTHOG_KEY   — PostHog project API key (e.g. phc_...)
 *   NEXT_PUBLIC_POSTHOG_HOST  — defaults to https://eu.i.posthog.com  (EU region)
 *                               Use https://us.i.posthog.com for US region
 */

import { PostHog } from "posthog-node";

let _serverClient: PostHog | null = null;

function getServerClient(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return null;

  if (!_serverClient) {
    _serverClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      // Flush immediately in serverless (each request is its own process)
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _serverClient;
}

/**
 * Track an event from server-side code (API routes, server actions, webhooks).
 * Safe to call even if PostHog is not configured — it's a no-op.
 */
export function trackServer(
  event: string,
  properties?: Record<string, unknown>,
  userId?: string
): void {
  const client = getServerClient();
  if (!client) return;

  const distinctId = userId ?? "server";
  client.capture({ distinctId, event, properties: { ...properties, $lib: "posthog-node" } });
}

// ── Typed event helpers ────────────────────────────────────────────────────────
// Call these from the relevant server actions / API routes.

export const Analytics = {
  checkoutStarted: (userId: string, props: { solutionId: string; type: string; priceCents: number }) =>
    trackServer("checkout_initiated", props, userId),

  checkoutCompleted: (userId: string, props: { solutionId: string; type: string; priceCents: number; orderId: string }) =>
    trackServer("checkout_completed", props, userId),

  demoBooked: (userId: string, props: { solutionId: string; expertId: string }) =>
    trackServer("demo_booked", props, userId),

  milestoneReleased: (userId: string, props: { orderId: string; priceCents: number }) =>
    trackServer("milestone_released", props, userId),

  solutionPublished: (expertId: string, props: { solutionId: string; category: string; title: string }) =>
    trackServer("solution_published", props, expertId),

  onboardingCompleted: (userId: string, props: { role: string }) =>
    trackServer("onboarding_completed", props, userId),

  signedUp: (userId: string, props: { hasReferral: boolean }) =>
    trackServer("sign_up_completed", props, userId),
};
