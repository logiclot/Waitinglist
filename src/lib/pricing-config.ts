/**
 * Shared pricing constants for Discovery Scan and Custom Project fees.
 *
 * Configurable via environment variables:
 *   NEXT_PUBLIC_DISCOVERY_SCAN_PRICE_CENTS  (default: 5000 = EUR 50)
 *   NEXT_PUBLIC_CUSTOM_PROJECT_PRICE_CENTS  (default: 10000 = EUR 100)
 *
 * Import from here in all server actions, API routes, and UI files
 * instead of re-parsing the env vars locally.
 */

export const DISCOVERY_SCAN_PRICE_CENTS = parseInt(
  process.env.NEXT_PUBLIC_DISCOVERY_SCAN_PRICE_CENTS ?? "5000", 10,
);

export const CUSTOM_PROJECT_PRICE_CENTS = parseInt(
  process.env.NEXT_PUBLIC_CUSTOM_PROJECT_PRICE_CENTS ?? "10000", 10,
);
