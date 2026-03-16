import { HowItWorks } from "@/components/marketing/HowItWorks";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";
const BASE_URL = `https://${BRAND_DOMAIN}`;

export const metadata = {
  title: `How It Works | ${BRAND_NAME}`,
  description: "See how to buy ready-made automations or post a request on LogicLot. Step by step, from browsing to delivery, with escrow-protected payments.",
  openGraph: {
    title: `How It Works | ${BRAND_NAME}`,
    description: "Buy ready-made automations or post a request. Step by step, from browsing to delivery.",
    url: `${BASE_URL}/how-it-works`,
    siteName: BRAND_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `How It Works | ${BRAND_NAME}`,
    description: "Buy ready-made automations or post a request. Step by step, from browsing to delivery.",
  },
  alternates: { canonical: `${BASE_URL}/how-it-works` },
  keywords: ["how LogicLot works", "buy automation online", "automation marketplace process", "escrow payments automation"],
};

export default function HowItWorksPage() {
  return (
    <div className="pt-12">
      <HowItWorks />
      <p className="text-xs text-muted-foreground/50 text-center mt-12">Last updated: March 2026</p>
    </div>
  );
}
