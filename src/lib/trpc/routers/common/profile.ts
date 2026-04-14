import { prisma } from "@/lib/prisma";
import { createRouter } from "../../init";
import { commonProcedure } from "../../procedures";

export const profileRouter = createRouter({
    getProfile: commonProcedure.query(async ({ ctx }) => {
        const { session } = ctx;

        let portfolioSlug: string | null = null;
        let isFoundingExpert = false;

        if (session?.user.role === "EXPERT") {
            const expert = await prisma.specialistProfile.findUnique({
                where: { userId: session.user.id },
                select: { slug: true, tier: true },
            });
            if (expert) {
                portfolioSlug = expert.slug;
                isFoundingExpert = expert.tier === "FOUNDING";
            }
        }

        return {
            portfolioSlug,
            isFoundingExpert,
        };
    }),
});
