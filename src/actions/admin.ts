"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { getCommissionPercent } from "@/lib/commission";
import { createNotification } from "@/lib/notifications";
import { DISCOVERY_SCAN_PRICE_CENTS, CUSTOM_PROJECT_PRICE_CENTS } from "@/lib/pricing-config";
import { APP_URL } from "@/lib/app-url";
import { log } from "@/lib/logger";
import { captureException } from "@/lib/sentry";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { resend } from "@/lib/resend";
import { welcomeEmail } from "@/lib/email-templates";
import { fireBusinessOnboardingNotifications } from "@/lib/onboarding-notifications";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "ADMIN";
}

export async function getAdminData() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  const [experts, solutions, orders, businesses, userCount] = await Promise.all([
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
  ]);

  // Bid quality stats per expert (thumbs up / down counts)
  const bidFeedbackRaw = await prisma.bid.groupBy({
    by: ["specialistId", "feedback"],
    where: { feedback: { not: null } },
    _count: { feedback: true },
  });
  const bidQualityMap: Record<string, { up: number; down: number }> = {};
  for (const row of bidFeedbackRaw) {
    if (!bidQualityMap[row.specialistId]) bidQualityMap[row.specialistId] = { up: 0, down: 0 };
    if (row.feedback === "up")   bidQualityMap[row.specialistId].up   += row._count.feedback;
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

  const openDisputeCount = await prisma.dispute.count({
    where: { status: { not: "resolved" } },
  });

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

  const updates: { status: "APPROVED"; tier?: "PROVEN"; platformFeePercentage?: number } = { status: "APPROVED" };
  if (grantProven && existing?.tier === "STANDARD") {
    updates.tier = "PROVEN";
    updates.platformFeePercentage = 13;
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
    "You're approved!",
    message,
    "success",
    "/jobs"
  );

  revalidatePath("/admin");
  return { success: true };
}

export async function suspendSpecialist(id: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.specialistProfile.update({
    where: { id },
    data: { status: "SUSPENDED" }
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function verifySpecialist(id: string, verified: boolean) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.specialistProfile.update({
    where: { id },
    data: { verified }
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function makeFoundingSpecialist(id: string, rank: number) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.specialistProfile.update({
    where: { id },
    data: { isFoundingExpert: true, foundingRank: rank, platformFeePercentage: 11 },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function removeFoundingExpert(id: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.specialistProfile.update({
    where: { id },
    data: { isFoundingExpert: false, foundingRank: null },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function setExpertFee(id: string, fee: number) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.specialistProfile.update({
    where: { id },
    data: { platformFeePercentage: fee },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function setExpertTier(id: string, tier: "STANDARD" | "PROVEN" | "ELITE") {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.specialistProfile.update({
    where: { id },
    data: { tier },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeleteUser(userId: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeleteSolution(solutionId: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.solution.delete({ where: { id: solutionId } });
  revalidatePath("/admin");
  return { success: true };
}

export async function adminDeleteOrder(orderId: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.order.delete({ where: { id: orderId } });
  revalidatePath("/admin");
  return { success: true };
}

export async function liftBidBan(specialistId: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.specialistProfile.update({
    where: { id: specialistId },
    data: { bidBannedUntil: null },
  });
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
    : `Your demo video for "${solution.title}" was not approved.${
        rejectionReason ? ` Reason: ${rejectionReason}` : " Please review our guidelines and resubmit via the solution editor."
      }`;

  await prisma.notification.create({
    data: {
      userId: solution.expert.userId,
      title: approved ? "Demo video approved!" : "Demo video needs revision",
      message,
      type: approved ? "success" : "alert",
      actionUrl: `/expert/solutions/${id}/edit`,
    },
  });

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
  const category    = isDiscovery ? "Discovery Scan" : "Custom Project";
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
  const label       = isDiscovery ? "Discovery Scan — Expert Proposals" : "Custom Project — Expert Proposals";

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
    cancel_url:  `${APP_URL}/jobs/${jobId}?canceled=true`,
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
  resolution: "full_refund" | "release_to_seller" | "partial_refund" | "dismissed",
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
        const expertForCommission: import("@/lib/commission").Expert = {
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
    };

    await Promise.all([
      createNotification(
        order.buyerId,
        "Dispute resolved",
        `${resolutionLabels[resolution]}. ${resolutionNote}`,
        resolution === "full_refund" || resolution === "partial_refund" ? "success" : "info",
        "/business/projects"
      ),
      createNotification(
        order.seller.userId,
        "Dispute resolved",
        `${resolutionLabels[resolution]}. ${resolutionNote}`,
        resolution === "release_to_seller" ? "success" : "info",
        "/dashboard"
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
        subject: "You're all set on LogicLot — here's what to do next",
        html: welcomeEmail({ firstName, role: "business" }),
      }).catch((e) => log.error("admin.welcome_email_failed", { userId: user.id, error: String(e) }));
    }
    fireBusinessOnboardingNotifications(user.id).catch(() => {});

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
    await prisma.$transaction([
      // Nullify any conversation references first (FK constraint)
      prisma.conversation.updateMany({
        where: { jobPostId: jobId },
        data: { jobPostId: null },
      }),
      // Delete the job (bids cascade-delete via schema)
      prisma.jobPost.delete({ where: { id: jobId } }),
    ]);

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
