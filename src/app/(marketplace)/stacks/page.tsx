import { SuitesPageClient } from "@/components/ecosystems/SuitesPageClient";
import { BRAND_NAME } from "@/lib/branding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Solution Suites | ${BRAND_NAME}`,
  description:
    "Curated suites of automation solutions that work better together. One team, one project, full results.",
  openGraph: {
    title: `Solution Suites | ${BRAND_NAME}`,
    description:
      "Curated suites of automation solutions that work better together.",
  },
};

export default function StacksPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SuitesPageClient />
    </div>
  );
}
