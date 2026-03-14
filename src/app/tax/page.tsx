import { BRAND_NAME } from "@/lib/branding";
import Link from "next/link";

export const metadata = {
  title: `Tax & Legal | ${BRAND_NAME}`,
  description: `Tax and legal information for ${BRAND_NAME} — platform role, escrow, and buyer/seller tax responsibility.`,
};

export default function TaxPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Tax & Legal</h1>
      <p className="text-muted-foreground text-sm mb-8">For businesses and experts using {BRAND_NAME}</p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Platform Role</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          {BRAND_NAME} operates as an intermediary marketplace. We connect buyers with automation experts and facilitate payments via Stripe. We do not sell services directly; experts are the providers of the automation work.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Funds paid by buyers are held in escrow until the buyer approves the work. At that point, funds are transferred to the expert&apos;s connected Stripe account, minus our platform commission. We never take possession of project funds beyond the facilitation period.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Tax Responsibility</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">Buyers</strong> are responsible for their own tax obligations related to purchases, including any VAT, GST, or sales tax that may apply in their jurisdiction. If you are a business and can recover VAT, you should obtain a valid invoice from the expert (see our <Link href="/docs/invoicing" className="text-primary hover:underline">invoice system</Link>).
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          <strong className="text-foreground">Experts (sellers)</strong> are responsible for their own income tax, VAT, and any other tax obligations on the fees they receive. Experts operate as independent providers. If you are VAT-registered, you may need to issue invoices and comply with local VAT rules in your country and in your buyers&apos; countries (e.g. EU OSS, reverse charge).
        </p>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground">{BRAND_NAME}</strong> is responsible for tax on the platform fees (commission) we collect. We do not assume tax obligations that belong to buyers or experts.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">International Sales</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          When a buyer and expert are in different countries, additional rules may apply (e.g. EU B2B reverse charge, place-of-supply rules for digital/services). These are matters between the buyer and the expert. The platform facilitates the transaction but does not determine or collect VAT/GST on project payments.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          We recommend that both buyers and experts consult a tax professional in their jurisdiction for advice on cross-border transactions.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Escrow and Tax</h2>
        <p className="text-muted-foreground leading-relaxed">
          Holding funds in escrow does not change who the economic seller is. The expert provides the service; the expert receives the payment. Our role is to hold funds until the buyer approves, then transfer to the expert. Tax obligations flow from that economic reality.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Disclaimer</h2>
        <p className="text-muted-foreground leading-relaxed">
          This page is for informational purposes only and does not constitute tax or legal advice. Tax rules vary by country and change over time. You should consult a qualified tax adviser or lawyer for your specific situation.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Related</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li><Link href="/terms" className="text-primary hover:underline">Terms of Service</Link></li>
          <li><Link href="/pricing" className="text-primary hover:underline">Pricing & Fees</Link></li>
          <li><Link href="/docs/how-escrow-works" className="text-primary hover:underline">How Escrow Works</Link></li>
          <li><Link href="mailto:contact@logiclot.io" className="text-primary hover:underline">contact@logiclot.io</Link></li>
        </ul>
      </section>
    </div>
  );
}
