import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCentsToCurrency } from "@/lib/commission";
import { BRAND_NAME } from "@/lib/branding";
import {
  DISCOVERY_SCAN_PRICE_CENTS,
  CUSTOM_PROJECT_PRICE_CENTS,
} from "@/lib/pricing-config";
import { markInvoicesViewed } from "@/actions/invoices";
import Link from "next/link";
import { FileText, ExternalLink, Zap } from "lucide-react";
import { InvoicesPageSkeleton } from "@/components/invoices/InvoicesPageSkeleton";

export const metadata = {
  title: `Invoices | ${BRAND_NAME}`,
  description: "View and download all your invoices.",
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  paid_pending_implementation: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700",
  },
  in_progress: { label: "In Progress", className: "bg-blue-50 text-blue-700" },
  delivered: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700",
  },
  approved: { label: "Completed", className: "bg-emerald-50 text-emerald-700" },
  refunded: { label: "Refunded", className: "bg-amber-50 text-amber-700" },
  disputed: { label: "Disputed", className: "bg-red-50 text-red-700" },
};

interface InvoiceItem {
  id: string;
  href: string;
  status: string;
  statusLabel: string;
  statusClassName: string;
  priceCents: number;
  createdAt: Date;
  title: string;
  counterparty: string;
  type: "order" | "posting_fee";
}

function getJobPriceCents(category: string): number {
  if (category === "Discovery Scan" || category === "Discovery") {
    return DISCOVERY_SCAN_PRICE_CENTS;
  }
  return CUSTOM_PROJECT_PRICE_CENTS;
}

async function InvoicesContent() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/sign-in?callbackUrl=/dashboard/invoices");

  const role = session.user.role as string;
  const userId = session.user.id;

  if (role === "EXPERT") {
    const [profile, orders] = await Promise.all([
      prisma.specialistProfile.findUnique({
        where: { userId },
        select: { id: true },
      }),
      prisma.order.findMany({
        where: { seller: { userId }, status: { notIn: ["draft"] } },
        select: {
          id: true,
          status: true,
          priceCents: true,
          createdAt: true,
          solution: { select: { title: true } },
          buyer: { select: { email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      markInvoicesViewed(),
    ]);

    if (!profile) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          Complete your expert profile to view invoices.
        </div>
      );
    }

    const items: InvoiceItem[] = orders.map((o) => {
      const sc = STATUS_LABELS[o.status] ?? {
        label: o.status,
        className: "bg-gray-100 text-gray-700",
      };
      return {
        id: o.id,
        href: `/invoice/${o.id}`,
        status: o.status,
        statusLabel: sc.label,
        statusClassName: sc.className,
        priceCents: o.priceCents,
        createdAt: o.createdAt,
        title: o.solution?.title ?? "Order",
        counterparty: o.buyer.email,
        type: "order",
      };
    });

    return <InvoicesView role="EXPERT" items={items} />;
  }

  const [orders, paidJobs] = await Promise.all([
    prisma.order.findMany({
      where: {
        buyerId: userId,
        status: { notIn: ["draft"] },
      },
      select: {
        id: true,
        status: true,
        priceCents: true,
        createdAt: true,
        solution: { select: { title: true } },
        seller: { select: { displayName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.jobPost.findMany({
      where: {
        buyerId: userId,
        paidAt: { not: null },
      },
      select: {
        id: true,
        title: true,
        category: true,
        paidAt: true,
      },
      orderBy: { paidAt: "desc" },
    }),
    markInvoicesViewed(),
  ]);

  const orderItems: InvoiceItem[] = orders.map((o) => {
    const sc = STATUS_LABELS[o.status] ?? {
      label: o.status,
      className: "bg-gray-100 text-gray-700",
    };
    return {
      id: o.id,
      href: `/invoice/${o.id}`,
      status: o.status,
      statusLabel: sc.label,
      statusClassName: sc.className,
      priceCents: o.priceCents,
      createdAt: o.createdAt,
      title: o.solution?.title ?? "Order",
      counterparty: o.seller.displayName ?? "Expert",
      type: "order",
    };
  });

  const jobItems: InvoiceItem[] = paidJobs.map((j) => ({
    id: j.id,
    href: `/invoice/job/${j.id}`,
    status: "paid",
    statusLabel: "Posting Fee",
    statusClassName: "bg-violet-50 text-violet-700",
    priceCents: getJobPriceCents(j.category),
    createdAt: j.paidAt!,
    title: j.title,
    counterparty:
      j.category === "Discovery Scan" || j.category === "Discovery"
        ? "Discovery Scan"
        : "Custom Project",
    type: "posting_fee",
  }));

  const items = [...orderItems, ...jobItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return <InvoicesView role="BUSINESS" items={items} />;
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<InvoicesPageSkeleton />}>
      <InvoicesContent />
    </Suspense>
  );
}

function InvoicesView({ role, items }: { role: string; items: InvoiceItem[] }) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Invoices</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        View and download invoices for all your{" "}
        {role === "EXPERT" ? "completed projects" : "purchases"}.
      </p>

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No invoices yet</p>
          <p className="text-sm mt-1">
            {role === "EXPERT"
              ? "Invoices will appear here once you receive orders."
              : "Invoices will appear here once you make a purchase."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={item.href}
              className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    item.type === "posting_fee"
                      ? "bg-violet-500/5 text-violet-600"
                      : "bg-primary/5 text-primary"
                  }`}
                >
                  {item.type === "posting_fee" ? (
                    <Zap className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.counterparty} &middot;{" "}
                    {new Date(item.createdAt).toLocaleDateString("en-IE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.statusClassName}`}
                >
                  {item.statusLabel}
                </span>
                <span className="text-sm font-semibold tabular-nums w-20 text-right">
                  {formatCentsToCurrency(item.priceCents)}
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
