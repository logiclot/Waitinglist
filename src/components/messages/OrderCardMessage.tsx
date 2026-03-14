"use client";

import { CheckCircle2, CreditCard, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import Link from "next/link";
import type { OrderCardData } from "@/types";

const CARD_CONFIG: Record<
  OrderCardData["type"],
  {
    icon: typeof CheckCircle2;
    bgClass: string;
    borderClass: string;
    iconClass: string;
    titleClass: string;
    getTitle: (d: OrderCardData) => string;
    getDescription: (d: OrderCardData) => string;
  }
> = {
  milestone_funded: {
    icon: CreditCard,
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    borderClass: "border-emerald-200 dark:border-emerald-800",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    titleClass: "text-emerald-900 dark:text-emerald-100",
    getTitle: (d) => `Milestone ${d.milestoneIndex + 1} funded`,
    getDescription: (d) => {
      const amount = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(d.priceCents / 100);
      return `${d.milestoneTitle} \u2014 ${amount} secured in escrow.`;
    },
  },
  order_accepted: {
    icon: CheckCircle2,
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    borderClass: "border-blue-200 dark:border-blue-800",
    iconClass: "text-blue-600 dark:text-blue-400",
    titleClass: "text-blue-900 dark:text-blue-100",
    getTitle: () => "Order accepted",
    getDescription: (d) => `${d.expertName || "Expert"} has accepted the order and started working on your project.`,
  },
  delivery_submitted: {
    icon: Truck,
    bgClass: "bg-violet-50 dark:bg-violet-950/30",
    borderClass: "border-violet-200 dark:border-violet-800",
    iconClass: "text-violet-600 dark:text-violet-400",
    titleClass: "text-violet-900 dark:text-violet-100",
    getTitle: () => "Delivery submitted",
    getDescription: (d) => {
      const base = `${d.expertName || "Expert"} has submitted the delivery for ${d.milestoneTitle}.`;
      return d.deliveryNote ? `${base} Note: "${d.deliveryNote}"` : base;
    },
  },
  milestone_released: {
    icon: ShieldCheck,
    bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
    borderClass: "border-emerald-200 dark:border-emerald-800",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    titleClass: "text-emerald-900 dark:text-emerald-100",
    getTitle: (d) => `Milestone ${d.milestoneIndex + 1} released`,
    getDescription: (d) => {
      const amount = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(d.priceCents / 100);
      return `${amount} released to ${d.expertName || "the expert"} for ${d.milestoneTitle}.`;
    },
  },
  revision_requested: {
    icon: RotateCcw,
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    borderClass: "border-amber-200 dark:border-amber-800",
    iconClass: "text-amber-600 dark:text-amber-400",
    titleClass: "text-amber-900 dark:text-amber-100",
    getTitle: (d) => `Revision requested${d.revisionCount ? ` (#${d.revisionCount})` : ""}`,
    getDescription: (d) => {
      const base = `Client requested modifications for ${d.milestoneTitle}.`;
      return d.revisionNote ? `${base} "${d.revisionNote}"` : base;
    },
  },
  revision_accepted: {
    icon: CheckCircle2,
    bgClass: "bg-blue-50 dark:bg-blue-950/30",
    borderClass: "border-blue-200 dark:border-blue-800",
    iconClass: "text-blue-600 dark:text-blue-400",
    titleClass: "text-blue-900 dark:text-blue-100",
    getTitle: () => "Revision accepted",
    getDescription: (d) => `${d.expertName || "Expert"} accepted the revision request and is working on the changes.`,
  },
};

export function OrderCardMessage({ body }: { body: string }) {
  let data: OrderCardData;
  try {
    data = JSON.parse(body);
  } catch {
    return (
      <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
        {body}
      </span>
    );
  }

  const config = CARD_CONFIG[data.type];
  if (!config) {
    return (
      <span className="text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full border border-border">
        {body}
      </span>
    );
  }

  const Icon = config.icon;

  return (
    <div className={`w-full max-w-sm rounded-xl border ${config.borderClass} ${config.bgClass} overflow-hidden`}>
      <div className="px-4 py-3 flex items-start gap-3">
        <div className={`shrink-0 mt-0.5 ${config.iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold ${config.titleClass}`}>
            {config.getTitle(data)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {config.getDescription(data)}
          </p>
        </div>
      </div>
      {data.orderId && (
        <div className="px-4 pb-3">
          <Link
            href={`/invoice/${data.orderId}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            View Invoice
          </Link>
        </div>
      )}
    </div>
  );
}
