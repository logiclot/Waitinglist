import { prisma } from "@/lib/prisma";
import { resend, getFromEmail } from "@/lib/resend";
import { jobPostNotificationEmail } from "@/lib/email-templates";
import { log } from "@/lib/logger";
import { randomUUID } from 'node:crypto';
import { APP_URL } from "./app-url";
import { captureException } from "./sentry";
import { inngest } from "@/lib/inngest";
export type NotificationType = "info" | "success" | "alert";

export async function sendJobNotificationToExperts(jobId: string, type: "DISCOVERY" | "JOB_POSTING" = "DISCOVERY") {
  try {
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
      select: { title: true, category: true, budgetRange: true, timeline: true },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    const users = await prisma.specialistProfile.findMany({
      where: { tier: { not: "STANDARD" } },
      include: { user: { select: { email: true } } },
    });

    if (!users.length) {
      throw new Error("No users found");
    }

    const fromEmail = getFromEmail();
    if (!fromEmail) return { success: false, message: "RESEND_FROM_EMAIL not configured" };

    const jobUrl = `${APP_URL}/jobs/${jobId}`;

    for (const user of users) {
      await resend.emails.send({
        from: fromEmail,
        to: user.user.email,
        subject: `New ${type === "DISCOVERY" ? "Discovery Scan" : "Job Posting"} : ${job.title}`,
        html: jobPostNotificationEmail({
          jobTitle: job.title,
          category: job.category,
          budgetRange: job.budgetRange,
          timeline: job.timeline,
          tier: user.tier,
          jobUrl,
        }),
        headers: {
          'X-Entity-Ref-ID': randomUUID(),
        },
      });
    }

    return {
      success: true,
      message: "Email Sent Successfully"
    }
  } catch (e) {
    log.error("discovery_scan.notification", { e })
    captureException(e)
  }

}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = "info",
  actionUrl?: string,
  sendEmail: boolean = true
) {
  try {
    await inngest.send({
      name: "notification/send",
      data: { userId, title, message, type, actionUrl, sendEmail },
    });
  } catch (error) {
    log.error("notification.dispatch_failed", { userId, error: String(error) });
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
