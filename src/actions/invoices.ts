"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { log } from "@/lib/logger";

/**
 * Returns the count of invoices (orders + paid job postings) created
 * after the user's lastInvoiceViewedAt timestamp.
 */
export async function getUnseenInvoiceCount(): Promise<number> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return 0;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        lastInvoiceViewedAt: true,
        specialistProfile: { select: { id: true } },
      },
    });
    if (!user) return 0;

    const since = user.lastInvoiceViewedAt ?? new Date(0);

    if (user.role === "EXPERT" && user.specialistProfile) {
      // Experts see invoices for orders where they are the seller
      const orderCount = await prisma.order.count({
        where: {
          sellerId: user.specialistProfile.id,
          status: { notIn: ["draft"] },
          createdAt: { gt: since },
        },
      });
      return orderCount;
    }

    // Business users see both order invoices and job posting invoices
    const [orderCount, jobCount] = await Promise.all([
      prisma.order.count({
        where: {
          buyerId: session.user.id,
          status: { notIn: ["draft"] },
          createdAt: { gt: since },
        },
      }),
      prisma.jobPost.count({
        where: {
          buyerId: session.user.id,
          paidAt: { not: null, gt: since },
        },
      }),
    ]);

    return orderCount + jobCount;
  } catch (e) {
    log.error("invoices.get_unseen_count_failed", {
      error: e instanceof Error ? e.message : String(e),
    });
    return 0;
  }
}

/**
 * Updates the user's lastInvoiceViewedAt to now.
 * Called when the user visits the Invoices tab.
 */
export async function markInvoicesViewed() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastInvoiceViewedAt: new Date() },
    });
  } catch (e) {
    log.error("invoices.mark_viewed_failed", {
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
