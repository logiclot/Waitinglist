import { Suspense } from "react";
import { BRAND_NAME, BRAND_DOMAIN, DEFAULT_OG_IMAGE } from "@/lib/branding";
const BASE_URL = `https://${BRAND_DOMAIN}`;
import { SolutionsPageClient } from "@/components/solutions/SolutionsPageClient";
import { SolutionsPageSkeleton } from "@/components/solutions/SolutionsPageSkeleton";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Browse AI Solutions | ${BRAND_NAME}`,
  description:
    "Find productized AI automations for your business. Discovery Scans, Custom Projects, and ready-made solutions built by verified experts.",
  openGraph: {
    title: `Browse AI Solutions | ${BRAND_NAME}`,
    description:
      "Find productized AI automations for your business. Ready-made solutions built by verified experts.",
    url: `${BASE_URL}/solutions`,
    siteName: BRAND_NAME,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `Browse AI Solutions | ${BRAND_NAME}`,
    description:
      "Find productized AI automations for your business. Ready-made solutions built by verified experts.",
    images: [DEFAULT_OG_IMAGE.url],
  },
  alternates: { canonical: `${BASE_URL}/solutions` },
  keywords: [
    "AI solutions",
    "buy automation",
    "AI automation marketplace",
    "business automation solutions",
    "productized automation",
  ],
};


export default function SolutionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<SolutionsPageSkeleton />}>
        <SolutionsPageClient />
      </Suspense>
    </div>
  );
}
