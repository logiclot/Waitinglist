/**
 * Cookie consent helpers — shared between CookieConsent UI and analytics providers.
 */

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

const STORAGE_KEY = "cookie-consent";

/** Read consent from localStorage (returns null if not yet decided). */
export function getConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentPreferences;
  } catch {
    return null;
  }
}

/** Check whether analytics tracking is allowed. */
export function hasAnalyticsConsent(): boolean {
  const consent = getConsent();
  return consent?.analytics === true;
}

/** Custom event name dispatched when consent changes. */
export const CONSENT_CHANGED_EVENT = "cookie-consent-changed";
