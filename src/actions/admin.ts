"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { getCommissionPercent, TIER_THRESHOLDS } from "@/lib/commission";
import { createNotification } from "@/lib/notifications";
import { DISCOVERY_SCAN_PRICE_CENTS, CUSTOM_PROJECT_PRICE_CENTS } from "@/lib/pricing-config";
import { APP_URL } from "@/lib/app-url";
import { log } from "@/lib/logger";
import { captureException } from "@/lib/sentry";
import bcrypt from "bcryptjs";
import { randomBytes, randomUUID } from "crypto";
import { resend, getFromEmail } from "@/lib/resend";
import { expertInviteEmail, foundingExpertInviteEmail, welcomeEmail } from "@/lib/email-templates";
import { fireBusinessOnboardingNotifications } from "@/lib/onboarding-notifications";
import { foundingExperts } from "@/data/experts";

const FROM_EMAIL = getFromEmail();

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function getAdminData() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  const [experts, solutions, orders, businesses, userCount, bidFeedbackRaw, openDisputeCount] = await Promise.all([
    prisma.specialistProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true } },
        _count: {
          select: {
            bids: true,
            // Count thumbs-down bids specifically (Prisma doesn't support filtered _count natively,
            // so we fetch and compute below)
          },
        },
      },
    }),
    prisma.solution.findMany({ orderBy: { createdAt: "desc" }, include: { expert: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        solution: { select: { title: true } },
        buyer: { select: { email: true, businessProfile: { select: { firstName: true, companyName: true } } } },
        seller: { select: { displayName: true } },
      },
    }),
    prisma.businessProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, email: true, createdAt: true } } },
    }),
    prisma.user.count(),
    prisma.bid.groupBy({
      by: ["specialistId", "feedback"],
      where: { feedback: { not: null } },
      _count: { feedback: true },
    }),
    prisma.dispute.count({
      where: { status: { not: "resolved" } },
    }),
  ]);
  const bidQualityMap: Record<string, { up: number; down: number }> = {};
  for (const row of bidFeedbackRaw) {
    if (!bidQualityMap[row.specialistId]) bidQualityMap[row.specialistId] = { up: 0, down: 0 };
    if (row.feedback === "up") bidQualityMap[row.specialistId].up += row._count.feedback;
    if (row.feedback === "down") bidQualityMap[row.specialistId].down += row._count.feedback;
  }

  // Attach quality stats to each expert object
  const expertsWithStats = experts.map(e => ({
    ...e,
    bidQuality: bidQualityMap[e.id] ?? { up: 0, down: 0 },
  }));

  const totalRevenueCents = orders
    .filter((o) => ["delivered", "approved"].includes(o.status))
    .reduce((sum, o) => sum + o.priceCents, 0);


  return {
    experts: expertsWithStats,
    solutions,
    orders,
    businesses,
    stats: {
      totalUsers: userCount,
      totalExperts: experts.length,
      totalBusinesses: businesses.length,
      totalSolutions: solutions.length,
      totalOrders: orders.length,
      totalRevenueCents,
      openDisputeCount,
    },
  };
}

export async function approveSpecialist(id: string, grantProven = true) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const existing = await prisma.specialistProfile.findUnique({
    where: { id },
    select: { tier: true },
  });

  const boostUntil = new Date();
  boostUntil.setDate(boostUntil.getDate() + 7);

  const updates: { status: "APPROVED"; tier?: "PROVEN"; newExpertBoostUntil: Date } = {
    status: "APPROVED",
    newExpertBoostUntil: boostUntil,
  };
  if (grantProven && existing?.tier === "STANDARD") {
    updates.tier = "PROVEN";
  }

  const specialist = await prisma.specialistProfile.update({
    where: { id },
    data: updates,
    include: { user: { select: { id: true } } },
  });

  const { createNotification } = await import("@/lib/notifications");
  const message = grantProven
    ? "Your expert profile has been approved. You now have Proven tier — access Discovery Scans and bid on opportunities. Complete 10 projects to unlock Custom Projects."
    : "Your expert profile has been approved. You can now access Discovery Scans (Proven tier) and bid on opportunities — or level up to Elite to unlock Custom Projects.";
  await createNotification(
    specialist.userId,
    "🎉 You're approved!",
    message,
    "success",
    "/jobs"
  );

  revalidatePath("/admin");
  return { success: true };
}

export async function suspendSpecialist(id: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const specialist = await prisma.specialistProfile.update({
    where: { id },
    data: { status: "SUSPENDED" },
    select: { userId: true },
  });

  await createNotification(
    specialist.userId,
    "🚫 Account suspended",
    "Your expert account has been suspended. If you believe this is an error, please contact support.",
    "alert",
  );

  revalidatePath("/admin");
  return { success: true };
}

export async function verifySpecialist(id: string, verified: boolean) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const specialist = await prisma.specialistProfile.update({
    where: { id },
    data: { verified },
    select: { userId: true },
  });

  await createNotification(
    specialist.userId,
    verified ? "✅ Profile verified" : "❌ Verification removed",
    verified
      ? "Your expert profile is now verified. A verified badge will appear on your listings."
      : "Your verified badge has been removed from your profile.",
    verified ? "success" : "info",
    "/dashboard",
  );

  revalidatePath("/admin");
  return { success: true };
}

export async function makeFoundingSpecialist(id: string, rank: number) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const specialist = await prisma.specialistProfile.update({
    where: { id },
    data: { isFoundingExpert: true, foundingRank: rank },
    select: { userId: true },
  });

  await createNotification(
    specialist.userId,
    "🏅 Founding Expert status granted!",
    `You are now Founding Expert #${rank}. You'll enjoy an 11% platform fee for life and a permanent Founding Expert badge on your profile.`,
    "success",
    "/dashboard",
  );

  revalidatePath("/admin");
  return { success: true };
}

export async function removeFoundingExpert(id: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const specialist = await prisma.specialistProfile.update({
    where: { id },
    data: { isFoundingExpert: false },
    select: { userId: true },
  });

  await createNotification(
    specialist.userId,
    "❌ Founding Expert status removed",
    "Your Founding Expert status has been removed. Your platform fee has been adjusted to match your current tier.",
    "alert",
    "/dashboard",
  );

  revalidatePath("/admin");
  return { success: true };
}

export async function setExpertFee(id: string, fee: number) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const specialist = await prisma.specialistProfile.update({
    where: { id },
    data: { commissionOverridePercent: fee, platformFeePercentage: fee },
    select: { userId: true },
  });

  await createNotification(
    specialist.userId,
    "💰 Platform fee updated",
    `Your platform fee has been adjusted to ${fee}%.`,
    "info",
    "/dashboard",
  );

  revalidatePath("/admin");
  return { success: true };
}

export async function setExpertTier(id: string, tier: "STANDARD" | "PROVEN" | "ELITE") {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  // Map tier → its commission rate so the change actually takes effect
  const feeForTier = TIER_THRESHOLDS[tier];

  const specialist = await prisma.specialistProfile.update({
    where: { id },
    data: {
      tier,
      commissionOverridePercent: feeForTier,
      platformFeePercentage: feeForTier,
    },
    select: { userId: true },
  });

  const tierLabels: Record<string, string> = {
    STANDARD: `Standard (${TIER_THRESHOLDS.STANDARD}% fee)`,
    PROVEN: `Proven (${TIER_THRESHOLDS.PROVEN}% fee)`,
    ELITE: `Elite (${TIER_THRESHOLDS.ELITE}% fee)`,
  };

  await createNotification(
    specialist.userId,
    "📊 Expert tier updated",
    `Your tier has been changed to ${tierLabels[tier] ?? tier}.`,
    "info",
    "/dashboard",
  );

  revalidatePath("/admin");
  return { success: true, fee: feeForTier };
}

export async function adminDeleteUser(userId: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeleteSolution(solutionId: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const solution = await prisma.solution.findUnique({
    where: { id: solutionId },
    select: { title: true, expert: { select: { userId: true } } },
  });

  await prisma.solution.delete({ where: { id: solutionId } });

  if (solution) {
    await createNotification(
      solution.expert.userId,
      "🗑️ Solution removed",
      `Your solution "${solution.title}" has been removed by an administrator. Contact support if you have questions.`,
      "alert",
      "/expert/my-solutions",
    );
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeleteOrder(orderId: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      buyerId: true,
      seller: { select: { userId: true } },
      solution: { select: { title: true } },
    },
  });

  await prisma.order.delete({ where: { id: orderId } });

  if (order) {
    const title = order.solution?.title ?? "an order";
    await Promise.all([
      createNotification(
        order.buyerId,
        "🗑️ Order removed",
        `Your order for "${title}" has been removed by an administrator. Contact support if you have questions.`,
        "alert",
        "/business/projects",
      ),
      createNotification(
        order.seller.userId,
        "🗑️ Order removed",
        `An order for "${title}" has been removed by an administrator. Contact support if you have questions.`,
        "alert",
        "/dashboard",
      ),
    ]);
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function liftBidBan(specialistId: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const specialist = await prisma.specialistProfile.update({
    where: { id: specialistId },
    data: { bidBannedUntil: null },
    select: { userId: true },
  });

  await createNotification(
    specialist.userId,
    "✅ Proposal ban lifted",
    "Your proposal ban has been lifted. You can now submit proposals on new projects.",
    "success",
    "/jobs",
  );

  revalidatePath("/admin");
  return { success: true };
}

export async function updateSolutionVideoStatus(
  id: string,
  status: "approved" | "rejected",
  rejectionReason?: string,
) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const solution = await prisma.solution.findUnique({
    where: { id },
    select: { title: true, expert: { select: { userId: true } } },
  });
  if (!solution) return { error: "Solution not found" };

  await prisma.solution.update({
    where: { id },
    data: {
      demoVideoStatus: status,
      demoVideoReviewedAt: status === "approved" ? new Date() : null,
    },
  });

  // Notify the expert
  const approved = status === "approved";
  const message = approved
    ? `Your demo video for "${solution.title}" has been approved and is now live on your listing.`
    : `Your demo video for "${solution.title}" was not approved.${rejectionReason ? ` Reason: ${rejectionReason}` : " Please review our guidelines and resubmit via the solution editor."
    }`;

  await createNotification(
    solution.expert.userId,
    approved ? "🎬 Demo video approved!" : "🎬 Demo video needs revision",
    message,
    approved ? "success" : "alert",
    `/expert/solutions/${id}/edit`,
  );

  revalidatePath("/admin");
  return { success: true };
}

// ─── Post on Behalf of Business ─────────────────────────────────────────────

/** List all business accounts (for the dropdown selector). */
export async function getBusinessAccounts() {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const businesses = await prisma.businessProfile.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      companyName: true,
      stripeCustomerId: true,
      user: { select: { id: true, email: true } },
    },
  });

  return { businesses };
}

/** Create a job post attributed to a specific business (admin only). */
export async function adminPostJobOnBehalf(params: {
  businessUserId: string;
  jobType: "discovery" | "custom";
  title: string;
  goal: string;
  tools?: string[];
}) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const { businessUserId, jobType, title, goal, tools = [] } = params;

  // Verify the target user exists and is a BUSINESS
  const targetUser = await prisma.user.findUnique({
    where: { id: businessUserId },
    select: { id: true, email: true, role: true },
  });

  if (!targetUser || targetUser.role !== "BUSINESS") {
    return { error: "Target user not found or is not a business account." };
  }

  const isDiscovery = jobType === "discovery";
  const category = isDiscovery ? "Discovery Scan" : "Custom Project";
  const budgetRange = isDiscovery ? "€50 (Discovery)" : "€100 (Custom Project)";

  const job = await prisma.jobPost.create({
    data: {
      buyerId: businessUserId,
      title,
      goal,
      category,
      budgetRange,
      timeline: isDiscovery ? "Discovery Phase" : "To be agreed",
      tools,
      status: "pending_payment",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/post-on-behalf");

  return { success: true, jobId: job.id, jobType, category };
}

/** Generate a Stripe Checkout URL for a pending job (admin shares this link with the business). */
export async function adminGeneratePaymentLink(jobId: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const job = await prisma.jobPost.findUnique({
    where: { id: jobId },
    include: { buyer: { select: { email: true } } },
  });

  if (!job) return { error: "Job not found." };
  if (job.status !== "pending_payment") return { error: "Job is not in pending_payment status." };

  const isDiscovery = job.category === "Discovery Scan" || job.category === "Discovery";
  const amountCents = isDiscovery ? DISCOVERY_SCAN_PRICE_CENTS : CUSTOM_PROJECT_PRICE_CENTS;
  const label = isDiscovery ? "Discovery Scan — Expert Proposals" : "Custom Project — Expert Proposals";

  const stripeConfigured = !!process.env.STRIPE_SECRET_KEY?.trim();
  if (!stripeConfigured) {
    // Dev fallback: return a dev URL
    return {
      success: true,
      paymentUrl: `${APP_URL}/api/checkout/post-job?jobId=${jobId}&dev=1`,
      isSimulated: true,
    };
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: job.buyer.email,
    allow_promotion_codes: true,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: label, description: job.title },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${APP_URL}/jobs/${jobId}?paid=true`,
    cancel_url: `${APP_URL}/jobs/${jobId}?canceled=true`,
    metadata: { type: "job_posting", jobId, buyerId: job.buyerId },
  });

  return { success: true, paymentUrl: session.url, isSimulated: false };
}

// ─── Dispute Resolution ──────────────────────────────────────────────────────

export async function getDisputedOrders() {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        include: {
          buyer: {
            select: {
              id: true,
              email: true,
              createdAt: true,
              businessProfile: { select: { companyName: true, firstName: true } },
            },
          },
          seller: {
            select: {
              id: true,
              displayName: true,
              tier: true,
              completedSalesCount: true,
              userId: true,
              user: { select: { email: true, createdAt: true } },
            },
          },
          solution: { select: { title: true } },
          bid: { select: { jobPost: { select: { title: true } } } },
          review: true,
          conversations: { select: { id: true, _count: { select: { messages: true } } } },
        },
      },
    },
  });

  return { disputes };
}

export async function updateDisputeNotes(orderId: string, notes: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.dispute.update({
    where: { orderId },
    data: { adminNotes: notes },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function resolveDispute(
  orderId: string,
  resolution: "full_refund" | "release_to_seller" | "partial_refund" | "dismissed" | "require_revision",
  resolutionNote: string,
  partialAmountCents?: number
) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  try {
    const session = await getServerSession(authOptions);
    const adminUserId = session?.user?.id ?? "admin";

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        seller: {
          select: {
            userId: true, stripeAccountId: true, stripeChargesEnabled: true, displayName: true,
            isFoundingExpert: true, tier: true, completedSalesCount: true,
            commissionOverridePercent: true, platformFeePercentage: true,
          },
        },
        dispute: true,
      },
    });

    if (!order) return { error: "Order not found" };
    if (!order.dispute) return { error: "No dispute found for this order" };
    if (order.dispute.status === "resolved") return { error: "Dispute already resolved" };

    const milestones = (order.milestones as unknown as import("@/types").Milestone[]) || [];
    const escrowedMilestones = milestones
      .map((m, i) => ({ ...m, _idx: i }))
      .filter((m) => m.status === "in_escrow");
    const escrowedCents = escrowedMilestones.reduce((sum, m) => {
      const cents = m.priceCents ?? (m.price ? Math.round(m.price * 100) : 0);
      return sum + cents;
    }, 0);

    let newOrderStatus = order.status;

    // Execute resolution
    if (resolution === "full_refund") {
      // Refund each escrowed milestone against its own PaymentIntent.
      // Multi-milestone orders have separate PaymentIntents per milestone.
      if (escrowedCents > 0) {
        // Group escrowed milestones by PaymentIntent for batched refunds
        const refundsByPI: Record<string, number> = {};
        const milestonesWithoutPI: { title: string; cents: number }[] = [];

        for (const m of escrowedMilestones) {
          const cents = m.priceCents ?? (m.price ? Math.round(m.price * 100) : 0);
          if (cents <= 0) continue;

          // Per-milestone PI (new), then fallback to order-level PI (legacy)
          const pi = m.stripePaymentIntentId || order.stripePaymentIntentId;
          if (pi) {
            refundsByPI[pi] = (refundsByPI[pi] || 0) + cents;
          } else {
            milestonesWithoutPI.push({ title: m.title, cents });
          }
        }

        if (Object.keys(refundsByPI).length === 0 && milestonesWithoutPI.length > 0) {
          log.warn("dispute.refund_no_payment_intents", { orderId, escrowedCents });
          return { error: "No Stripe PaymentIntent on record for any milestone. Refund must be processed manually via Stripe dashboard." };
        }

        // Issue one refund per PaymentIntent
        const failedRefunds: string[] = [];
        for (const [pi, amount] of Object.entries(refundsByPI)) {
          try {
            await stripe.refunds.create({
              payment_intent: pi,
              amount,
              reason: "requested_by_customer",
              metadata: { orderId, resolution: "admin_full_refund" },
            }, {
              idempotencyKey: `refund-full-${orderId}-${pi}`,
            });
          } catch (refundErr) {
            log.warn("dispute.refund_failed_for_pi", { orderId, paymentIntent: pi, amount, error: String(refundErr) });
            failedRefunds.push(`PI ${pi.slice(-8)}: €${(amount / 100).toFixed(2)}`);
          }
        }

        if (milestonesWithoutPI.length > 0) {
          const missingNames = milestonesWithoutPI.map((m) => `"${m.title}"`).join(", ");
          log.warn("dispute.refund_missing_pi_for_milestones", { orderId, milestones: missingNames });
          failedRefunds.push(`No PaymentIntent for: ${missingNames}`);
        }

        if (failedRefunds.length > 0) {
          return { error: `Some refunds failed and need manual processing: ${failedRefunds.join("; ")}` };
        }
      }
      newOrderStatus = "refunded";
    } else if (resolution === "release_to_seller") {
      // Release escrowed funds to seller — apply commission
      if (escrowedCents > 0 && order.seller.stripeAccountId) {
        // Verify the expert's Stripe account can receive transfers
        if (!order.seller.stripeChargesEnabled) {
          return { error: "Expert's Stripe account cannot receive payments. Ask the expert to resolve their Stripe account issues before releasing funds." };
        }
        // Use the canonical commission calculator
        const expertForCommission: import("@/lib/commission").CommissionExpert = {
          id: order.sellerId,
          name: order.seller.displayName || "",
          verified: true,
          founding: false,
          isFoundingExpert: order.seller.isFoundingExpert,
          completed_sales_count: order.seller.completedSalesCount,
          commission_override_percent: order.seller.commissionOverridePercent != null
            ? Number(order.seller.commissionOverridePercent)
            : undefined,
          tools: [],
        };
        const commissionPercent = getCommissionPercent(expertForCommission);
        const platformFee = Math.round(escrowedCents * (commissionPercent / 100));
        const transferAmount = escrowedCents - platformFee;

        try {
          await stripe.transfers.create({
            amount: transferAmount,
            currency: "eur",
            destination: order.seller.stripeAccountId,
            metadata: { orderId, resolution: "admin_release", commissionPercent: String(commissionPercent) },
          }, {
            idempotencyKey: `dispute-release-${orderId}`,
          });
        } catch (transferErr) {
          log.warn("dispute.transfer_failed_will_process_manually", { orderId, escrowedCents, error: String(transferErr) });
          return { error: "Stripe transfer failed. Please process manually via Stripe dashboard." };
        }
      }
      newOrderStatus = "approved";
    } else if (resolution === "partial_refund" && partialAmountCents) {
      // For partial refunds, try per-milestone PIs first, then fall back to order-level PI.
      // Distribute the partial amount across escrowed milestones in order until exhausted.
      let remaining = partialAmountCents;
      const failedRefunds: string[] = [];
      let anyRefundIssued = false;

      for (const m of escrowedMilestones) {
        if (remaining <= 0) break;
        const mCents = m.priceCents ?? (m.price ? Math.round(m.price * 100) : 0);
        if (mCents <= 0) continue;

        const pi = m.stripePaymentIntentId || order.stripePaymentIntentId;
        if (!pi) {
          failedRefunds.push(`No PaymentIntent for "${m.title}"`);
          continue;
        }

        const refundAmount = Math.min(remaining, mCents);
        try {
          await stripe.refunds.create({
            payment_intent: pi,
            amount: refundAmount,
            reason: "requested_by_customer",
            metadata: { orderId, resolution: "admin_partial_refund", milestoneTitle: m.title },
          }, {
            idempotencyKey: `refund-partial-${orderId}-${pi}-${refundAmount}`,
          });
          remaining -= refundAmount;
          anyRefundIssued = true;
        } catch (refundErr) {
          log.warn("dispute.partial_refund_failed_for_pi", { orderId, paymentIntent: pi, amount: refundAmount, error: String(refundErr) });
          failedRefunds.push(`PI ${pi.slice(-8)}: €${(refundAmount / 100).toFixed(2)}`);
        }
      }

      if (!anyRefundIssued) {
        return { error: `Partial refund failed entirely. Process manually via Stripe dashboard. Details: ${failedRefunds.join("; ")}` };
      }
      if (failedRefunds.length > 0) {
        log.warn("dispute.partial_refund_some_failed", { orderId, failedRefunds });
        // Continue — some refunds succeeded. Admin will see in Stripe.
      }
      newOrderStatus = "refunded";
    } else if (resolution === "dismissed") {
      newOrderStatus = "in_progress";
    } else if (resolution === "require_revision") {
      newOrderStatus = "in_progress";
    }

    // Update dispute + order
    await prisma.$transaction([
      prisma.dispute.update({
        where: { orderId },
        data: {
          status: "resolved",
          resolution,
          resolutionNote,
          resolvedBy: adminUserId,
          resolvedAt: new Date(),
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: newOrderStatus,
          ...(newOrderStatus === "refunded" ? { refundedAt: new Date() } : {}),
          ...(newOrderStatus === "approved" ? { approvedAt: new Date() } : {}),
        },
      }),
    ]);

    // Notify both parties
    const resolutionLabels: Record<string, string> = {
      full_refund: "Full refund issued to buyer",
      release_to_seller: "Funds released to expert",
      partial_refund: "Partial refund issued",
      dismissed: "Dispute dismissed — project continues",
      require_revision: "Expert required to make modifications",
    };

    await Promise.all([
      createNotification(
        order.buyerId,
        "⚖️ Dispute resolved",
        `${resolutionLabels[resolution]}. ${resolutionNote}`,
        ["full_refund", "partial_refund"].includes(resolution) ? "success" : "info",
        "/business/projects"
      ),
      createNotification(
        order.seller.userId,
        "⚖️ Dispute resolved",
        `${resolutionLabels[resolution]}. ${resolutionNote}`,
        resolution === "release_to_seller" ? "success" : resolution === "require_revision" ? "alert" : "info",
        "/dashboard/projects"
      ),
    ]);

    revalidatePath("/admin");
    revalidatePath("/business/projects");
    return { success: true };
  } catch (err) {
    log.error("admin.resolve_dispute_failed", { err: String(err), orderId });
    captureException(err, { context: "resolveDispute" });
    return { error: "Failed to resolve dispute" };
  }
}

// ─── Admin Account Creation ──────────────────────────────────────────────────

/** Create a new business account (admin only, pre-verified, no email confirmation needed). */
export async function adminCreateBusinessAccount(params: {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  country: string;
}) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const { email, firstName, lastName, companyName, country } = params;

  if (!email || !firstName || !lastName || !companyName || !country) {
    return { error: "All fields are required." };
  }

  try {
    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    // Generate a random password (the business will use "Forgot Password" to set their own)
    const randomPassword = randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create user + business profile in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash: hashedPassword,
          role: "BUSINESS",
          emailVerifiedAt: new Date(), // Admin-created = pre-verified
          onboardingCompletedAt: new Date(),
        },
      });

      await tx.businessProfile.create({
        data: {
          userId: newUser.id,
          firstName,
          lastName,
          companyName,
          country,
          jobRole: "Admin",
          howHeard: "Admin-enrolled",
          interests: [],
          tools: [],
          businessPrimaryProblems: [],
        },
      });

      return newUser;
    });

    // Fire-and-forget: welcome email + onboarding notifications
    if (FROM_EMAIL) {
      resend.emails.send({
        from: FROM_EMAIL,
        to: user.email,
        subject: "You're all set on LogicLot. Here's what to do next",
        html: welcomeEmail({ firstName, role: "business" }),
        headers: {
          'X-Entity-Ref-ID': randomUUID(),
        }
      }).catch((e) => log.error("admin.welcome_email_failed", { userId: user.id, error: String(e) }));
    }
    fireBusinessOnboardingNotifications(user.id).catch(() => { });

    revalidatePath("/admin");
    revalidatePath("/admin/post-on-behalf");

    return {
      success: true,
      userId: user.id,
      email: user.email,
      firstName,
      lastName,
      companyName,
    };
  } catch (err) {
    log.error("admin.create_business_account_failed", { err: String(err), email });
    captureException(err, { context: "adminCreateBusinessAccount" });
    return { error: "Failed to create business account." };
  }
}

// ─── Admin Job Management ────────────────────────────────────────────────────

/** Delete a job post (admin only). Nullifies conversation FK first. */
export async function adminDeleteJob(jobId: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  try {
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
      select: { title: true, buyerId: true },
    });

    await prisma.$transaction([
      // Nullify any conversation references first (FK constraint)
      prisma.conversation.updateMany({
        where: { jobPostId: jobId },
        data: { jobPostId: null },
      }),
      // Delete the job (bids cascade-delete via schema)
      prisma.jobPost.delete({ where: { id: jobId } }),
    ]);

    if (job) {
      await createNotification(
        job.buyerId,
        "🗑️ Job post removed",
        `Your job post "${job.title}" has been removed by an administrator. Contact support if you have questions.`,
        "alert",
        "/business/projects",
      );
    }

    revalidatePath("/admin");
    revalidatePath("/admin/post-on-behalf");
    return { success: true };
  } catch (err) {
    log.error("admin.delete_job_failed", { err: String(err), jobId });
    captureException(err, { context: "adminDeleteJob" });
    return { error: "Failed to delete job." };
  }
}

/** Update the goal (questionnaire JSON) on a pending job (admin only). */
export async function adminUpdateJobGoal(jobId: string, goalJson: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  try {
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
      select: { id: true, status: true },
    });

    if (!job) return { error: "Job not found." };
    // Allow updating goal in pending_payment status (admin filling out questionnaire)
    if (job.status !== "pending_payment") {
      return { error: "Can only update questionnaire for pending_payment jobs." };
    }

    await prisma.jobPost.update({
      where: { id: jobId },
      data: { goal: goalJson },
    });

    return { success: true };
  } catch (err) {
    log.error("admin.update_job_goal_failed", { err: String(err), jobId });
    captureException(err, { context: "adminUpdateJobGoal" });
    return { error: "Failed to update job questionnaire." };
  }
}

/** Get full job data for the admin questionnaire fill page. */
export async function adminGetJobForFill(jobId: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const job = await prisma.jobPost.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      goal: true,
      category: true,
      status: true,
      tools: true,
      budgetRange: true,
      paidAt: true,
      createdAt: true,
      buyer: {
        select: {
          email: true,
          businessProfile: {
            select: { firstName: true, lastName: true, companyName: true },
          },
        },
      },
    },
  });

  if (!job) return { error: "Job not found." };

  return { success: true, job };
}

/** Fetch all admin-created on-behalf jobs for the dashboard section. */
export async function getAdminPostedJobs() {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const jobs = await prisma.jobPost.findMany({
    where: { category: { in: ["Discovery Scan", "Custom Project"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      paidAt: true,
      createdAt: true,
      buyer: {
        select: {
          email: true,
          businessProfile: {
            select: { firstName: true, lastName: true, companyName: true },
          },
        },
      },
    },
  });

  return { jobs };
}

// ── Audit Quiz Analytics ─────────────────────────────────────────────────────

export async function getAuditAnalytics() {
  if (!(await checkAdmin())) return null;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Fetch 30-day events and all-time completions in parallel
  const [events, allTimeCompletions] = await Promise.all([
    prisma.auditEvent.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: {
        sessionId: true,
        event: true,
        step: true,
        score: true,
        scoreLabel: true,
        createdAt: true,
      },
    }),
    prisma.auditEvent.count({
      where: { event: "quiz_complete" },
    }),
  ]);

  // Group by session
  const sessions = new Map<string, typeof events>();
  for (const e of events) {
    const arr = sessions.get(e.sessionId) ?? [];
    arr.push(e);
    sessions.set(e.sessionId, arr);
  }

  const totalStarts = [...sessions.values()].filter(evts =>
    evts.some(e => e.event === "quiz_start")
  ).length;

  const totalCompletes = [...sessions.values()].filter(evts =>
    evts.some(e => e.event === "quiz_complete")
  ).length;

  const totalEmails = events.filter(e => e.event === "email_sent").length;

  const completionRate = totalStarts > 0
    ? Math.round((totalCompletes / totalStarts) * 100)
    : 0;

  const emailCaptureRate = totalCompletes > 0
    ? Math.round((totalEmails / totalCompletes) * 100)
    : 0;

  // Step drop-off
  const stepCounts = [0, 1, 2, 3, 4].map(stepNum => ({
    step: stepNum,
    count: [...sessions.values()].filter(evts =>
      evts.some(e => e.event === "step_complete" && e.step === stepNum)
    ).length,
  }));

  // Score distribution
  const completionEvents = events.filter(e => e.event === "quiz_complete" && e.score !== null);
  const scoreBuckets = [
    { label: "0-24", min: 0, max: 24, count: 0 },
    { label: "25-44", min: 25, max: 44, count: 0 },
    { label: "45-64", min: 45, max: 64, count: 0 },
    { label: "65-100", min: 65, max: 100, count: 0 },
  ];
  for (const e of completionEvents) {
    const bucket = scoreBuckets.find(b => e.score! >= b.min && e.score! <= b.max);
    if (bucket) bucket.count++;
  }

  // Score label counts
  const scoreLabelCounts: Record<string, number> = {};
  for (const e of completionEvents) {
    if (e.scoreLabel) {
      scoreLabelCounts[e.scoreLabel] = (scoreLabelCounts[e.scoreLabel] ?? 0) + 1;
    }
  }

  // Average score
  const avgScore = completionEvents.length > 0
    ? Math.round(completionEvents.reduce((sum, e) => sum + (e.score ?? 0), 0) / completionEvents.length)
    : 0;


  return {
    totalStarts,
    totalCompletes,
    totalEmails,
    completionRate,
    emailCaptureRate,
    stepCounts,
    scoreBuckets,
    scoreLabelCounts,
    avgScore,
    allTimeCompletions,
    periodDays: 30,
  };
}

export async function getAuditCompletions() {
  if (!(await checkAdmin())) return null;

  const completions = await prisma.auditEvent.findMany({
    where: { event: "quiz_complete" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      sessionId: true,
      score: true,
      scoreLabel: true,
      answers: true,
      createdAt: true,
    },
  });

  // For each completion, find the email (if submitted) from the same session
  const sessionIds = [...new Set(completions.map(c => c.sessionId))];

  const emailEvents =
    sessionIds.length > 0
      ? await prisma.auditEvent.findMany({
        where: {
          sessionId: { in: sessionIds },
          event: "email_sent",
        },
        select: { sessionId: true, email: true },
      })
      : [];

  const emailMap = new Map<string, string>();
  for (const e of emailEvents) {
    if (e.email) emailMap.set(e.sessionId, e.email);
  }

  return completions.map(c => ({
    id: c.id,
    sessionId: c.sessionId,
    score: c.score,
    scoreLabel: c.scoreLabel,
    answers: c.answers,
    email: emailMap.get(c.sessionId) ?? null,
    createdAt: c.createdAt.toISOString(),
  }));
}

// ── Job Analytics (Discovery Scan + Custom Project) ─────────────────────────

export async function getJobAnalytics(category: "Discovery Scan" | "Custom Project") {
  if (!(await checkAdmin())) return null;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);


  // All-time counts and last 30 days jobs (with bids + order info)
  const [allTimePosted, jobs] = await Promise.all([
    prisma.jobPost.count({
      where: { category, status: { not: "draft" } },
    }),
    prisma.jobPost.findMany({
      where: { category, createdAt: { gte: thirtyDaysAgo }, status: { not: "draft" } },
      select: {
        id: true,
        status: true,
        paidAt: true,
        rejectedAt: true,
        rejectionFeedback: true,
        viewCount: true,
        createdAt: true,
        bids: {
          select: { id: true, status: true, feedback: true, createdAt: true },
        },
      },
    }),
  ]);

  // KPIs
  const totalPendingPayment = jobs.filter(j => j.status === "pending_payment").length;
  const totalPaid = jobs.filter(j => j.paidAt).length;
  const totalOpen = jobs.filter(j => j.status === "open" || j.status === "full").length;
  const totalAwarded = jobs.filter(j => j.status === "awarded").length;
  const totalRejected = jobs.filter(j => j.rejectedAt).length;
  const totalClosed = jobs.filter(j => j.status === "closed" || j.status === "cancelled").length;

  // Payment conversion: pending_payment → paid
  const totalCreated = jobs.length;
  const paymentRate = totalCreated > 0 ? Math.round((totalPaid / totalCreated) * 100) : 0;

  // Proposal stats
  const allBids = jobs.flatMap(j => j.bids);
  const totalProposals = allBids.length;
  const jobsWithProposals = jobs.filter(j => j.bids.length > 0).length;
  const proposalCoverage = totalPaid > 0 ? Math.round((jobsWithProposals / totalPaid) * 100) : 0;
  const avgProposalsPerJob = totalPaid > 0
    ? Math.round((totalProposals / totalPaid) * 10) / 10
    : 0;

  // Acceptance rate: awarded / (awarded + rejected)
  const decisionsMade = totalAwarded + totalRejected;
  const acceptanceRate = decisionsMade > 0 ? Math.round((totalAwarded / decisionsMade) * 100) : 0;

  // Proposal feedback (thumbs up/down)
  const thumbsUp = allBids.filter(b => b.feedback === "up").length;
  const thumbsDown = allBids.filter(b => b.feedback === "down").length;

  // Revenue (from paid jobs)
  const priceCents = category === "Discovery Scan" ? DISCOVERY_SCAN_PRICE_CENTS : CUSTOM_PROJECT_PRICE_CENTS;
  const revenue30d = totalPaid * priceCents;

  // Time to first proposal (hours) for paid jobs that have proposals
  const timesToFirstProposal: number[] = [];
  for (const j of jobs) {
    if (j.paidAt && j.bids.length > 0) {
      const firstBid = j.bids.reduce((a, b) => (a.createdAt < b.createdAt ? a : b));
      const hours = (firstBid.createdAt.getTime() - j.paidAt.getTime()) / (1000 * 60 * 60);
      if (hours >= 0) timesToFirstProposal.push(Math.round(hours * 10) / 10);
    }
  }
  const avgTimeToFirstProposal = timesToFirstProposal.length > 0
    ? Math.round(timesToFirstProposal.reduce((a, b) => a + b, 0) / timesToFirstProposal.length * 10) / 10
    : null;

  // Status breakdown for funnel
  const funnel = [
    { label: "Created", count: totalCreated },
    { label: "Paid", count: totalPaid },
    { label: "Got proposals", count: jobsWithProposals },
    { label: "Awarded", count: totalAwarded },
  ];

  return {
    category,
    totalCreated,
    totalPaid,
    totalOpen,
    totalAwarded,
    totalRejected,
    totalClosed,
    totalPendingPayment,
    paymentRate,
    totalProposals,
    proposalCoverage,
    avgProposalsPerJob,
    acceptanceRate,
    thumbsUp,
    thumbsDown,
    revenue30d,
    priceCents,
    avgTimeToFirstProposal,
    funnel,
    allTimePosted,
    periodDays: 30,
  };
}

// ── Traffic Analytics ──────────────────────────────────────────────────────────

export async function getTrafficAnalytics() {
  if (!(await checkAdmin())) return null;

  const now = new Date();
  const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const views = await prisma.pageView.findMany({
    where: { createdAt: { gte: since } },
    select: { sessionId: true, pathname: true, referrer: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  // Group by session
  const sessions = new Map<string, { pathname: string; referrer: string | null; createdAt: Date }[]>();
  for (const v of views) {
    const list = sessions.get(v.sessionId) || [];
    list.push(v);
    sessions.set(v.sessionId, list);
  }

  // Entry pages (first hit per session)
  const entryCounts = new Map<string, number>();
  // Exit pages (last hit per session)
  const exitCounts = new Map<string, number>();
  // All page hits
  const pageCounts = new Map<string, number>();
  // External referrers
  const referrerCounts = new Map<string, number>();
  // Daily views
  const dailyViews = new Map<string, number>();

  for (const [, hits] of sessions) {
    const entry = hits[0].pathname;
    const exit = hits[hits.length - 1].pathname;
    entryCounts.set(entry, (entryCounts.get(entry) || 0) + 1);
    exitCounts.set(exit, (exitCounts.get(exit) || 0) + 1);

    // External referrer (only on first hit of session)
    const ref = hits[0].referrer;
    if (ref) {
      try {
        const host = new URL(ref).hostname;
        referrerCounts.set(host, (referrerCounts.get(host) || 0) + 1);
      } catch {
        // invalid URL, skip
      }
    }

    for (const h of hits) {
      pageCounts.set(h.pathname, (pageCounts.get(h.pathname) || 0) + 1);
      const day = h.createdAt.toISOString().slice(0, 10);
      dailyViews.set(day, (dailyViews.get(day) || 0) + 1);
    }
  }

  const toSorted = (m: Map<string, number>) =>
    [...m.entries()].sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));

  return {
    totalViews: views.length,
    totalSessions: sessions.size,
    avgPagesPerSession: sessions.size > 0 ? Math.round((views.length / sessions.size) * 10) / 10 : 0,
    topPages: toSorted(pageCounts).slice(0, 15),
    topEntryPages: toSorted(entryCounts).slice(0, 10),
    topExitPages: toSorted(exitCounts).slice(0, 10),
    topReferrers: toSorted(referrerCounts).slice(0, 10),
    dailyViews: [...dailyViews.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count })),
    periodDays: 30,
  };
}

// ── Elite Application Management ──────────────────────────────────────────────

export async function getEliteApplications() {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const applications = await prisma.specialistProfile.findMany({
    where: { eliteApplicationStatus: "pending" },
    orderBy: { eliteAppliedAt: "asc" },
    select: {
      id: true,
      displayName: true,
      legalFullName: true,
      tier: true,
      completedSalesCount: true,
      eliteAppliedAt: true,
      eliteApplicationStatus: true,
      isFoundingExpert: true,
      tools: true,
      user: { select: { id: true, email: true } },
    },
  });

  return { applications };
}

export async function approveEliteApplication(expertId: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  const profile = await prisma.specialistProfile.findUnique({
    where: { id: expertId },
    select: { userId: true, eliteApplicationStatus: true, isFoundingExpert: true },
  });

  if (!profile) return { error: "Expert not found" };
  if (profile.eliteApplicationStatus !== "pending") return { error: "No pending application" };

  const feePercent = profile.isFoundingExpert ? TIER_THRESHOLDS.FOUNDING : TIER_THRESHOLDS.ELITE;

  await prisma.specialistProfile.update({
    where: { id: expertId },
    data: {
      tier: "ELITE",
      eliteApplicationStatus: "approved",
      platformFeePercentage: feePercent,
    },
  });

  await createNotification(
    profile.userId,
    "🏆 Welcome to Elite!",
    `Your Elite application has been approved. Your commission rate is now ${feePercent}%. You have priority placement and the lowest fees on the platform.`,
    "success",
    "/dashboard",
  );

  revalidatePath("/admin");
  return { success: true };
}

export async function denyEliteApplication(expertId: string, reason: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };
  if (!reason || reason.trim().length < 10) return { error: "Please provide a reason (min 10 characters)" };

  const profile = await prisma.specialistProfile.findUnique({
    where: { id: expertId },
    select: { userId: true, eliteApplicationStatus: true },
  });

  if (!profile) return { error: "Expert not found" };
  if (profile.eliteApplicationStatus !== "pending") return { error: "No pending application" };

  await prisma.specialistProfile.update({
    where: { id: expertId },
    data: {
      eliteApplicationStatus: "denied",
      eliteDeniedAt: new Date(),
      eliteDeniedReason: reason.trim(),
    },
  });

  await createNotification(
    profile.userId,
    "Elite application update",
    `Your Elite application was not approved at this time. Reason: ${reason.trim()}. You can re-apply after 14 days.`,
    "info",
    "/dashboard",
  );

  revalidatePath("/admin");
  return { success: true };
}

export async function demoteFromElite(expertId: string, reason: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };
  if (!reason || reason.trim().length < 10) return { error: "Please provide a reason (min 10 characters)" };

  const profile = await prisma.specialistProfile.findUnique({
    where: { id: expertId },
    select: { userId: true, tier: true, isFoundingExpert: true },
  });

  if (!profile) return { error: "Expert not found" };
  if (profile.tier !== "ELITE") return { error: "Expert is not Elite" };

  const feePercent = profile.isFoundingExpert ? TIER_THRESHOLDS.FOUNDING : TIER_THRESHOLDS.PROVEN;

  await prisma.specialistProfile.update({
    where: { id: expertId },
    data: {
      tier: "PROVEN",
      eliteApplicationStatus: null,
      eliteDemotedAt: new Date(),
      eliteDemotedReason: reason.trim(),
      platformFeePercentage: feePercent,
    },
  });

  await createNotification(
    profile.userId,
    "Tier update: Proven",
    `Your tier has been changed from Elite to Proven. Reason: ${reason.trim()}. Your commission rate is now ${feePercent}%. You can re-apply for Elite after 14 days.`,
    "alert",
    "/dashboard",
  );

  revalidatePath("/admin");
  return { success: true };
}

// ── Send Expert Invites (manual trigger only) ────────────────────────────────

export async function sendExpertInvites() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return { error: "Not authorized" }

  const pending = await prisma.waitlistSignup.findMany({
    where: {
      role: "expert",
      inviteSentAt: null,
    },
    orderBy: { createdAt: "asc" },
  });

  if (pending.length === 0) return { sent: 0 };


  const FROM_EMAIL = getFromEmail();
  if (!FROM_EMAIL) return { error: "RESEND_FROM_EMAIL not configured" };

  let sent = 0;
  const errors: string[] = [];

  for (const entry of pending) {
    try {
      const token = randomBytes(32).toString("hex");

      const isFoundingExpert = foundingExperts.includes(entry.email)

      await prisma.waitlistSignup.update({
        where: { id: entry.id },
        data: { inviteToken: token, inviteSentAt: new Date() },
      });

      const inviteUrl = `${APP_URL}/auth/sign-up?invite=${token}`;

      await resend.emails.send({
        from: FROM_EMAIL,
        to: entry.email,
        subject: isFoundingExpert ? "You're a LogicLot Founding Expert" : "You're invited to LogicLot",
        html: isFoundingExpert
          ? foundingExpertInviteEmail({ name: entry.fullName, inviteUrl })
          : expertInviteEmail({ name: entry.fullName, inviteUrl }),
        headers: {
          'X-Entity-Ref-ID': randomUUID(),
        }
      });

      sent++;
    } catch (err) {
      log.error("admin.invite_send_failed", { email: entry.email, error: String(err) });
      captureException(err instanceof Error ? err : new Error(String(err)));
      errors.push(entry.email);
    }
  }

  revalidatePath("/admin");
  return { sent, errors: errors.length > 0 ? errors : undefined };
}

export async function getWaitlistInviteStats() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return null;

  const [pendingCount, sentCount, usedCount] = await Promise.all([
    prisma.waitlistSignup.count({ where: { inviteSentAt: null, inviteToken: null, role: "expert" } }),
    prisma.waitlistSignup.count({ where: { inviteSentAt: { not: null }, usedAt: null } }),
    prisma.waitlistSignup.count({ where: { usedAt: { not: null } } }),
  ]);

  return { pendingCount, sentCount, usedCount };
}
