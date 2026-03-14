import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCentsToCurrency } from "@/lib/commission";
import { BRAND_NAME, BRAND_DOMAIN } from "@/lib/branding";
import { determineVat, computeVatCents, getCountryName } from "@/lib/vat";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Shield, CircleDot } from "lucide-react";
import { LogoBrand } from "@/components/LogoBrand";
import { PrintInvoiceButton } from "@/components/invoice/PrintInvoiceButton";

export const metadata = {
  title: `Invoice | ${BRAND_NAME}`,
  description: `View and download your invoice.`,
};

interface NormalizedMilestone {
  title: string;
  description: string;
  priceCents: number;
  status: string;
  fundedAt: string | null;
  releasedAt: string | null;
}

function normalizeMilestones(raw: Record<string, unknown>[]): NormalizedMilestone[] {
  return raw.map((m) => {
    const priceCents =
      typeof (m as { priceCents?: number }).priceCents === "number"
        ? (m as { priceCents: number }).priceCents
        : Math.round(
            (typeof (m as { price?: number }).price === "number"
              ? (m as { price: number }).price
              : 0) * 100,
          );
    return {
      title: String((m as { title?: string }).title ?? "Milestone"),
      description: String((m as { description?: string }).description ?? ""),
      priceCents,
      status: String((m as { status?: string }).status ?? "waiting"),
      fundedAt: ((m as { fundedAt?: string }).fundedAt as string) || null,
      releasedAt: ((m as { releasedAt?: string }).releasedAt as string) || null,
    };
  });
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: "check" | "clock" | "dot" | "shield" }> = {
  released:        { label: "Paid",       color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: "check" },
  in_escrow:       { label: "In Escrow",  color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",      icon: "shield" },
  releasing:       { label: "In Escrow",  color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",      icon: "shield" },
  pending_payment: { label: "Pending",    color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",    icon: "clock" },
  waiting:         { label: "Upcoming",   color: "text-gray-500",    bg: "bg-gray-50 border-gray-200",      icon: "dot" },
  waiting_for_funds: { label: "Awaiting Funding", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: "clock" },
};

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft:       { label: "Draft",            color: "text-gray-700",    bg: "bg-gray-100 border-gray-300" },
  paid_pending_implementation: { label: "Paid", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  in_progress: { label: "In Progress",      color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
  delivered:   { label: "Completed",         color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  approved:    { label: "Completed",         color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  refunded:    { label: "Refunded",          color: "text-red-700",     bg: "bg-red-50 border-red-200" },
  disputed:    { label: "Disputed",          color: "text-orange-700",  bg: "bg-orange-50 border-orange-200" },
};

function StatusIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "check":  return <CheckCircle2 className={className} />;
    case "shield": return <Shield className={className} />;
    case "clock":  return <Clock className={className} />;
    default:       return <CircleDot className={className} />;
  }
}

function formatDate(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateShort(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/sign-in");

  const { orderId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { specialistProfile: true, businessProfile: true },
  });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { include: { businessProfile: true } },
      seller: true,
      solution: true,
    },
  });

  if (!order) notFound();

  const isBuyer = order.buyerId === session.user.id;
  const isSeller = user?.specialistProfile?.id === order.sellerId;
  if (!isBuyer && !isSeller) notFound();

  // ── Data ──────────────────────────────────────────────────
  const milestones = normalizeMilestones(
    (order.milestones as Record<string, unknown>[]) || [],
  );
  const projectTitle = order.solution?.title ?? "Project";
  const orderCategory = order.solution?.category ?? "";

  // Seller (Supplier)
  const sellerName =
    order.seller?.invoiceCompanyName ||
    order.seller?.agencyName ||
    order.seller?.displayName ||
    "Seller";
  const sellerAddress =
    order.seller?.invoiceAddress || "";
  const sellerCountry = order.seller?.country || "";
  const sellerVat = order.seller?.invoiceVatNumber || "";
  const sellerRegNo = order.seller?.businessIdentificationNumber || "";

  // Buyer (Customer)
  const buyerProfile = order.buyer.businessProfile;
  const buyerFirstLast = `${buyerProfile?.firstName || ""} ${buyerProfile?.lastName || ""}`.trim();
  const buyerCompany = buyerProfile?.companyName || "";
  const buyerName = buyerCompany || buyerFirstLast || "Buyer";
  const buyerContactName = buyerCompany && buyerFirstLast ? buyerFirstLast : "";
  const buyerAddress = buyerProfile?.invoiceAddress || "";
  const buyerCountry = buyerProfile?.country || "";
  const buyerVat = buyerProfile?.invoiceVatNumber || "";
  const buyerRegNo = (buyerProfile as Record<string, unknown>)?.invoiceRegistrationNumber as string || "";

  // Invoice meta
  const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`;
  const invoiceDate = order.createdAt;
  const orderStatus = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.draft;

  // ── VAT determination ───────────────────────────────────────
  const vat = determineVat(sellerCountry, buyerCountry, buyerVat);

  // ── Financial calculations ────────────────────────────────
  const subtotalCents = milestones.reduce((s, m) => s + m.priceCents, 0);
  const vatCents = computeVatCents(subtotalCents, vat.ratePercent);
  const totalInclVatCents = subtotalCents + vatCents;

  const paidCents = milestones
    .filter((m) => m.status === "released")
    .reduce((s, m) => s + m.priceCents, 0);
  const escrowCents = milestones
    .filter((m) => ["in_escrow", "releasing"].includes(m.status))
    .reduce((s, m) => s + m.priceCents, 0);
  const remainingCents = subtotalCents - paidCents - escrowCents;

  const completedCount = milestones.filter((m) => m.status === "released").length;
  const progressPercent = subtotalCents > 0 ? Math.round((paidCents / subtotalCents) * 100) : 0;

  // Supply date: first funded → last released (or ongoing)
  const fundedDates = milestones.filter(m => m.fundedAt).map(m => new Date(m.fundedAt!));
  const releasedDates = milestones.filter(m => m.releasedAt).map(m => new Date(m.releasedAt!));
  const supplyStart = fundedDates.length > 0 ? new Date(Math.min(...fundedDates.map(d => d.getTime()))) : null;
  const supplyEnd = releasedDates.length > 0 ? new Date(Math.max(...releasedDates.map(d => d.getTime()))) : null;

  return (
    <div className="min-h-screen bg-[#FBFAF8]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href={isBuyer ? "/business/projects" : "/expert/projects"}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors print:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
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
                {supplyStart && (
                  <MetaRow
                    label="Supply Date"
                    value={
                      supplyEnd && supplyEnd.getTime() !== supplyStart.getTime()
                        ? `${formatDate(supplyStart)} – ${formatDate(supplyEnd)}`
                        : formatDate(supplyStart)
                    }
                  />
                )}
                <MetaRow label="Currency" value="EUR" />
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-28">Status</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${orderStatus.bg} ${orderStatus.color}`}>
                    {orderStatus.label}
                  </span>
                </div>
                <MetaRow label="Payment" value="Paid via LogicLot escrow / Stripe" />
                {order.stripePaymentIntentId && (
                  <MetaRow label="Ref." value={order.stripePaymentIntentId.slice(0, 27)} />
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

          {/* ══════════════ 2 & 3. SUPPLIER / CUSTOMER ══════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Supplier (Expert) */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Supplier (Expert)
              </p>
              <p className="font-semibold text-foreground text-sm">{sellerName}</p>
              {sellerAddress && (
                <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-line">
                  {sellerAddress}
                </p>
              )}
              {sellerCountry && !sellerAddress.toLowerCase().includes(getCountryName(sellerCountry).toLowerCase()) && (
                <p className="text-sm text-muted-foreground mt-0.5">{getCountryName(sellerCountry)}</p>
              )}
              {sellerVat && (
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="text-muted-foreground/70">VAT ID:</span> {sellerVat}
                </p>
              )}
              {sellerRegNo && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  <span className="text-muted-foreground/70">Reg. No.:</span> {sellerRegNo}
                </p>
              )}
              {!sellerVat && (
                <p className="text-xs text-muted-foreground/60 mt-1 italic">VAT ID: N/A</p>
              )}
            </div>

            {/* Customer (Buyer) */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Customer
              </p>
              <p className="font-semibold text-foreground text-sm">{buyerName}</p>
              {buyerContactName && (
                <p className="text-sm text-muted-foreground mt-0.5">{buyerContactName}</p>
              )}
              {buyerAddress && (
                <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-line">
                  {buyerAddress}
                </p>
              )}
              {buyerCountry && !buyerAddress.toLowerCase().includes(getCountryName(buyerCountry).toLowerCase()) && (
                <p className="text-sm text-muted-foreground mt-0.5">{getCountryName(buyerCountry)}</p>
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

          {/* ══════════════ 4. PROJECT INFO ══════════════ */}
          <div className="mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Project
            </p>
            <p className="font-semibold text-foreground">{projectTitle}</p>
            {orderCategory && (
              <p className="text-sm text-muted-foreground mt-0.5">Category: {orderCategory}</p>
            )}
          </div>

          {/* ══════════════ 5. LINE ITEMS (MILESTONES) ══════════════ */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Line Items
            </p>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left py-3 px-4 font-semibold text-foreground text-xs uppercase tracking-wider w-8">
                      #
                    </th>
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
                  {milestones.map((m, i) => {
                    const sc = STATUS_CONFIG[m.status] || STATUS_CONFIG.waiting;
                    const isPaid = m.status === "released";
                    const isEscrow = ["in_escrow", "releasing"].includes(m.status);
                    const lineVat = computeVatCents(m.priceCents, vat.ratePercent);
                    return (
                      <tr
                        key={i}
                        className={`border-t border-border/50 ${
                          !isPaid && !isEscrow ? "opacity-60" : ""
                        }`}
                      >
                        <td className="py-3 px-4 text-muted-foreground font-medium">
                          {i + 1}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-foreground">{m.title}</p>
                          {m.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">
                              {m.description}
                            </p>
                          )}
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border mt-1 ${sc.bg} ${sc.color}`}
                          >
                            <StatusIcon type={sc.icon} className="w-2.5 h-2.5" />
                            {sc.label}
                          </span>
                          {isPaid && m.releasedAt && (
                            <span className="text-[10px] text-emerald-600 ml-2">
                              Released {formatDateShort(m.releasedAt)}
                            </span>
                          )}
                          {isEscrow && m.fundedAt && (
                            <span className="text-[10px] text-blue-600 ml-2">
                              Funded {formatDateShort(m.fundedAt)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-muted-foreground">
                          1
                        </td>
                        <td className="py-3 px-4 text-right font-medium tabular-nums">
                          {formatCentsToCurrency(m.priceCents)}
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-muted-foreground">
                          {vat.rateLabel}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold tabular-nums">
                          {formatCentsToCurrency(m.priceCents + lineVat)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ══════════════ 6. VAT BREAKDOWN & TOTALS ══════════════ */}
          <div className="mb-8">
            <div className="bg-gray-50/80 border border-border rounded-lg p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
                VAT Breakdown & Totals
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Subtotal (excl. VAT) — {milestones.length} milestone{milestones.length !== 1 ? "s" : ""}
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatCentsToCurrency(subtotalCents)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    VAT {vat.rateLabel}
                  </span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatCentsToCurrency(vatCents)}
                  </span>
                </div>

                <div className="h-px bg-border my-2" />

                <div className="flex justify-between text-base">
                  <span className="font-bold text-foreground">
                    Total (incl. VAT)
                  </span>
                  <span className="text-lg font-bold text-foreground tabular-nums">
                    {formatCentsToCurrency(totalInclVatCents)}
                  </span>
                </div>
              </div>

              {/* VAT note */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {vat.invoiceNote}
                </p>
              </div>

              {/* Progress breakdown */}
              <div className="mt-4 pt-3 border-t border-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Paid & Released ({completedCount}/{milestones.length})
                  </span>
                  <span className="font-semibold text-emerald-700 tabular-nums">
                    {formatCentsToCurrency(paidCents)}
                  </span>
                </div>
                {escrowCents > 0 && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5 text-blue-700">
                      <Shield className="w-3.5 h-3.5" />
                      Held in Escrow
                    </span>
                    <span className="font-semibold text-blue-700 tabular-nums">
                      {formatCentsToCurrency(escrowCents)}
                    </span>
                  </div>
                )}
                {remainingCents > 0 && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      Remaining (unfunded)
                    </span>
                    <span className="font-medium text-muted-foreground tabular-nums">
                      {formatCentsToCurrency(remainingCents)}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {milestones.length > 1 && (
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Project progress</span>
                    <span>{progressPercent}% paid</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Amount charged this invoice */}
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">
                    Amount Charged (this invoice)
                  </span>
                  <span className="text-lg font-bold text-foreground tabular-nums">
                    {formatCentsToCurrency(order.priceCents)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Charged to your payment method via Stripe. Covers Milestone 1 only.
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════ 7. MARKETPLACE & ESCROW TERMS ══════════════ */}
          <div className="mb-8 bg-blue-50/50 border border-blue-100 rounded-lg p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-800/70 mb-3">
              Marketplace & Payment Terms
            </p>
            <div className="space-y-2 text-xs text-blue-900/70 leading-relaxed">
              <p>
                All payments are processed securely through {BRAND_NAME} via Stripe and held in escrow until
                the buyer approves each milestone. Funds are released to the expert only after explicit approval.
              </p>
              <p>
                {BRAND_NAME} operates as an intermediary marketplace connecting buyers and experts. The expert
                (supplier) named above is the provider of the services described in this invoice.
              </p>
              <p>
                If a dispute arises, {BRAND_NAME} will mediate and may issue a full or partial refund at its
                discretion, in accordance with our{" "}
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
                  </a>
                  . A mutual NDA applies to all project communications.
                </p>
                <p>
                  For billing questions, contact{" "}
                  <a href="mailto:contact@logiclot.io" className="text-primary underline underline-offset-2">
                    contact@logiclot.io
                  </a>
                  . Any disputes regarding this invoice must be submitted within 7 business days of receipt.
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
            href={isBuyer ? "/business/projects" : "/expert/projects"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border font-medium hover:bg-secondary transition-all"
          >
            Back to Projects
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
