import { Suspense } from "react";
import { getPublishedEcosystemsFull } from "@/actions/ecosystems";
import { SuitesPageClient } from "@/components/ecosystems/SuitesPageClient";
import { BRAND_NAME } from "@/lib/branding";
import { LogoMark } from "@/components/LogoMark";
import type { Metadata } from "next";
import type { SuiteCardData } from "@/types";

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

export default async function StacksPage() {
  const ecosystems = (await getPublishedEcosystemsFull()) as unknown as SuiteCardData[];

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="flex justify-center py-20 animate-pulse">
            <LogoMark size={48} />
          </div>
        }
      >
        <SuitesPageClient ecosystems={ecosystems} />
      </Suspense>
    </div>
  );
}
