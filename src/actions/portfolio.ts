"use server";

import { prisma } from "@/lib/prisma";

export async function getExpertPortfolio(slug: string) {
  const expert = await prisma.specialistProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { profileImageUrl: true, email: true } },
      solutions: {
        where: {
          status: "published",
          moderationStatus: { in: ["auto_approved", "approved"] },
        },
        select: {
          id: true,
          title: true,
          shortSummary: true,
          category: true,
          integrations: true,
          implementationPriceCents: true,
          deliveryDays: true,
          slug: true,
        },
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  if (!expert || expert.status !== "APPROVED") return null;

  return {
    id: expert.id,
    slug: expert.slug,
    displayName: expert.displayName,
    bio: expert.bio,
    tools: expert.tools,
    specialties: expert.specialties,
    tier: expert.tier as "STANDARD" | "PROVEN" | "ELITE",
    isFoundingExpert: expert.isFoundingExpert,
    calendarUrl: expert.calendarUrl,
    profileImageUrl: expert.user?.profileImageUrl ?? null,
    solutions: expert.solutions,
  };
}
