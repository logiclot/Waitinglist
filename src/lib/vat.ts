/**
 * EU VAT helper – determines VAT treatment for invoices.
 *
 * Rules (simplified for digital/automation services sold B2B):
 *  1. Domestic (seller & buyer same EU country) → charge local VAT.
 *  2. Intra-EU B2B (buyer has valid VAT ID, different EU country) → 0 % reverse charge.
 *  3. Buyer outside EU → 0 % (out of scope).
 *  4. Seller outside EU → no EU VAT applies (out of scope).
 *  5. If buyer is in EU but has no VAT ID → treat as B2C, charge seller-country VAT.
 *     (For MVP we still show 0% with a note since LogicLot is B2B-only.)
 *
 * The platform does NOT collect VAT on behalf of users.
 * This module produces the correct *labels and notes* for the invoice
 * so users can file correctly with their accountant.
 */

// ── EU member states (ISO 3166-1 alpha-2) ──────────────────────────────────
export const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
]);

// ── Standard VAT rates per EU country (2024/2025) ──────────────────────────
const EU_VAT_RATES: Record<string, number> = {
  AT: 20, BE: 21, BG: 20, HR: 25, CY: 19, CZ: 21, DK: 25, EE: 22,
  FI: 25.5, FR: 20, DE: 19, GR: 24, HU: 27, IE: 23, IT: 22, LV: 21,
  LT: 21, LU: 17, MT: 18, NL: 21, PL: 23, PT: 23, RO: 19, SK: 23,
  SI: 22, ES: 21, SE: 25,
};

/** Get standard VAT rate for a country code. Returns 0 for non-EU. */
export function getVatRate(countryCode: string | null | undefined): number {
  if (!countryCode) return 0;
  return EU_VAT_RATES[countryCode.toUpperCase()] ?? 0;
}

/** Check if a country is in the EU */
export function isEU(countryCode: string | null | undefined): boolean {
  if (!countryCode) return false;
  return EU_COUNTRIES.has(countryCode.toUpperCase());
}

// ── VAT regime determination ────────────────────────────────────────────────

export type VatRegime =
  | "domestic"        // Same EU country, charge local VAT
  | "reverse_charge"  // Intra-EU B2B, buyer accounts for VAT
  | "export"          // Buyer outside EU, 0% out of scope
  | "not_applicable"; // Seller outside EU or both non-EU

export interface VatResult {
  regime: VatRegime;
  /** Display rate, e.g. 21 for 21%, 0 for reverse charge/export */
  ratePercent: number;
  /** Text to show on the invoice under totals */
  invoiceNote: string;
  /** Short label for the VAT rate column */
  rateLabel: string;
}

export function determineVat(
  sellerCountry: string | null | undefined,
  buyerCountry: string | null | undefined,
  buyerVatId: string | null | undefined,
): VatResult {
  const sellerCC = sellerCountry?.toUpperCase() ?? "";
  const buyerCC = buyerCountry?.toUpperCase() ?? "";
  const sellerInEU = isEU(sellerCC);
  const buyerInEU = isEU(buyerCC);
  const buyerHasVat = !!buyerVatId && buyerVatId.trim().length > 0;

  // Case 4: Seller not in EU
  if (!sellerInEU) {
    return {
      regime: "not_applicable",
      ratePercent: 0,
      rateLabel: "N/A",
      invoiceNote: "Supplier is not established in the EU. No EU VAT applies.",
    };
  }

  // Case 3: Buyer not in EU
  if (!buyerInEU) {
    return {
      regime: "export",
      ratePercent: 0,
      rateLabel: "0% (export)",
      invoiceNote:
        "Supply of services to a customer outside the EU. VAT not applicable.",
    };
  }

  // Both in EU
  if (sellerCC === buyerCC) {
    // Case 1: Domestic
    const rate = getVatRate(sellerCC);
    return {
      regime: "domestic",
      ratePercent: rate,
      rateLabel: `${rate}%`,
      invoiceNote: `VAT charged at the standard rate of ${rate}% (${sellerCC}).`,
    };
  }

  // Different EU countries
  if (buyerHasVat) {
    // Case 2: Intra-EU B2B reverse charge
    return {
      regime: "reverse_charge",
      ratePercent: 0,
      rateLabel: "0% (RC)",
      invoiceNote:
        "Reverse charge — VAT to be accounted for by the customer pursuant to Article 196 of Directive 2006/112/EC.",
    };
  }

  // Case 5: Intra-EU but buyer has no VAT ID — B2B platform, show advisory
  const rate = getVatRate(sellerCC);
  return {
    regime: "domestic",
    ratePercent: rate,
    rateLabel: `${rate}%*`,
    invoiceNote:
      `Intra-EU supply. No buyer VAT ID provided — seller-country VAT rate of ${rate}% (${sellerCC}) shown. ` +
      `If you are VAT-registered, provide your VAT ID in Settings to enable reverse charge treatment.`,
  };
}

/**
 * Compute VAT amount in cents for a given net amount and rate.
 */
export function computeVatCents(netCents: number, ratePercent: number): number {
  return Math.round(netCents * (ratePercent / 100));
}

/**
 * Get country name from ISO code (for display on invoices).
 */
const COUNTRY_NAMES: Record<string, string> = {
  AT: "Austria", BE: "Belgium", BG: "Bulgaria", HR: "Croatia", CY: "Cyprus",
  CZ: "Czech Republic", DK: "Denmark", EE: "Estonia", FI: "Finland", FR: "France",
  DE: "Germany", GR: "Greece", HU: "Hungary", IE: "Ireland", IT: "Italy",
  LV: "Latvia", LT: "Lithuania", LU: "Luxembourg", MT: "Malta", NL: "Netherlands",
  PL: "Poland", PT: "Portugal", RO: "Romania", SK: "Slovakia", SI: "Slovenia",
  ES: "Spain", SE: "Sweden", GB: "United Kingdom", US: "United States",
  CH: "Switzerland", NO: "Norway", CA: "Canada", AU: "Australia",
};

export function getCountryName(code: string | null | undefined): string {
  if (!code) return "";
  return COUNTRY_NAMES[code.toUpperCase()] ?? code.toUpperCase();
}
