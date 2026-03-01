/**
 * Canonical application URL used for constructing absolute links
 * (Stripe success/cancel URLs, email CTAs, API redirects, etc.).
 *
 * Set via NEXT_PUBLIC_APP_URL in your environment.
 * Falls back to the production domain when not set.
 *
 * Import this constant instead of reading the env var inline
 * to keep the fallback value consistent across the codebase.
 */

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://logiclot.io";
