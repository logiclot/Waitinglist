import { HowItWorks } from "@/components/marketing/HowItWorks";
import { BRAND_NAME } from "@/lib/branding";

export const metadata = {
  title: `How It Works | ${BRAND_NAME}`,
  description: "See how to buy ready-made automations or post a request on LogicLot — step by step.",
};

export default function HowItWorksPage() {
  return (
    <div className="pt-12">
      <HowItWorks />
    </div>
  );
}
