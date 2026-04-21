import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { resend, getFromEmail } from "@/lib/resend";
import { notificationEmail } from "@/lib/email-templates";
import { log } from "@/lib/logger";
import { randomUUID } from "node:crypto";
import * as Sentry from "@sentry/nextjs";

export type NotificationType = "info" | "success" | "alert";

export type SendNotificationEvent = {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    actionUrl?: string;
    sendEmail?: boolean;
};

export const sendNotification = inngest.createFunction(
    {
        id: "send-notification",
        name: "Create in-app notification and send email",
        triggers: [{ event: "notification/send" }],
    },
    async ({ event, step }) => {
        const {
            userId,
            title,
            message,
            type = "info",
            actionUrl,
            sendEmail = true,
        } = event.data as SendNotificationEvent;

        try {
            const notification = await step.run("create-notification", () =>
                prisma.notification.create({
                    data: { userId, title, message, type, actionUrl },
                }),
            );

            if (!sendEmail) {
                return { notificationId: notification.id, emailSent: false };
            }

            const fromEmail = getFromEmail();
            if (!fromEmail) {
                return { notificationId: notification.id, emailSent: false, skipped: "from_email_not_configured" };
            }

            const user = await step.run("fetch-user-email", () =>
                prisma.user.findUnique({
                    where: { id: userId },
                    select: { email: true },
                }),
            );

            if (!user?.email) {
                return { notificationId: notification.id, emailSent: false, skipped: "no_user_email" };
            }

            await step.run("send-email", () =>
                resend.emails.send({
                    from: fromEmail,
                    to: user.email,
                    subject: title,
                    html: notificationEmail({ title, message, actionUrl }),
                    headers: {
                        "X-Entity-Ref-ID": randomUUID(),
                    },
                }),
            );

            return { notificationId: notification.id, emailSent: true };
        } catch (error) {
            log.error("notification.send_failed", {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            Sentry.captureException(error);
            throw error;
        }
    },
);
