import { HowItWorks } from "@/components/marketing/HowItWorks";
import { BRAND_NAME } from "@/lib/branding";

export const metadata = {
  title: `How It Works | ${BRAND_NAME}`,
  description: "Learn how to buy and sell AI automations.",
};

export default function HowItWorksPage() {
  return (
    <div className="pt-12">
      <HowItWorks />
    </div>
  );
}
