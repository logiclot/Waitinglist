import { prisma } from "@/lib/prisma";
import { createRouter } from "../../init";
import { commonProcedure } from "../../procedures";

interface ReferralRewards {
    expertDiscountCount: number;
    businessDiscountCount: number;
}

const COUPON_PATTERN = /(?:code|coupon)\s+([A-Z0-9]+)/i;

export const rewardsRouter = createRouter({
    getCoupons: commonProcedure.query(async ({ ctx }) => {
        const { userId } = ctx
        try {
            const notifications = await prisma.notification.findMany({
                where: { userId },
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
    }),
    getReferalStats: commonProcedure.query(async ({ ctx }) => {
        const { userId } = ctx

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                referralCode: true,
                referralRewards: true,
            },
        });

        if (!user) {
            return { error: "User not found" };
        }

        const referralCount = await prisma.user.count({
            where: {
                referredBy: user.referralCode,
                referralCompletedAt: { not: null }
            },
        });

        // Count pending referrals
        const pendingCount = await prisma.user.count({
            where: {
                referredBy: user.referralCode,
                referralCompletedAt: null
            },
        });

        return {
            referralCode: user.referralCode,
            referralRewards: user.referralRewards as unknown as ReferralRewards,
            referralCount,
            pendingCount
        };
    }),
});