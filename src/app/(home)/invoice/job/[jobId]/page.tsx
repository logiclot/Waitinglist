import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCentsToCurrency } from "@/lib/commission";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";
import { DISCOVERY_SCAN_PRICE_CENTS, CUSTOM_PROJECT_PRICE_CENTS } from "@/lib/pricing-config";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import { LogoBrand } from "@/components/LogoBrand";
import { PrintInvoiceButton } from "@/components/invoice/PrintInvoiceButton";

export const metadata = {
  title: `Posting Fee Invoice | ${BRAND_NAME}`,
  description: "View and download your posting fee invoice.",
};

function formatDate(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function getJobPriceCents(category: string): number {
  if (category === "Discovery Scan" || category === "Discovery") {
    return DISCOVERY_SCAN_PRICE_CENTS;
  }
  return CUSTOM_PROJECT_PRICE_CENTS;
}

function getLineItemLabel(category: string): string {
  if (category === "Discovery Scan" || category === "Discovery") {
    return "Discovery Scan — Posting Fee";
  }
  return "Custom Project — Posting Fee";
}

export default async function JobInvoicePage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/sign-in");

  const { jobId } = await params;

  const job = await prisma.jobPost.findUnique({
    where: { id: jobId },
    include: {
      buyer: {
        include: { businessProfile: true },
      },
    },
  });

  if (!job) notFound();
  if (job.buyerId !== session.user.id) notFound();
  if (!job.paidAt) notFound();

  // ── Data ──────────────────────────────────────────────────
  const invoiceNumber = `INV-${job.id.slice(0, 8).toUpperCase()}`;
  const invoiceDate = job.paidAt;
  const priceCents = getJobPriceCents(job.category);
  const lineItemLabel = getLineItemLabel(job.category);

  // Buyer
  const profile = job.buyer.businessProfile;
  const buyerFirstLast = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
  const buyerCompany = profile?.companyName || "";
  const buyerName = buyerCompany || buyerFirstLast || "Buyer";
  const buyerContactName = buyerCompany && buyerFirstLast ? buyerFirstLast : "";
  const buyerAddress = profile?.invoiceAddress || "";
  const buyerCountry = profile?.country || "";
  const buyerVat = profile?.invoiceVatNumber || "";
  const buyerRegNo = (profile as Record<string, unknown>)?.invoiceRegistrationNumber as string || "";

  // Job posting fees are a platform service — LogicLot is the supplier
  // For now, VAT note is informational since platform VAT registration is pending
  const vatNote = "Platform service fee. VAT treatment depends on your jurisdiction. Consult your tax adviser.";

  return (
    <div className="min-h-screen bg-[#FBFAF8]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors print:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>

        {/* ── Invoice container ── */}
        <div
          id="invoice"
          className="bg-white border border-border rounded-xl shadow-lg p-8 md:p-12"
          style={{ printColorAdjust: "exact" }}
        >
          {/* ══════════════ 1. HEADER ══════════════ */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                INVOICE
              </h1>
              <div className="mt-3 space-y-1">
                <MetaRow label="Invoice No." value={invoiceNumber} />
                <MetaRow label="Issue Date" value={formatDate(invoiceDate)} />
                <MetaRow label="Supply Date" value={formatDate(invoiceDate)} />
                <MetaRow label="Currency" value="EUR" />
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-28">Status</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3" /> Paid
                  </span>
                </div>
                <MetaRow label="Type" value={
                  job.category === "Discovery Scan" || job.category === "Discovery"
                    ? "Discovery Scan"
                    : "Custom Project"
                } />
                <MetaRow label="Payment" value="Paid via Stripe" />
                {job.paymentIntentId && (
                  <MetaRow label="Ref." value={job.paymentIntentId.slice(0, 27)} />
                )}
              </div>
            </div>
            <div className="text-right">
              <LogoBrand size="sm" />
              <p className="text-xs text-muted-foreground mt-1">Automation Marketplace</p>
              <p className="text-xs text-muted-foreground">{BRAND_DOMAIN}</p>
            </div>
          </div>

          <div className="h-px bg-border mb-8" />

          {/* ══════════════ 2 & 3. FROM / BILL TO ══════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Supplier (Platform)
              </p>
              <p className="font-semibold text-foreground text-sm">{BRAND_NAME}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{BRAND_DOMAIN}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Customer
              </p>
              <p className="font-semibold text-foreground text-sm">{buyerName}</p>
              {buyerContactName && (
                <p className="text-sm text-muted-foreground mt-0.5">{buyerContactName}</p>
              )}
              {buyerAddress && (
                <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-line">{buyerAddress}</p>
              )}
              {buyerCountry && (
                <p className="text-sm text-muted-foreground mt-0.5">{buyerCountry}</p>
              )}
              {buyerVat && (
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="text-muted-foreground/70">VAT ID:</span> {buyerVat}
                </p>
              )}
              {buyerRegNo && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  <span className="text-muted-foreground/70">Reg. No.:</span> {buyerRegNo}
                </p>
              )}
            </div>
          </div>

          <div className="h-px bg-border mb-8" />

          {/* ══════════════ 4. JOB POST INFO ══════════════ */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Job Post
            </p>
            <p className="font-semibold text-foreground">{job.title}</p>
            <p className="text-sm text-muted-foreground mt-0.5">Category: {job.category}</p>
          </div>

          {/* ══════════════ 5. LINE ITEMS ══════════════ */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Line Items
            </p>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left py-3 px-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                      Description
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground text-xs uppercase tracking-wider w-16">
                      Qty
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-foreground text-xs uppercase tracking-wider w-20">
                      VAT
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border/50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{lineItemLabel}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Paid to post &quot;{job.title}&quot; to the expert network
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700 mt-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Paid
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-muted-foreground">
                      1
                    </td>
                    <td className="py-3 px-4 text-right font-medium tabular-nums">
                      {formatCentsToCurrency(priceCents)}
                    </td>
                    <td className="py-3 px-4 text-center text-xs text-muted-foreground">
                      —
                    </td>
                    <td className="py-3 px-4 text-right font-semibold tabular-nums">
                      {formatCentsToCurrency(priceCents)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ══════════════ 6. TOTALS ══════════════ */}
          <div className="mb-8">
            <div className="bg-gray-50/80 border border-border rounded-lg p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatCentsToCurrency(priceCents)}
                  </span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Total Charged</span>
                  <span className="text-lg font-bold text-foreground tabular-nums">
                    {formatCentsToCurrency(priceCents)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                {vatNote}
              </p>
              <p className="text-[11px] text-muted-foreground mt-2">
                Charged to your payment method via Stripe.
                {job.paymentIntentId && (
                  <> Payment reference: {job.paymentIntentId.slice(0, 20)}…</>
                )}
              </p>
            </div>
          </div>

          {/* ══════════════ 7. PAYMENT TERMS ══════════════ */}
          <div className="mb-8 bg-blue-50/50 border border-blue-100 rounded-lg p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-800/70 mb-3">
              Payment Terms
            </p>
            <div className="space-y-2 text-xs text-blue-900/70 leading-relaxed">
              <p>
                This is a one-time posting fee charged by {BRAND_NAME} to publish your request to the expert network.
                It covers expert matching, proposal collection, and platform support.
              </p>
              <p>
                This fee is separate from any project implementation costs agreed between you and the expert.
                For details, refer to our{" "}
                <a href={`https://${BRAND_DOMAIN}/terms`} className="text-blue-700 underline underline-offset-2">
                  Terms of Service
                </a>.
              </p>
            </div>
          </div>

          {/* ══════════════ 8. FOOTER / LEGAL ══════════════ */}
          <div className="border-t border-border pt-6 space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1.5">
                <p>
                  This invoice was automatically generated by {BRAND_NAME} and is valid without signature.
                </p>
                <p>
                  This transaction is subject to the{" "}
                  <a href={`https://${BRAND_DOMAIN}/terms`} className="text-primary underline underline-offset-2">
                    {BRAND_NAME} Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href={`https://${BRAND_DOMAIN}/privacy`} className="text-primary underline underline-offset-2">
                    Privacy Policy
                  </a>.
                </p>
                <p>
                  For billing questions, contact{" "}
                  <a href="mailto:contact@logiclot.io" className="text-primary underline underline-offset-2">
                    contact@logiclot.io
                  </a>.
                  Any disputes regarding this invoice must be submitted within 7 business days of receipt.
                </p>
              </div>
            </div>

            <p className="text-center text-[11px] text-muted-foreground/60 pt-3">
              Thank you for your business.
            </p>
          </div>
        </div>

        {/* ── Action buttons (hidden on print) ── */}
        <div className="mt-8 flex flex-wrap gap-4 print:hidden">
          <PrintInvoiceButton />
          <Link
            href="/dashboard/invoices"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border font-medium hover:bg-secondary transition-all"
          >
            Back to Invoices
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Small helper for metadata rows in the header */
function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
