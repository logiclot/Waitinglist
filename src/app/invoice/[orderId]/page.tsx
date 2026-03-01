import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCentsToCurrency } from "@/lib/commission";
import { BRAND_NAME } from "@/lib/branding";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { LogoBrand } from "@/components/LogoBrand";
import { PrintInvoiceButton } from "@/components/invoice/PrintInvoiceButton";

export const metadata = {
  title: `Invoice | ${BRAND_NAME}`,
  description: `View and download your invoice.`,
};

function normalizeMilestones(raw: Record<string, unknown>[]) {
  return raw.map((m) => {
    const priceCents = typeof (m as { priceCents?: number }).priceCents === "number"
      ? (m as { priceCents: number }).priceCents
      : Math.round((typeof (m as { price?: number }).price === "number" ? (m as { price: number }).price : 0) * 100);
    return {
      title: String((m as { title?: string }).title ?? "Milestone"),
      description: String((m as { description?: string }).description ?? ""),
      priceCents,
    };
  });
}

export default async function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
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

  const milestones = normalizeMilestones((order.milestones as Record<string, unknown>[]) || []);
  const projectTitle = order.solution?.title ?? "Project";

  const sellerName = order.seller?.invoiceCompanyName || order.seller?.agencyName || order.seller?.displayName || "Seller";
  const sellerAddress = order.seller?.invoiceAddress || order.seller?.country || "";
  const sellerVat = order.seller?.invoiceVatNumber || "";

  const buyerName = order.buyer.businessProfile?.companyName || order.buyer.businessProfile?.firstName
    ? `${order.buyer.businessProfile?.firstName || ""} ${order.buyer.businessProfile?.lastName || ""}`.trim() || "Buyer"
    : "Buyer";
  const buyerCompany = order.buyer.businessProfile?.companyName || "";

  const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`;
  const invoiceDate = order.createdAt;

  return (
    <div className="min-h-screen bg-[#FBFAF8]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/business/projects"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors print:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {/* Invoice container - print friendly */}
        <div
          id="invoice"
          className="bg-white border border-border rounded-xl shadow-lg p-8 md:p-12"
          style={{ printColorAdjust: "exact" }}
        >
          <div className="flex justify-between items-start mb-10 pb-6 border-b border-border">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Invoice
              </h1>
              <p className="text-sm text-muted-foreground mt-2">{invoiceNumber}</p>
              <p className="text-sm text-muted-foreground">
                Date: {invoiceDate.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="text-right text-sm">
              <LogoBrand size="sm" />
              <p className="text-muted-foreground mt-1">Marketplace</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">From (Seller)</p>
              <p className="font-semibold text-foreground">{sellerName}</p>
              {sellerAddress && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{sellerAddress}</p>}
              {sellerVat && <p className="text-sm text-muted-foreground mt-1">VAT: {sellerVat}</p>}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">To (Buyer)</p>
              <p className="font-semibold text-foreground">{buyerCompany || buyerName}</p>
              {buyerCompany && buyerName !== buyerCompany && (
                <p className="text-sm text-muted-foreground mt-1">{buyerName}</p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Description</p>
            <p className="font-medium text-foreground mb-4">{projectTitle}</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 font-semibold text-foreground">Item</th>
                  <th className="text-right py-3 font-semibold text-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {milestones.length > 0 ? (
                  milestones.map((m, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-3 text-foreground">{m.title}</td>
                      <td className="py-3 text-right font-medium">{formatCentsToCurrency(m.priceCents)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-border/50">
                    <td className="py-3 text-foreground">{projectTitle}</td>
                    <td className="py-3 text-right font-medium">{formatCentsToCurrency(order.priceCents)}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-4 font-bold text-foreground">Total</td>
                  <td className="py-4 text-right font-bold text-foreground">{formatCentsToCurrency(order.priceCents)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground border-t border-border pt-6">
            This invoice was generated by {BRAND_NAME}. Payment was held in escrow and released upon your approval.
            For questions, contact <a href="mailto:support@logiclot.io" className="text-primary hover:underline">support@logiclot.io</a>.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 print:hidden">
          <PrintInvoiceButton />
          <Link
            href="/business/projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border font-medium hover:bg-secondary transition-all"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
