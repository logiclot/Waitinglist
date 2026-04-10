import { AuditAnalytics } from "@/components/admin/AuditAnalytics";
import { BRAND_NAME } from "@/lib/branding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Audit Analytics | ${BRAND_NAME}`,
};

export default function AuditAnalyticsPage() {
  return <AuditAnalytics />;
}
