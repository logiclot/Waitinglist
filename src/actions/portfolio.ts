"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isValidBackground, isValidBorderColor, isValidFont, isValidCoverUrl, isValidBackgroundColor, isValidPatternColor } from "@/lib/portfolio-customization";
import { getSupabaseAdmin } from "@/lib/supabase";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

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

  // Sort solutions: featured first, then publishedAt desc (already ordered by query)
  const featured = new Set(expert.featuredSolutionIds);
  const sortedSolutions = [...expert.solutions].sort((a, b) => {
    const aF = featured.has(a.id) ? 0 : 1;
    const bF = featured.has(b.id) ? 0 : 1;
    return aF - bF;
  });

  return {
    id: expert.id,
    userId: expert.userId,
    slug: expert.slug,
    displayName: expert.displayName,
    bio: expert.bio,
    tools: expert.tools,
    specialties: expert.specialties,
    tier: expert.tier as "STANDARD" | "PROVEN" | "ELITE" | "FOUNDING",
    isFoundingExpert: expert.isFoundingExpert,
    profileImageUrl: expert.user?.profileImageUrl ?? null,
    solutions: sortedSolutions,
    featuredSolutionIds: expert.featuredSolutionIds,
    portfolioViewCount: expert.portfolioViewCount,
    portfolioBackground: expert.portfolioBackground,
    portfolioBorderColor: expert.portfolioBorderColor,
    portfolioFont: expert.portfolioFont,
    portfolioCoverImage: expert.portfolioCoverImage,
    portfolioBackgroundColor: expert.portfolioBackgroundColor,
    portfolioPatternColor: expert.portfolioPatternColor,
  };
}

export async function updatePortfolioCustomization(data: {
  bio?: string | null;
  portfolioBackground?: string | null;
  portfolioBorderColor?: string | null;
  portfolioFont?: string | null;
  portfolioCoverImage?: string | null;
  portfolioBackgroundColor?: string | null;
  portfolioPatternColor?: string | null;
}): Promise<{ success: true } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  if (data.bio !== undefined && data.bio !== null) {
    if (typeof data.bio !== "string" || data.bio.length > 500) {
      return { error: "Bio must be 500 characters or fewer" };
    }
  }
  if (data.portfolioBackground != null && !isValidBackground(data.portfolioBackground)) {
    return { error: "Invalid background template" };
  }
  if (data.portfolioBorderColor != null && !isValidBorderColor(data.portfolioBorderColor)) {
    return { error: "Invalid border color" };
  }
  if (data.portfolioFont != null && !isValidFont(data.portfolioFont)) {
    return { error: "Invalid font selection" };
  }
  if (data.portfolioCoverImage != null && !isValidCoverUrl(data.portfolioCoverImage)) {
    return { error: "Invalid cover image URL" };
  }
  if (data.portfolioBackgroundColor != null && !isValidBackgroundColor(data.portfolioBackgroundColor)) {
    return { error: "Invalid background color" };
  }
  if (data.portfolioPatternColor != null && !isValidPatternColor(data.portfolioPatternColor)) {
    return { error: "Invalid pattern color" };
  }

  try {
    // If cover image is being removed (set to null), delete the old file from storage
    if (data.portfolioCoverImage === null) {
      const existing = await prisma.specialistProfile.findUnique({
        where: { userId: session.user.id },
        select: { portfolioCoverImage: true },
      });
      if (existing?.portfolioCoverImage) {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          const bucketPrefix = "/storage/v1/object/public/covers/";
          const idx = existing.portfolioCoverImage.indexOf(bucketPrefix);
          if (idx !== -1) {
            const oldPath = decodeURIComponent(
              existing.portfolioCoverImage.substring(idx + bucketPrefix.length)
            );
            await supabase.storage.from("covers").remove([oldPath]).catch((e) => {
              log.error("portfolio.cover_cleanup_failed", { error: String(e) });
            });
          }
        }
      }
    }

    const expert = await prisma.specialistProfile.update({
      where: { userId: session.user.id },
      data: {
        ...(data.bio !== undefined ? { bio: data.bio || null } : {}),
        portfolioBackground: data.portfolioBackground ?? null,
        portfolioBorderColor: data.portfolioBorderColor ?? null,
        portfolioFont: data.portfolioFont ?? null,
        portfolioCoverImage: data.portfolioCoverImage ?? null,
        portfolioBackgroundColor: data.portfolioBackgroundColor ?? null,
        portfolioPatternColor: data.portfolioPatternColor ?? null,
      },
      select: { slug: true },
    });

    if (expert.slug) {
      revalidatePath(`/p/${expert.slug}`);
    }
    return { success: true };
  } catch (e) {
    log.error("portfolio.update_customization_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to save portfolio customization" };
  }
}

export async function updateFeaturedSolutions(
  solutionIds: string[]
): Promise<{ success: true } | { error: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  if (solutionIds.length > 3) {
    return { error: "You can feature up to 3 solutions" };
  }

  try {
    const profile = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        slug: true,
        solutions: {
          where: { status: "published" },
          select: { id: true },
        },
      },
    });
    if (!profile) return { error: "Profile not found" };

    const ownedIds = new Set(profile.solutions.map((s) => s.id));
    for (const id of solutionIds) {
      if (!ownedIds.has(id)) return { error: "Invalid solution ID" };
    }

    await prisma.specialistProfile.update({
      where: { id: profile.id },
      data: { featuredSolutionIds: solutionIds },
    });

    if (profile.slug) revalidatePath(`/p/${profile.slug}`);
    return { success: true };
  } catch (e) {
    log.error("portfolio.update_featured_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to update featured solutions" };
  }
}
