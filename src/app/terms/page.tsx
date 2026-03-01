import { BRAND_NAME } from "@/lib/branding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Terms of Service | ${BRAND_NAME}`,
  description: `Terms of Service for ${BRAND_NAME} — automation marketplace for businesses and experts.`,
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-neutral dark:prose-invert">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground text-sm mb-8">Last updated: 18 February 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Agreement</h2>
        <p className="text-muted-foreground leading-relaxed">
          By using {BRAND_NAME} (&quot;the Platform&quot;), you agree to these Terms of Service. If you do not agree, do not use the Platform.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Services</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          {BRAND_NAME} is a marketplace connecting businesses with automation experts. Services include:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li>Discovery Scans — expert-led assessments of automation opportunities</li>
          <li>Custom Projects — bespoke automation implementation</li>
          <li>Ready-made Solutions — pre-built automations</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Fees & Payments</h2>
        <p className="text-muted-foreground leading-relaxed">
          Posting fees (e.g. €50 for Discovery Scans, €100 for Custom Projects) are one-time and non-refundable except where required by law or as stated in our refund policy. Project payments are held in escrow and released per milestone upon approval.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Mutual NDA</h2>
        <p className="text-muted-foreground leading-relaxed">
          By participating in a project, both parties agree to keep confidential all shared business data and logic. Our Platform NDA applies to all project communications.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
        <p className="text-muted-foreground leading-relaxed">
          {BRAND_NAME} acts as an intermediary. We are not liable for the quality of work delivered by experts or for disputes between buyers and experts beyond our platform escrow and dispute-resolution processes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          For questions: <a href="mailto:legal@logiclot.io" className="text-primary hover:underline">legal@logiclot.io</a>
        </p>
      </section>
    </div>
  );
}
