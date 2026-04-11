import { prisma } from "@/lib/prisma";
import { TIER_THRESHOLDS } from "@/lib/commission";
import { createNotification } from "@/lib/notifications";
import { SpecialistTier } from "@prisma/client";
import { z } from "zod";
import { createRouter } from "../../init";
import { adminProcedure } from "../../procedures";

export const adminExpertRouter = createRouter({
    getExperts: adminProcedure.query(async () => {
        const profiles = await prisma.specialistProfile.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, email: true } },
                _count: {
                    select: {
                        bids: true,
                    },
                },
            },
        })

        return profiles
    }),

    suspendExpert: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input }) => {
            await prisma.specialistProfile.update({
                where: { id: input.id },
                data: { status: "SUSPENDED" },
            });
            return { success: true };
        }),

    deleteExpert: adminProcedure
        .input(z.object({ userId: z.string() }))
        .mutation(async ({ input }) => {
            await prisma.user.delete({ where: { id: input.userId } });
            return { success: true };
        }),

    setTier: adminProcedure
        .input(z.object({ id: z.string(), tier: z.enum(SpecialistTier) }))
        .mutation(async ({ input }) => {
            const feeForTier = TIER_THRESHOLDS[input.tier];

            let count: number | null = null;

            if (input.tier === "FOUNDING") {
                count = await prisma.specialistProfile.count({
                    where: { tier: "FOUNDING" }
                })
            }

            const specialist = await prisma.specialistProfile.update({
                where: { id: input.id },
                data: {
                    tier: input.tier,
                    platformFeePercentage: feeForTier,
                    isFoundingExpert: input.tier === "FOUNDING",
                    foundingRank: count,
                },
                select: { userId: true },
            });

            const tierLabels: Record<string, string> = {
                STANDARD: `Standard (${TIER_THRESHOLDS.STANDARD}% fee)`,
                PROVEN: `Proven (${TIER_THRESHOLDS.PROVEN}% fee)`,
                ELITE: `Elite (${TIER_THRESHOLDS.ELITE}% fee)`,
                FOUNDING: `Founding (${TIER_THRESHOLDS.FOUNDING}% fee)`,
            };

            if (input.tier === "FOUNDING") {
                await createNotification(
                    specialist.userId,
                    "🏅 Founding Expert status granted!",
                    `You are now Founding Expert. You'll enjoy an 11% platform fee for life and a permanent Founding Expert badge on your profile.`,
                    "success",
                    "/dashboard",
                );
            } else {
                await createNotification(
                    specialist.userId,
                    "📊 Expert tier updated",
                    `Your tier has been changed to ${tierLabels[input.tier] ?? input.tier}.`,
                    "info",
                    "/dashboard",
                );
            }

            return { success: true };
        }),
})