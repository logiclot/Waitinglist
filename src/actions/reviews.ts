"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import { log } from "@/lib/logger";
import { captureException } from "@/lib/sentry";

const REVIEW_TIMEOUT_DAYS = 14;

// ── Submit seller (expert) review of the buyer ──────────────────────────────────
export async function submitSellerReview(
  orderId: string,
  rating: number,
  comment: string
): Promise<{ success: true } | { error: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Not authenticated" };

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return { error: "Rating must be between 1 and 5" };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        seller: { select: { userId: true, displayName: true } },
        review: true,
      },
    });

    if (!order) return { error: "Order not found" };
    if (order.seller.userId !== session.user.id) return { error: "Unauthorized" };
    if (order.status !== "delivered" && order.status !== "approved") {
      return { error: "Order must be delivered before reviewing" };
    }
    if (!order.review) return { error: "Review record not found" };
    if (order.review.sellerRating !== null) return { error: "You have already submitted a review" };

    await prisma.review.update({
      where: { id: order.review.id },
      data: {
        sellerRating: rating,
        sellerComment: comment.trim() || null,
        sellerSubmittedAt: new Date(),
      },
    });

    // Notify buyer: expert left you a review
    await createNotification(
      order.buyerId,
      `${order.seller.displayName ?? "Your expert"} left you a review!`,
      "Leave your review to see what they wrote.",
      "info",
      `/business/projects?review=${orderId}`
    );

    revalidatePath("/business/projects");
    revalidatePath(`/expert/reviews/${orderId}`);
    return { success: true };
  } catch (err) {
    log.error("reviews.submit_seller_failed", { err: String(err), orderId });
    captureException(err, { context: "submitSellerReview" });
    return { error: "Failed to submit review" };
  }
}

// ── Submit buyer review of the seller (expert) ──────────────────────────────────
export async function submitBuyerReview(
  orderId: string,
  rating: number,
  comment: string
): Promise<{ success: true } | { error: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { error: "Not authenticated" };

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return { error: "Rating must be between 1 and 5" };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        seller: { select: { userId: true, displayName: true, id: true } },
        review: true,
      },
    });

    if (!order) return { error: "Order not found" };
    if (order.buyerId !== session.user.id) return { error: "Unauthorized" };
    if (order.status !== "delivered" && order.status !== "approved") {
      return { error: "Order must be delivered before reviewing" };
    }
    if (!order.review) return { error: "Review record not found" };
    if (order.review.buyerRating !== null) return { error: "You have already submitted a review" };

    const sellerAlsoReviewed = order.review.sellerRating !== null;
    const shouldUnblind = sellerAlsoReviewed;

    await prisma.$transaction([
      prisma.review.update({
        where: { id: order.review.id },
        data: {
          buyerRating: rating,
          buyerComment: comment.trim() || null,
          buyerSubmittedAt: new Date(),
          ...(shouldUnblind
            ? { unblindedAt: new Date() }
            : {}),
        },
      }),
      // Transition order to approved
      prisma.order.update({
        where: { id: orderId },
        data: { status: "approved", approvedAt: new Date() },
      }),
    ]);

    if (shouldUnblind) {
      // Notify both parties that reviews are visible
      await Promise.all([
        createNotification(
          order.buyerId,
          "Reviews are now visible!",
          "Both reviews have been submitted. You can now see your expert's feedback.",
          "success",
          `/business/projects?review=${orderId}`
        ),
        createNotification(
          order.seller.userId,
          "Reviews are now visible!",
          "Both reviews have been submitted. You can now see your client's feedback.",
          "success",
          `/expert/reviews/${orderId}`
        ),
      ]);
    }

    revalidatePath("/business/projects");
    revalidatePath(`/expert/reviews/${orderId}`);
    revalidatePath(`/p`); // Revalidate public profiles
    return { success: true };
  } catch (err) {
    log.error("reviews.submit_buyer_failed", { err: String(err), orderId });
    captureException(err, { context: "submitBuyerReview" });
    return { error: "Failed to submit review" };
  }
}

// ── Get review for an order (with visibility rules) ─────────────────────────────
export interface ReviewData {
  id: string;
  orderId: string;
  sellerRating: number | null;
  sellerComment: string | null;
  sellerSubmittedAt: string | null;
  buyerRating: number | null;
  buyerComment: string | null;
  buyerSubmittedAt: string | null;
  isUnblinded: boolean; // derived: unblindedAt !== null
  createdAt: string;
}

export async function getReviewForOrder(
  orderId: string
): Promise<{ review: ReviewData | null; role: "buyer" | "seller" | null; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { review: null, role: null, error: "Not authenticated" };

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        seller: { select: { userId: true } },
        review: true,
      },
    });

    if (!order) return { review: null, role: null, error: "Order not found" };

    const isBuyer = order.buyerId === session.user.id;
    const isSeller = order.seller.userId === session.user.id;

    if (!isBuyer && !isSeller) return { review: null, role: null, error: "Unauthorized" };

    if (!order.review) return { review: null, role: isBuyer ? "buyer" : "seller" };

    const review = order.review;
    const role = isBuyer ? "buyer" : "seller";

    // Check 14-day timeout for auto-unblinding
    const now = new Date();
    let effectivelyUnblinded = review.unblindedAt !== null;

    // If seller reviewed but buyer hasn't after 14 days → auto-unblind seller's review
    if (
      !effectivelyUnblinded &&
      review.sellerSubmittedAt &&
      !review.buyerSubmittedAt
    ) {
      const daysSinceSellerReview = (now.getTime() - new Date(review.sellerSubmittedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceSellerReview >= REVIEW_TIMEOUT_DAYS) {
        effectivelyUnblinded = true;
        // Persist the auto-unblind
        await prisma.review.update({
          where: { id: review.id },
          data: { unblindedAt: now },
        });
      }
    }

    // If seller hasn't reviewed after 14 days → buyer can review independently
    const sellerTimedOut =
      !review.sellerSubmittedAt &&
      (now.getTime() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24) >= REVIEW_TIMEOUT_DAYS;

    // Build the response with visibility rules
    const reviewData: ReviewData = {
      id: review.id,
      orderId: review.orderId,
      sellerRating: null,
      sellerComment: null,
      sellerSubmittedAt: null,
      buyerRating: null,
      buyerComment: null,
      buyerSubmittedAt: null,
      isUnblinded: effectivelyUnblinded,
      createdAt: review.createdAt.toISOString(),
    };

    // Seller always sees own review
    if (isSeller && review.sellerRating !== null) {
      reviewData.sellerRating = review.sellerRating;
      reviewData.sellerComment = review.sellerComment;
      reviewData.sellerSubmittedAt = review.sellerSubmittedAt?.toISOString() ?? null;
    }

    // Buyer always sees own review
    if (isBuyer && review.buyerRating !== null) {
      reviewData.buyerRating = review.buyerRating;
      reviewData.buyerComment = review.buyerComment;
      reviewData.buyerSubmittedAt = review.buyerSubmittedAt?.toISOString() ?? null;
    }

    // Cross-visibility: only if unblinded
    if (effectivelyUnblinded || sellerTimedOut) {
      if (isBuyer && review.sellerRating !== null) {
        reviewData.sellerRating = review.sellerRating;
        reviewData.sellerComment = review.sellerComment;
        reviewData.sellerSubmittedAt = review.sellerSubmittedAt?.toISOString() ?? null;
      }
      if (isSeller && review.buyerRating !== null) {
        reviewData.buyerRating = review.buyerRating;
        reviewData.buyerComment = review.buyerComment;
        reviewData.buyerSubmittedAt = review.buyerSubmittedAt?.toISOString() ?? null;
      }
    }

    // Let the buyer know the seller has submitted (without revealing content)
    if (isBuyer && !effectivelyUnblinded && review.sellerSubmittedAt) {
      reviewData.sellerSubmittedAt = review.sellerSubmittedAt.toISOString();
    }

    // Let the seller know the buyer has submitted (without revealing content)
    if (isSeller && !effectivelyUnblinded && review.buyerSubmittedAt) {
      reviewData.buyerSubmittedAt = review.buyerSubmittedAt.toISOString();
    }

    return { review: reviewData, role };
  } catch (err) {
    log.error("reviews.get_failed", { err: String(err), orderId });
    captureException(err, { context: "getReviewForOrder" });
    return { review: null, role: null, error: "Failed to load review" };
  }
}

// ── Get public reviews for an expert ─────────────────────────────────────────────
export interface PublicReview {
  buyerRating: number;
  buyerComment: string | null;
  buyerSubmittedAt: string;
  orderTitle: string | null;
}

export async function getExpertPublicReviews(specialistId: string): Promise<{
  reviews: PublicReview[];
  averageRating: number;
  totalCount: number;
}> {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        unblindedAt: { not: null },
        buyerRating: { not: null },
        order: {
          sellerId: specialistId,
          status: { in: ["approved", "delivered"] },
        },
      },
      include: {
        order: {
          select: {
            solution: { select: { title: true } },
          },
        },
      },
      orderBy: { buyerSubmittedAt: "desc" },
    });

    const publicReviews: PublicReview[] = reviews.map((r) => ({
      buyerRating: r.buyerRating!,
      buyerComment: r.buyerComment,
      buyerSubmittedAt: r.buyerSubmittedAt!.toISOString(),
      orderTitle: r.order.solution?.title ?? null,
    }));

    const totalCount = publicReviews.length;
    const averageRating =
      totalCount > 0
        ? publicReviews.reduce((sum, r) => sum + r.buyerRating, 0) / totalCount
        : 0;

    return { reviews: publicReviews, averageRating, totalCount };
  } catch (err) {
    log.error("reviews.get_public_failed", { err: String(err), specialistId });
    captureException(err, { context: "getExpertPublicReviews" });
    return { reviews: [], averageRating: 0, totalCount: 0 };
  }
}
