/**
 * Country name → ISO 3166-1 alpha-2 code mapping for Stripe Connect.
 *
 * Stripe Express accounts are supported in specific countries.
 * This map converts the display names used in expert onboarding
 * to the ISO codes Stripe requires for account creation.
 *
 * Source: https://docs.stripe.com/connect/express-accounts#supported-countries
 */

export const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  // ── North America ──
  "Canada": "CA",
  "United States": "US",
  "Mexico": "MX",

  // ── Europe ──
  "Austria": "AT",
  "Belgium": "BE",
  "Bulgaria": "BG",
  "Croatia": "HR",
  "Cyprus": "CY",
  "Czech Republic": "CZ",
  "Denmark": "DK",
  "Estonia": "EE",
  "Finland": "FI",
  "France": "FR",
  "Germany": "DE",
  "Greece": "GR",
  "Hungary": "HU",
  "Ireland": "IE",
  "Italy": "IT",
  "Latvia": "LV",
  "Liechtenstein": "LI",
  "Lithuania": "LT",
  "Luxembourg": "LU",
  "Malta": "MT",
  "Netherlands": "NL",
  "Norway": "NO",
  "Poland": "PL",
  "Portugal": "PT",
  "Romania": "RO",
  "Slovakia": "SK",
  "Slovenia": "SI",
  "Spain": "ES",
  "Sweden": "SE",
  "Switzerland": "CH",
  "United Kingdom": "GB",

  // ── Asia Pacific ──
  "Australia": "AU",
  "Hong Kong": "HK",
  "Japan": "JP",
  "New Zealand": "NZ",
  "Singapore": "SG",
  "Thailand": "TH",

  // ── South America ──
  "Brazil": "BR",

  // ── Middle East & Africa ──
  "United Arab Emirates": "AE",

  // ── Important Note on India (IN) ──
  // India is currently invite-only for new Stripe accounts (as of 2024-2026).
  // Platforms must request access to onboard Indian Express accounts.
  // We include it here, but it may still fail if the platform is not approved.
  "India": "IN",
};

/**
 * Resolve a country value (display name or ISO code) to an ISO 3166-1 alpha-2 code.
 *
 * Returns `null` if the country cannot be resolved — callers should
 * treat this as an error rather than defaulting to a wrong country.
 */
export function resolveStripeCountryCode(country: string): string | null {
  if (!country) return null;

  const trimmed = country.trim();

  // Already a 2-letter ISO code?
  if (/^[A-Z]{2}$/.test(trimmed)) return trimmed;

  // Look up from display name
  return COUNTRY_NAME_TO_ISO[trimmed] ?? null;
}
