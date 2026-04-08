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
  // ── A ──
  "Afghanistan": "AF",
  "Albania": "AL",
  "Algeria": "DZ",
  "Andorra": "AD",
  "Angola": "AO",
  "Antigua and Barbuda": "AG",
  "Argentina": "AR",
  "Armenia": "AM",
  "Australia": "AU",
  "Austria": "AT",
  "Azerbaijan": "AZ",
  // ── B ──
  "Bahamas": "BS",
  "Bahrain": "BH",
  "Bangladesh": "BD",
  "Barbados": "BB",
  "Belarus": "BY",
  "Belgium": "BE",
  "Belize": "BZ",
  "Benin": "BJ",
  "Bhutan": "BT",
  "Bolivia": "BO",
  "Bosnia and Herzegovina": "BA",
  "Botswana": "BW",
  "Brazil": "BR",
  "Brunei": "BN",
  "Bulgaria": "BG",
  "Burkina Faso": "BF",
  "Burundi": "BI",
  // ── C ──
  "Cabo Verde": "CV",
  "Cambodia": "KH",
  "Cameroon": "CM",
  "Canada": "CA",
  "Central African Republic": "CF",
  "Chad": "TD",
  "Chile": "CL",
  "China": "CN",
  "Colombia": "CO",
  "Comoros": "KM",
  "Congo (Brazzaville)": "CG",
  "Congo (Kinshasa)": "CD",
  "Costa Rica": "CR",
  "Croatia": "HR",
  "Cuba": "CU",
  "Cyprus": "CY",
  "Czech Republic": "CZ",
  // ── D ──
  "Denmark": "DK",
  "Djibouti": "DJ",
  "Dominica": "DM",
  "Dominican Republic": "DO",
  // ── E ──
  "Ecuador": "EC",
  "Egypt": "EG",
  "El Salvador": "SV",
  "Equatorial Guinea": "GQ",
  "Eritrea": "ER",
  "Estonia": "EE",
  "Eswatini": "SZ",
  "Ethiopia": "ET",
  // ── F ──
  "Fiji": "FJ",
  "Finland": "FI",
  "France": "FR",
  // ── G ──
  "Gabon": "GA",
  "Gambia": "GM",
  "Georgia": "GE",
  "Germany": "DE",
  "Ghana": "GH",
  "Greece": "GR",
  "Grenada": "GD",
  "Guatemala": "GT",
  "Guinea": "GN",
  "Guinea-Bissau": "GW",
  "Guyana": "GY",
  // ── H ──
  "Haiti": "HT",
  "Honduras": "HN",
  "Hungary": "HU",
  // ── I ──
  "Iceland": "IS",
  "India": "IN",
  "Indonesia": "ID",
  "Iran": "IR",
  "Iraq": "IQ",
  "Ireland": "IE",
  "Israel": "IL",
  "Italy": "IT",
  // ── J ──
  "Jamaica": "JM",
  "Japan": "JP",
  "Jordan": "JO",
  // ── K ──
  "Kazakhstan": "KZ",
  "Kenya": "KE",
  "Kiribati": "KI",
  "Kuwait": "KW",
  "Kyrgyzstan": "KG",
  // ── L ──
  "Laos": "LA",
  "Latvia": "LV",
  "Lebanon": "LB",
  "Lesotho": "LS",
  "Liberia": "LR",
  "Libya": "LY",
  "Liechtenstein": "LI",
  "Lithuania": "LT",
  "Luxembourg": "LU",
  // ── M ──
  "Madagascar": "MG",
  "Malawi": "MW",
  "Malaysia": "MY",
  "Maldives": "MV",
  "Mali": "ML",
  "Malta": "MT",
  "Marshall Islands": "MH",
  "Mauritania": "MR",
  "Mauritius": "MU",
  "Mexico": "MX",
  "Micronesia": "FM",
  "Moldova": "MD",
  "Monaco": "MC",
  "Mongolia": "MN",
  "Montenegro": "ME",
  "Morocco": "MA",
  "Mozambique": "MZ",
  "Myanmar": "MM",
  // ── N ──
  "Namibia": "NA",
  "Nauru": "NR",
  "Nepal": "NP",
  "Netherlands": "NL",
  "New Zealand": "NZ",
  "Nicaragua": "NI",
  "Niger": "NE",
  "Nigeria": "NG",
  "North Korea": "KP",
  "North Macedonia": "MK",
  "Norway": "NO",
  // ── O ──
  "Oman": "OM",
  // ── P ──
  "Pakistan": "PK",
  "Palau": "PW",
  "Palestine": "PS",
  "Panama": "PA",
  "Papua New Guinea": "PG",
  "Paraguay": "PY",
  "Peru": "PE",
  "Philippines": "PH",
  "Poland": "PL",
  "Portugal": "PT",
  // ── Q ──
  "Qatar": "QA",
  // ── R ──
  "Romania": "RO",
  "Russia": "RU",
  "Rwanda": "RW",
  // ── S ──
  "Saint Kitts and Nevis": "KN",
  "Saint Lucia": "LC",
  "Saint Vincent and the Grenadines": "VC",
  "Samoa": "WS",
  "San Marino": "SM",
  "Sao Tome and Principe": "ST",
  "Saudi Arabia": "SA",
  "Senegal": "SN",
  "Serbia": "RS",
  "Seychelles": "SC",
  "Sierra Leone": "SL",
  "Singapore": "SG",
  "Slovakia": "SK",
  "Slovenia": "SI",
  "Solomon Islands": "SB",
  "Somalia": "SO",
  "South Africa": "ZA",
  "South Korea": "KR",
  "South Sudan": "SS",
  "Spain": "ES",
  "Sri Lanka": "LK",
  "Sudan": "SD",
  "Suriname": "SR",
  "Sweden": "SE",
  "Switzerland": "CH",
  "Syria": "SY",
  // ── T ──
  "Taiwan": "TW",
  "Tajikistan": "TJ",
  "Tanzania": "TZ",



  "Thailand": "TH",
  "Timor-Leste": "TL",
  "Togo": "TG",
  "Tonga": "TO",
  "Trinidad and Tobago": "TT",
  "Tunisia": "TN",
  "Turkey": "TR",
  "Turkmenistan": "TM",
  "Tuvalu": "TV",
  // ── U ──
  "Uganda": "UG",
  "Ukraine": "UA",
  "United Arab Emirates": "AE",
  "United Kingdom": "GB",
  "United States": "US",
  "Uruguay": "UY",
  "Uzbekistan": "UZ",
  // ── V ──
  "Vanuatu": "VU",
  "Vatican City": "VA",
  "Venezuela": "VE",
  "Vietnam": "VN",
  // ── Y ──
  "Yemen": "YE",
  // ── Z ──
  "Zambia": "ZM",
  "Zimbabwe": "ZW",
};


/**
 * Countries where Stripe Connect Express accounts are available.
 * Source: https://docs.stripe.com/connect/express-accounts#supported-countries
 *
 * Experts from countries NOT in this set must be paid manually (wire/Wise).
 */
export const STRIPE_CONNECT_SUPPORTED_COUNTRIES = new Set([
  "Australia", "Austria", "Belgium", "Brazil", "Bulgaria", "Canada",
  "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland",
  "France", "Germany", "Greece", "Hong Kong", "Hungary", "Ireland",
  "Italy", "Japan", "Latvia", "Lithuania", "Luxembourg", "Malta",
  "Mexico", "Netherlands", "New Zealand", "Norway", "Poland", "Portugal",
  "Romania", "Singapore", "Slovakia", "Slovenia", "Spain", "Sweden",
  "Switzerland", "Thailand", "United Kingdom", "United States",
]);

/**
 * Returns true if the expert's country supports Stripe Connect Express.
 * Accepts display name (e.g. "Ukraine") or ISO code (e.g. "UA").
 */
export function isStripeConnectSupported(country: string): boolean {
  if (!country) return false;
  const trimmed = country.trim();

  // Check display name directly
  if (STRIPE_CONNECT_SUPPORTED_COUNTRIES.has(trimmed)) return true;

  // If it's an ISO code, reverse-lookup the display name
  if (/^[A-Z]{2}$/.test(trimmed)) {
    for (const [name, iso] of Object.entries(COUNTRY_NAME_TO_ISO)) {
      if (iso === trimmed) return STRIPE_CONNECT_SUPPORTED_COUNTRIES.has(name);
    }
  }

  return false;
}

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
