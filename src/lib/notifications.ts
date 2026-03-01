import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { notificationEmail } from "@/lib/email-templates";
import { log } from "@/lib/logger";

export type NotificationType = "info" | "success" | "alert";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

async function sendNotificationEmail(
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
) {
  // Skip silently if email sending is not configured in this environment
  if (!FROM_EMAIL) return;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user?.email) return;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: title,
      html: notificationEmail({ title, message, actionUrl }),
    });
  } catch (error) {
    log.error("notification.email_send_failed", { userId, error: String(error) });
  }
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = "info",
  actionUrl?: string
) {
  try {
    const notification = await prisma.notification.create({
      data: { userId, title, message, type, actionUrl },
    });

    // Fire-and-forget: email delivery should not block the in-app notification.
    sendNotificationEmail(userId, title, message, actionUrl).catch((e) =>
      log.error("notification.email_fire_and_forget_failed", { userId, error: String(e) })
    );

    return notification;
  } catch (error) {
    log.error("notification.create_failed", { userId, error: String(error) });
    return null;
  }
}

export async function getUnreadNotifications(userId: string) {
  return await prisma.notification.findMany({
    where: {
      userId,
      isRead: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function markNotificationAsRead(notificationId: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

/**
 * Deduplication helper — prevents sending the same notification type
 * more than once within the given window (default 20 hours).
 */
export async function wasRecentlyNotified(
  userId: string,
  title: string,
  withinHours = 20
): Promise<boolean> {
  const since = new Date(Date.now() - withinHours * 60 * 60 * 1000);
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      title,
      createdAt: { gte: since },
    },
  });
  return existing !== null;
}
