"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

export async function markAsRead(notificationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    // Only invalidate the notification dropdown, not the entire cache
    revalidatePath("/dashboard");
    revalidatePath("/business");
    return { success: true };
  } catch (e) {
    log.error("notifications.mark_read_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to mark as read" };
  }
}

export async function getNotifications() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    return await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch {
    return [];
  }
}

export async function getUnreadNotificationCount() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return 0;

    const count = await prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });
    return count;
  } catch {
    return 0;
  }
}

/** Extract coupon codes from notifications (e.g. WELCOME5, FEEDBACKS) */
const COUPON_PATTERN = /(?:code|coupon)\s+([A-Z0-9]+)/i;

export async function getActiveCoupons() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return [];

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const coupons: { code: string; title: string }[] = [];
    const seen = new Set<string>();

    for (const n of notifications) {
      const text = n.title + " " + n.message;
      if (!/coupon|% off|Use code/i.test(text)) continue;
      const match = text.match(COUPON_PATTERN);
      if (match) {
        const code = match[1].toUpperCase();
        if (!seen.has(code)) {
          seen.add(code);
          coupons.push({ code, title: n.title });
        }
      }
    }
    return coupons;
  } catch {
    return [];
  }
}
