"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { log } from "@/lib/logger";
import { isStripeConnectSupported } from "@/lib/stripe-countries";
import * as Sentry from "@sentry/nextjs";

export async function updateExpertProfile(data: {
  displayName?: string;
  bio?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    await prisma.specialistProfile.update({
      where: { userId: session.user.id },
      data: {
        displayName: data.displayName ?? undefined,
        bio: data.bio ?? undefined,
      },
    });
    revalidatePath("/expert/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    log.error("expert.update_profile_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to update profile" };
  }
}

export async function updateExpertCalendar(calendarUrl: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  // Allow clearing the calendar URL
  if (calendarUrl.trim() === "") {
    try {
      await prisma.specialistProfile.update({
        where: { userId: session.user.id },
        data: { calendarUrl: null },
      });
      revalidatePath("/dashboard/messages");
      revalidatePath("/expert/settings");
      revalidatePath("/dashboard");
      return { success: true };
    } catch (e) {
      log.error("expert.update_calendar_failed", { error: e instanceof Error ? e.message : String(e) });
      Sentry.captureException(e);
      return { error: "Failed to update calendar" };
    }
  }

  // Validate URL format
  try {
    new URL(calendarUrl);
  } catch {
    return { error: "Please enter a valid URL (e.g., https://calendly.com/your-name)" };
  }

  try {
    await prisma.specialistProfile.update({
      where: { userId: session.user.id },
      data: { calendarUrl },
    });
    revalidatePath("/dashboard/messages");
    revalidatePath("/expert/settings");
    revalidatePath("/dashboard"); // For the overview card
    return { success: true };
  } catch (e) {
    log.error("expert.update_calendar_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to update calendar" };
  }
}

export async function updateExpertInvoice(data: {
  invoiceCompanyName?: string;
  invoiceAddress?: string;
  invoiceVatNumber?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    await prisma.specialistProfile.update({
      where: { userId: session.user.id },
      data: {
        invoiceCompanyName: data.invoiceCompanyName ?? undefined,
        invoiceAddress: data.invoiceAddress ?? undefined,
        invoiceVatNumber: data.invoiceVatNumber ?? undefined,
      }
    });
    revalidatePath("/expert/settings");
    revalidatePath("/invoice");
    return { success: true };
  } catch (e) {
    log.error("expert.update_invoice_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to update invoice template" };
  }
}

export async function getExpertSettings() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    const expert = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { profileImageUrl: true } } }
    });

    if (!expert) return { error: "Expert profile not found" };

    return {
      success: true,
      settings: {
        profileImageUrl: expert.user?.profileImageUrl,
        calendarUrl: expert.calendarUrl,
        displayName: expert.displayName || expert.legalFullName,
        bio: expert.bio || "",
        platformFeePercentage: expert.platformFeePercentage ?? 16,
        isFoundingExpert: !!(expert.isFoundingExpert),
        tier: expert.tier,
        invoiceCompanyName: expert.invoiceCompanyName,
        invoiceAddress: expert.invoiceAddress,
        invoiceVatNumber: expert.invoiceVatNumber,
        country: expert.country,
        bankAccountHolder: expert.bankAccountHolder,
        bankIban: expert.bankIban,
        bankSwiftBic: expert.bankSwiftBic,
        bankName: expert.bankName,
        bankCurrency: expert.bankCurrency,
      }
    };
  } catch (e) {
    log.error("expert.fetch_settings_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to fetch settings" };
  }
}

export async function updateExpertBankDetails(data: {
  bankAccountHolder: string;
  bankIban: string;
  bankSwiftBic: string;
  bankName: string;
  bankCurrency: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  if (!data.bankAccountHolder?.trim() || !data.bankIban?.trim() || !data.bankSwiftBic?.trim()) {
    return { error: "Account holder, IBAN, and SWIFT/BIC are required" };
  }

  try {
    await prisma.specialistProfile.update({
      where: { userId: session.user.id },
      data: {
        bankAccountHolder: data.bankAccountHolder.trim(),
        bankIban: data.bankIban.trim().replace(/\s/g, ""),
        bankSwiftBic: data.bankSwiftBic.trim().toUpperCase(),
        bankName: data.bankName.trim() || null,
        bankCurrency: data.bankCurrency.trim().toUpperCase() || "EUR",
      },
    });
    revalidatePath("/expert/settings");
    return { success: true };
  } catch (e) {
    log.error("expert.update_bank_details_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to update bank details" };
  }
}

export async function getExpertOverviewData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      displayName: true,
      calendarUrl: true,
      country: true,
      stripeAccountId: true,
      stripeDetailsSubmitted: true,
      isFoundingExpert: true,
      completedSalesCount: true,
      tier: true,
      bankIban: true,
    },
  });

  if (!expert) return { error: "Expert profile not found" };

  const [solutionCount, activeOrders, allOrders, jobPosts, topSolution] = await Promise.all([
    prisma.solution.count({ where: { expertId: expert.id } }),
    prisma.order.findMany({
      where: {
        sellerId: expert.id,
        status: { in: ["paid_pending_implementation", "in_progress", "delivered", "disputed"] },
      },
      include: {
        solution: { select: { title: true } },
        buyer: { select: { email: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    prisma.order.findMany({
      where: { sellerId: expert.id },
      include: { solution: { select: { title: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.jobPost.findMany({
      where: { status: "open" },
      select: { id: true, title: true, budgetRange: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.solution.findFirst({
      where: { expertId: expert.id, status: "published" },
      include: { _count: { select: { orders: true } } },
      orderBy: { orders: { _count: "desc" } },
    }),
  ]);

  const isFirstTime = solutionCount === 0 && allOrders.length === 0;

  // Earnings from released milestones (this month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  let thisMonthEarnedCents = 0;
  let pendingCents = 0;

  for (const order of allOrders) {
    const milestones = (order.milestones as unknown as import("@/types").Milestone[]) || [];
    for (const m of milestones) {
      const amount = m.priceCents || (m.price ? Math.round(m.price * 100) : 0);
      if (m.status === "released" && m.releasedAt) {
        if (new Date(m.releasedAt) >= monthStart) {
          thisMonthEarnedCents += amount;
        }
      } else if (m.status === "in_escrow") {
        pendingCents += amount;
      }
    }
  }

  // Priority actions
  const actions: Array<{ type: "warning" | "info" | "action"; title: string; description: string; href: string }> = [];

  if (isStripeConnectSupported(expert.country)) {
    if (!expert.stripeAccountId || !expert.stripeDetailsSubmitted) {
      actions.push({ type: "warning", title: "Connect Stripe to get paid", description: "You need a Stripe account to receive payouts.", href: "/expert/settings" });
    }
  } else if (!expert.bankIban) {
    actions.push({ type: "warning", title: "Add bank details to get paid", description: "Stripe is unavailable in your country. Add your bank details for manual payouts.", href: "/expert/settings#payouts" });
  }
  if (!expert.calendarUrl) {
    actions.push({ type: "info", title: "Add your scheduling link", description: "Let clients book demos directly from your profile.", href: "/expert/settings" });
  }

  for (const order of activeOrders.slice(0, 2)) {
    if (order.status === "delivered") {
      actions.push({ type: "action", title: `Awaiting approval: ${order.solution?.title || "Project"}`, description: "Buyer is reviewing the delivery.", href: "/expert/projects" });
    } else if (order.status === "disputed") {
      actions.push({ type: "warning", title: `Dispute: ${order.solution?.title || "Project"}`, description: "This order has an open dispute.", href: "/expert/projects" });
    }
  }

  return {
    success: true as const,
    isFirstTime,
    displayName: expert.displayName,
    thisMonthEarnedCents,
    pendingCents,
    actions,
    activeOrders: activeOrders.map((o) => ({
      id: o.id,
      title: o.solution?.title || "Project",
      buyerEmail: o.buyer?.email || "Client",
      status: o.status,
    })),
    jobPosts: jobPosts.map((j) => ({
      id: j.id,
      title: j.title,
      budgetRange: j.budgetRange,
      createdAt: j.createdAt.toISOString(),
    })),
    topSolution: topSolution ? {
      id: topSolution.id,
      title: topSolution.title,
      category: topSolution.category,
      orderCount: topSolution._count.orders,
    } : null,
    solutionCount,
  };
}

export async function getExpertProjectsData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!expert) return { error: "Expert profile not found" };

  const orders = await prisma.order.findMany({
    where: {
      sellerId: expert.id,
      status: { in: ["paid_pending_implementation", "in_progress", "delivered", "disputed"] },
    },
    include: {
      solution: { select: { title: true } },
      buyer: { select: { email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return {
    success: true as const,
    orders: orders.map((o) => ({
      id: o.id,
      title: o.solution?.title || "Project",
      buyerEmail: o.buyer?.email || "Client",
      status: o.status,
      priceCents: o.priceCents,
      milestones: (o.milestones as unknown as import("@/types").Milestone[]) || [],
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    })),
  };
}

export async function getExpertEarnings() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      tier: true,
      isFoundingExpert: true,
      completedSalesCount: true,
      commissionOverridePercent: true,
      platformFeePercentage: true,
      stripeAccountId: true,
      stripeDetailsSubmitted: true,
    },
  });

  if (!expert) return { error: "Expert profile not found" };

  // Get all orders for this expert
  const orders = await prisma.order.findMany({
    where: { sellerId: expert.id },
    include: {
      solution: { select: { title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Build transaction list from released milestones
  const transactions: Array<{
    date: string;
    orderTitle: string;
    milestoneTitle: string;
    grossCents: number;
    feePercent: number;
    netCents: number;
  }> = [];

  let totalEarnedCents = 0;
  let inEscrowCents = 0;

  for (const order of orders) {
    const milestones = (order.milestones as unknown as import("@/types").Milestone[]) || [];
    const orderTitle =
      order.solution?.title || "Project";

    for (const m of milestones) {
      const amount =
        m.priceCents || (m.price ? Math.round(m.price * 100) : 0);
      if (m.status === "released" && m.releasedAt) {
        // Calculate fee using commission logic
        const feePercent = expert.commissionOverridePercent
          ? Number(expert.commissionOverridePercent)
          : expert.isFoundingExpert
            ? 11
            : expert.completedSalesCount >= 10
              ? 12
              : expert.completedSalesCount >= 5
                ? 13
                : 15;
        const feeCents = Math.round(amount * (feePercent / 100));
        const netCents = amount - feeCents;
        totalEarnedCents += netCents;
        transactions.push({
          date: m.releasedAt,
          orderTitle,
          milestoneTitle: m.title,
          grossCents: amount,
          feePercent,
          netCents,
        });
      } else if (m.status === "in_escrow") {
        inEscrowCents += amount;
      }
    }
  }

  // Monthly breakdown
  const monthlyMap = new Map<
    string,
    { earnedCents: number; orderCount: number }
  >();
  for (const t of transactions) {
    const month = t.date.substring(0, 7); // YYYY-MM
    const existing = monthlyMap.get(month) || {
      earnedCents: 0,
      orderCount: 0,
    };
    existing.earnedCents += t.netCents;
    existing.orderCount += 1;
    monthlyMap.set(month, existing);
  }

  const monthlyBreakdown = Array.from(monthlyMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => b.month.localeCompare(a.month));

  // Determine current commission rate
  const commissionRate = expert.commissionOverridePercent
    ? Number(expert.commissionOverridePercent)
    : expert.isFoundingExpert
      ? 11
      : expert.completedSalesCount >= 10
        ? 12
        : expert.completedSalesCount >= 5
          ? 13
          : 15;

  return {
    success: true as const,
    totalEarnedCents,
    inEscrowCents,
    commissionRate,
    tier: expert.tier,
    isFoundingExpert: expert.isFoundingExpert,
    completedSalesCount: expert.completedSalesCount,
    stripeConnected:
      !!expert.stripeAccountId && !!expert.stripeDetailsSubmitted,
    transactions,
    monthlyBreakdown,
  };
}

// ── Elite Application ─────────────────────────────────────────────────────────

export async function applyForElite() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  try {
    const profile = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        tier: true,
        completedSalesCount: true,
        eliteApplicationStatus: true,
        eliteDeniedAt: true,
      },
    });

    if (!profile) return { error: "Expert profile not found" };
    if (profile.tier === "ELITE") return { error: "You are already Elite" };
    if (profile.completedSalesCount < 10) return { error: "You need at least 10 completed sales to apply" };
    if (profile.eliteApplicationStatus === "pending") return { error: "Your application is already under review" };

    // 14-day re-apply cooldown
    if (profile.eliteDeniedAt) {
      const daysSinceDenial = (Date.now() - new Date(profile.eliteDeniedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDenial < 14) {
        const daysLeft = Math.ceil(14 - daysSinceDenial);
        return { error: `You can re-apply in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}` };
      }
    }

    await prisma.specialistProfile.update({
      where: { id: profile.id },
      data: {
        eliteApplicationStatus: "pending",
        eliteAppliedAt: new Date(),
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    log.error("expert.apply_elite_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Something went wrong" };
  }
}

export async function getEliteApplicationStatus() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const profile = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      tier: true,
      completedSalesCount: true,
      eliteApplicationStatus: true,
      eliteAppliedAt: true,
      eliteDeniedAt: true,
      eliteDeniedReason: true,
      eliteDemotedAt: true,
      eliteDemotedReason: true,
    },
  });

  return profile;
}
