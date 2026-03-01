import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Privacy Policy | ${BRAND_NAME}`,
  description: `Privacy Policy for ${BRAND_NAME} — how we collect, use, and protect your data.`,
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-neutral dark:prose-invert">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: 18 February 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Who we are</h2>
        <p className="text-muted-foreground leading-relaxed">
          {BRAND_NAME} (&quot;we&quot;, &quot;our&quot;) operates the {BRAND_NAME} platform at {BRAND_DOMAIN}.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Data we collect</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          We collect:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li>Account data — email, name, company details (businesses), profile info (experts)</li>
          <li>Project data — briefs, proposals, messages, payments</li>
          <li>Usage data — pages visited, actions taken (for analytics and support)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. How we use it</h2>
        <p className="text-muted-foreground leading-relaxed">
          We use your data to operate the marketplace, process payments, send transactional and product emails, improve the platform, and comply with legal obligations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Sharing</h2>
        <p className="text-muted-foreground leading-relaxed">
          We share data with payment processors (Stripe), email providers (Resend), and hosting/analytics providers. We do not sell your data. Project participants see each other&apos;s relevant profile and communication data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Your rights (GDPR)</h2>
        <p className="text-muted-foreground leading-relaxed">
          You have the right to access, correct, delete, or export your data. Contact us at <a href="mailto:privacy@logiclot.io" className="text-primary hover:underline">privacy@logiclot.io</a>. You may also lodge a complaint with your data protection authority.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          Privacy inquiries: <a href="mailto:privacy@logiclot.io" className="text-primary hover:underline">privacy@logiclot.io</a>
        </p>
      </section>
    </div>
  );
}
