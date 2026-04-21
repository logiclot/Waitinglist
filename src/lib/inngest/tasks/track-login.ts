import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";
import { checkExpertReferralCondition } from "@/actions/referral";
import * as Sentry from "@sentry/nextjs";

export const trackLogin = inngest.createFunction(
    {
        id: "track-login",
        name: "Track user login activity",
        triggers: [{ event: "user/login.tracked" }],
    },
    async ({ event, step }) => {
        const { userId } = event.data as { userId: string };

        try {
            const user = await step.run("fetch-user", () =>
                prisma.user.findUnique({
                    where: { id: userId },
                    select: { lastLoginAt: true, loginDaysCount: true },
                }),
            );
            if (!user) return { skipped: "user_not_found" };

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            let shouldUpdate = false;
            let newLoginDaysCount = user.loginDaysCount;

            if (!user.lastLoginAt) {
                shouldUpdate = true;
                newLoginDaysCount = 1;
            } else {
                const lastLogin = new Date(user.lastLoginAt);
                const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
                if (today.getTime() > lastLoginDate.getTime()) {
                    shouldUpdate = true;
                    newLoginDaysCount += 1;
                }
            }

            if (!shouldUpdate) return { skipped: "already_tracked_today" };

            await step.run("update-login-stats", () =>
                prisma.user.update({
                    where: { id: userId },
                    data: { lastLoginAt: now, loginDaysCount: newLoginDaysCount },
                }),
            );

            await step.run("check-expert-referral", () => checkExpertReferralCondition(userId));

            return { updated: true, loginDaysCount: newLoginDaysCount };
        } catch (error) {
            log.error("auth.track_login_failed", { error: error instanceof Error ? error.message : String(error) });
            Sentry.captureException(error);
            throw error;
        }
    },
);
