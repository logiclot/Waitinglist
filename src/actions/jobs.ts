"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";
import { maxProposalsForCategory } from "@/lib/job-config";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";
import { stripe } from "@/lib/stripe";

export async function createJobPost(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "BUSINESS") {
    return { error: "Unauthorized. Only businesses can post jobs." };
  }

  const title = formData.get("title") as string;
  const goal = formData.get("goal") as string;
  const category = formData.get("category") as string;
  const budgetRange = formData.get("budgetRange") as string;
  const timeline = formData.get("timeline") as string;
  const toolsRaw = formData.get("tools") as string; // Comma separated

  if (!title || !goal || !category || !budgetRange || !timeline) {
    return { error: "All required fields must be filled." };
  }

  const tools = toolsRaw ? toolsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [];

  try {
    const job = await prisma.jobPost.create({
      data: {
        buyerId: session.user.id,
        title,
        goal,
        category,
        budgetRange,
        timeline,
        tools,
        status: "pending_payment",
      },
    });

    return { success: true, jobId: job.id };
  } catch (e) {
    log.error("jobs.create_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to create job post." };
  }
}

export async function createDiscoveryJobPost(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "BUSINESS") {
    return { success: false, error: "Unauthorized. Only businesses can post jobs." };
  }

  // Accepts the same fields as createJobPost — wizard now sends goal as BriefV2 JSON
  const title = formData.get("title") as string;
  const goal  = formData.get("goal")  as string;
  const toolsRaw = formData.get("tools") as string;

  if (!title || !goal) {
    return { success: false, error: "Missing required fields." };
  }

  const tools = toolsRaw ? toolsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

  try {
    const job = await prisma.jobPost.create({
      data: {
        buyerId: session.user.id,
        title,
        goal,
        category: "Discovery Scan",
        budgetRange: "€50 (Discovery)",
        timeline: "Discovery Phase",
        tools,
        status: "pending_payment", // Payment handled by Stripe checkout
      },
    });

    revalidatePath("/jobs");
    return { success: true, jobId: job.id };
  } catch (e) {
    log.error("jobs.create_discovery_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { success: false, error: "Failed to create discovery post." };
  }
}

// Called by the Stripe webhook (and dev simulate) to activate a job and notify experts
export async function activateJobPost(jobId: string, provider: "stripe" | "simulated" = "stripe") {
  try {
    const job = await prisma.jobPost.update({
      where: { id: jobId },
      data: {
        status: "open",
        paidAt: new Date(),
        paymentProvider: provider,
      },
    });

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/jobs");

    // Notify eligible experts
    const isDiscovery = job.category === "Discovery" || job.category === "Discovery Scan";
    const experts = await prisma.specialistProfile.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { isFoundingExpert: true },
          { tier: "ELITE" },
          // PROVEN experts can see Discovery Scans
          ...(isDiscovery ? [{ tier: "PROVEN" as const }] : []),
        ],
      },
      select: { userId: true },
    });

    Promise.all(experts.map(expert =>
      createNotification(
        expert.userId,
        isDiscovery ? "New Discovery Scan posted" : "New Custom Project posted",
        `${job.title} — ${isDiscovery ? "Up to 5 proposals accepted" : "Up to 3 proposals accepted"}`,
        "info",
        `/jobs/${job.id}`
      )
    )).catch(err => {
      log.error("jobs.expert_notifications_failed", { error: err instanceof Error ? err.message : String(err) });
      Sentry.captureException(err);
    });

    return { success: true };
  } catch (e) {
    log.error("jobs.activate_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { success: false, error: "Failed to activate job." };
  }
}

// Dev/stub fallback — used in local dev when Stripe is not configured
export async function markJobAsPaid(jobId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const job = await prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!job || job.buyerId !== session.user.id) {
      return { error: "Job not found or unauthorized" };
    }

    const result = await activateJobPost(jobId);
    if (!result.success) return { error: result.error ?? "Activation failed" };

    return { success: true };
  } catch (e) {
    log.error("jobs.mark_paid_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Payment failed" };
  }
}

// ── Edit a proposal within the 30-minute editing window ──────────────────────
const PROPOSAL_EDIT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

export async function updateBid(bidId: string, updates: {
  message: string;
  estimatedTime: string;
  priceEstimate: string;
  proposedApproach: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "EXPERT") {
    return { error: "Unauthorized." };
  }

  try {
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { specialist: true, jobPost: { select: { title: true, buyerId: true } } },
    });

    if (!bid) return { error: "Proposal not found." };
    if (bid.specialist.userId !== session.user.id) return { error: "You can only edit your own proposals." };

    const editableUntil = new Date(bid.createdAt.getTime() + PROPOSAL_EDIT_WINDOW_MS);
    if (new Date() > editableUntil) {
      return { error: "The 30-minute editing window has closed. Your proposal is now locked." };
    }

    await prisma.bid.update({
      where: { id: bidId },
      data: {
        message: updates.message,
        estimatedTime: updates.estimatedTime,
        priceEstimate: updates.priceEstimate,
        proposedApproach: updates.proposedApproach || null,
      },
    });

    revalidatePath(`/jobs/${bid.jobPostId}`);
    return { success: true };
  } catch (e) {
    log.error("jobs.update_bid_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to update proposal." };
  }
}

// ── Bid quality moderation constants ─────────────────────────────────────────
// TODO: These will be used when Bid.feedback/feedbackAt fields are added to schema
const _THUMBS_DOWN_BAN_THRESHOLD = 5;   // ban after this many thumbs-down
const _THUMBS_DOWN_WINDOW_DAYS   = 30;  // sliding window to count thumbs-down in
const _BAN_DURATION_DAYS         = 30;  // how long the ban lasts
void _THUMBS_DOWN_BAN_THRESHOLD; void _THUMBS_DOWN_WINDOW_DAYS; void _BAN_DURATION_DAYS;


export async function submitBid(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "EXPERT") {
    return { error: "You must be signed in as an expert to submit a proposal." };
  }

  const jobId = formData.get("jobId") as string;
  const message = formData.get("message") as string;
  const estimatedTime = formData.get("estimatedTime") as string;
  const priceEstimate = formData.get("priceEstimate") as string;
  const proposedApproach = formData.get("proposedApproach") as string;

  if (!jobId) return { error: "Invalid request — job ID missing." };
  if (!message || !estimatedTime || !priceEstimate) {
    return { error: "Executive summary, timeline, and price are all required." };
  }

  try {
    // ── 1. Load and validate the job ────────────────────────────────────────
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
      select: { id: true, status: true, category: true, buyerId: true, title: true },
    });

    if (!job) {
      return { error: "This project no longer exists." };
    }
    if (job.status === "awarded") {
      return { error: "This project has already been awarded to an expert. No more proposals are being accepted." };
    }
    if (job.status === "closed" || job.status === "cancelled") {
      return { error: "This project has been closed and is no longer accepting proposals." };
    }
    if (job.status !== "open") {
      return { error: "This project is not yet open for proposals." };
    }

    // ── 2. Validate expert profile ───────────────────────────────────────────
    const specialist = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!specialist) {
      return { error: "Expert profile not found. Please complete your profile first." };
    }
    if (specialist.status !== "APPROVED") {
      return { error: "Your profile is pending approval. You'll be able to submit proposals once approved." };
    }
    if (specialist.tier !== "ELITE" && !specialist.isFoundingExpert) {
      return { error: "Only Elite and Founding experts can submit proposals. Deliver great solutions to level up." };
    }

    // ── 2b. Check quality ban ────────────────────────────────────────────────
    if (specialist.bidBannedUntil && specialist.bidBannedUntil > new Date()) {
      const liftDate = specialist.bidBannedUntil.toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      });
      return {
        error: `Your account has been temporarily suspended from submitting proposals due to low-quality submissions that were flagged by multiple clients. This restriction lifts on ${liftDate}. Use this time to refine your approach.`,
      };
    }

    // ── 3. Create bid inside a transaction with a real-time bid count check ──
    // This prevents the race condition where two experts submit the Nth proposal
    // simultaneously and both succeed. The count check + create run atomically.
    const maxBids = maxProposalsForCategory(job.category);

    try {
      await prisma.$transaction(async (tx) => {
        // Re-check within the transaction so no concurrent request sneaks past
        const currentCount = await tx.bid.count({ where: { jobPostId: jobId } });

        if (currentCount >= maxBids) {
          throw new Error(`FULL:${maxBids}`);
        }

        const already = await tx.bid.findUnique({
          where: {
            jobPostId_specialistId: { jobPostId: jobId, specialistId: specialist.id },
          },
        });
        if (already) throw new Error("DUPLICATE");

        await tx.bid.create({
          data: {
            jobPostId: jobId,
            specialistId: specialist.id,
            message,
            estimatedTime,
            priceEstimate,
            proposedApproach: proposedApproach || null,
            status: "submitted",
          },
        });

        // If this bid fills the last slot, mark the job so no new proposals appear
        if (currentCount + 1 >= maxBids) {
          await tx.jobPost.update({
            where: { id: jobId },
            data: { status: "full" },
          });
        }
      });
    } catch (txErr) {
      const msg = txErr instanceof Error ? txErr.message : "";
      if (msg.startsWith("FULL:")) {
        return {
          error: `This project has reached its limit of ${maxBids} proposals and is no longer accepting new ones. Try another project!`,
        };
      }
      if (msg === "DUPLICATE") {
        return { error: "You have already submitted a proposal for this project." };
      }
      throw txErr; // unexpected — let outer catch handle
    }

    // ── 4. Notify buyer ──────────────────────────────────────────────────────
    const newTotal = await prisma.bid.count({ where: { jobPostId: jobId } });
    const isFull = newTotal >= maxBids;

    await createNotification(
      job.buyerId,
      isFull ? "All proposals received — time to choose!" : "New Proposal Received",
      isFull
        ? `"${job.title}" now has all ${maxBids} proposals. Head over to review and accept one.`
        : `An expert submitted a proposal for "${job.title}". ${maxBids - newTotal} slot${maxBids - newTotal === 1 ? "" : "s"} remaining.`,
      isFull ? "success" : "info",
      `/business/proposals/${jobId}`
    );

    revalidatePath(`/jobs/${jobId}`);
    return { success: true };
  } catch (e) {
    log.error("jobs.submit_bid_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function awardBid(jobId: string, bidId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const job = await prisma.jobPost.findUnique({
        where: { id: jobId },
        include: { buyer: true }
    });
    if (!job || job.buyerId !== session.user.id) {
      return { error: "Unauthorized" };
    }

    // Guard against double-award (e.g. two tabs clicking Accept simultaneously)
    if (job.status === "awarded") {
      return { error: "This project has already been awarded. Refresh the page to see the accepted proposal." };
    }
    if (job.status === "cancelled") {
      return { error: "This project has been cancelled and can no longer be awarded." };
    }
    // "closed" and "full" are fine — they just mean no new proposals, not that it can't be awarded

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { specialist: { include: { user: true } } },
    });

    if (!bid) return { error: "Proposal not found." };
    if (bid.status === "accepted") {
      return { error: "This proposal is already accepted." };
    }

    // Parse proposal phases to build milestone payment plan
    interface ProposalPhase {
      name: string;
      scope: string;
      duration: string;
      price?: number; // optional per-phase price in EUR
    }
    interface ProposalJson {
      phases?: ProposalPhase[];
    }

    let proposalData: ProposalJson = {};
    try {
      if (bid.proposedApproach) proposalData = JSON.parse(bid.proposedApproach);
    } catch { /* ignore parse errors */ }

    // Parse total price from priceEstimate string (e.g. "€1,800" or "1800")
    const rawPrice = bid.priceEstimate?.replace(/[^0-9.]/g, "") ?? "0";
    const totalCents = Math.round(parseFloat(rawPrice || "0") * 100);

    // Build ordered milestones from phases
    const phases = proposalData.phases ?? [];
    const milestonesJson = phases.length > 0
      ? phases.map((p, i) => {
          // Use per-phase price if provided, otherwise split evenly
          const phaseCents = p.price
            ? Math.round(p.price * 100)
            : Math.round(totalCents / phases.length);
          return {
            index: i,
            title: p.name,
            description: p.scope,
            duration: p.duration,
            priceCents: phaseCents,
            status: "pending",
            fundedAt: null,
            releasedAt: null,
          };
        })
      : null;

    // Transaction: re-check status atomically, then update job + bid + create order + conversation
    await prisma.$transaction(async (tx) => {
      // Re-read job status inside the transaction to catch races
      const freshJob = await tx.jobPost.findUnique({ where: { id: jobId }, select: { status: true } });
      if (freshJob?.status === "awarded") throw new Error("ALREADY_AWARDED");

      await tx.jobPost.update({
        where: { id: jobId },
        data: { status: "awarded" },
      });

      await tx.bid.update({
        where: { id: bidId },
        data: { status: "accepted" },
      });

      // Create the order linked to this bid, with milestones from proposal phases
      if (!bid.solutionId) throw new Error("BID_MISSING_SOLUTION");
      const order = await tx.order.create({
        data: {
          buyerId: session.user.id!,
          sellerId: bid.specialistId,
          solutionId: bid.solutionId,
          priceCents: totalCents || 0,
          status: "in_progress",
          milestones: milestonesJson ?? undefined,
        },
      });

      // Create conversation linked to both the job and the order
      const conversation = await tx.conversation.create({
        data: {
          buyerId: session.user.id!,
          sellerId: bid.specialistId,
          jobPostId: jobId,
          orderId: order.id,
        },
      });

      // System message showing the agreed milestone plan
      const milestoneLines = milestonesJson
        ? milestonesJson.map((m, i) =>
            `Phase ${i + 1}: ${m.title}${m.duration ? ` (${m.duration})` : ""} — €${(m.priceCents / 100).toLocaleString("de-DE")}`
          ).join("\n")
        : "";

      const body = milestoneLines
        ? `Proposal accepted ✓\n\nAgreed milestone plan:\n${milestoneLines}\n\nTotal: €${(totalCents / 100).toLocaleString("de-DE")}\n\nLet's align on the kick-off. When are you available?`
        : "Proposal accepted ✓ — let's get started! When are you available for a kick-off call?";

      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id!,
          body,
          type: "system",
        },
      });
    });

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath(`/business/proposals/${jobId}`);

    // Notify winning expert
    await createNotification(
      bid.specialist.userId,
      "Your proposal has been accepted!",
      `The client accepted your bid on "${job.title}". A conversation has been opened — introduce yourself and agree on the first steps.`,
      "success",
      `/inbox`
    );

    // Notify other bidders that the job has been awarded (so they don't keep waiting)
    const otherBids = await prisma.bid.findMany({
      where: {
        jobPostId: jobId,
        id: { not: bidId },
        status: "submitted",
      },
      include: { specialist: { select: { userId: true } } },
    });

    await Promise.all(
      otherBids.map((otherBid) => {
        prisma.bid.update({ where: { id: otherBid.id }, data: { status: "rejected" } });
        return createNotification(
          otherBid.specialist.userId,
          "Project awarded to another expert",
          `"${job.title}" has been awarded to another candidate. Keep your proposals sharp — new projects are posted daily.`,
          "info",
          `/jobs`
        );
      })
    );

    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "ALREADY_AWARDED") {
      return { error: "This project has already been awarded. Refresh the page to see the current state." };
    }
    log.error("jobs.award_bid_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to award proposal. Please try again." };
  }
}

// ── Rate a proposal (thumbs up / thumbs down) ─────────────────────────────────
// Only the business that owns the job can rate. Changing an existing vote is
// allowed. Reaching the thumbs-down threshold triggers a temporary bid ban.

export async function rateProposal(
  bidId: string,
  feedback: "up" | "down"
): Promise<{ success: boolean; error?: string; banned?: boolean }> {
  void feedback; // TODO: will be used when Bid.feedback field is added to schema
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "BUSINESS") {
    return { success: false, error: "Only business accounts can rate proposals." };
  }

  try {
    // ── 1. Load the bid + job to verify ownership ────────────────────────────
    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        jobPost: { select: { buyerId: true, id: true } },
        specialist: { select: { id: true, userId: true, displayName: true, bidBannedUntil: true } },
      },
    });

    if (!bid) return { success: false, error: "Proposal not found." };
    if (bid.jobPost.buyerId !== session.user.id) {
      return { success: false, error: "You can only rate proposals on your own projects." };
    }

    // TODO: Bid.feedback and Bid.feedbackAt fields need to be added to the schema
    // For now, only handle the ban logic based on bidBannedUntil
    const banned = false;

    revalidatePath(`/business/proposals/${bid.jobPost.id}`);
    return { success: true, banned };
  } catch (e) {
    log.error("jobs.rate_proposal_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { success: false, error: "Failed to save feedback. Please try again." };
  }
}

// ── Reject all proposals and refund 75% (Custom Projects only) ──────────────

const CUSTOM_PROJECT_REFUND_CENTS = 7500; // 75% of €100 posting fee

export async function rejectAllBidsAndRefund(
  jobId: string,
  feedback: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "BUSINESS") {
    return { success: false, error: "Only business accounts can reject proposals." };
  }

  if (!feedback || feedback.trim().length < 20) {
    return { success: false, error: "Please provide feedback (at least 20 characters) so we can improve expert quality." };
  }

  try {
    const job = await prisma.jobPost.findUnique({
      where: { id: jobId },
      include: {
        bids: {
          where: { status: "submitted" },
          include: { specialist: { select: { userId: true } } },
        },
      },
    });

    if (!job) return { success: false, error: "Project not found." };
    if (job.buyerId !== session.user.id) return { success: false, error: "Unauthorized." };

    // Only custom projects — not discovery scans
    const isDiscovery = job.category === "Discovery" || job.category === "Discovery Scan";
    if (isDiscovery) {
      return { success: false, error: "Refunds are only available for Custom Projects." };
    }

    if (job.status === "awarded") {
      return { success: false, error: "This project has already been awarded." };
    }
    if (job.status === "cancelled" || job.status === "closed") {
      return { success: false, error: "This project is already closed." };
    }

    if (job.bids.length === 0) {
      return { success: false, error: "No proposals to reject." };
    }

    // Transaction: reject all bids + close job
    await prisma.$transaction(async (tx) => {
      // Reject all submitted bids
      await tx.bid.updateMany({
        where: { jobPostId: jobId, status: "submitted" },
        data: { status: "rejected" },
      });

      // Also reject shortlisted bids
      await tx.bid.updateMany({
        where: { jobPostId: jobId, status: "shortlisted" },
        data: { status: "rejected" },
      });

      // Close the job with feedback
      await tx.jobPost.update({
        where: { id: jobId },
        data: {
          status: "closed",
          rejectionFeedback: feedback.trim(),
          rejectedAt: new Date(),
        },
      });
    });

    // Issue 75% refund via Stripe
    if (job.paymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: job.paymentIntentId,
          amount: CUSTOM_PROJECT_REFUND_CENTS,
        });
      } catch (refundErr) {
        log.error("jobs.refund_failed", {
          error: refundErr instanceof Error ? refundErr.message : String(refundErr),
          jobId,
          paymentIntentId: job.paymentIntentId,
        });
        Sentry.captureException(refundErr, { tags: { context: "jobs.refund" } });
        // Don't fail the whole operation — job is already closed, refund can be retried manually
      }
    }

    // Notify all bidding experts
    await Promise.all(
      job.bids.map((bid) =>
        createNotification(
          bid.specialist.userId,
          "Project closed — no proposals selected",
          `The client for "${job.title}" chose not to proceed with any proposal. This isn't a reflection on your work — keep submitting!`,
          "info",
          "/jobs"
        )
      )
    );

    revalidatePath(`/business/proposals/${jobId}`);
    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/jobs");

    return { success: true };
  } catch (e) {
    log.error("jobs.reject_all_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
