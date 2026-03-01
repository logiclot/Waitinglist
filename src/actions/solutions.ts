"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Solution } from "@prisma/client";
import { getSolutionLockState } from "@/lib/solutions/lock";
import { createNotification } from "@/lib/notifications";
import { validateSolutionForPublish } from "@/lib/validation";
import { checkAndFireSuitesNotification } from "@/lib/onboarding-notifications";

import { checkExpertReferralCondition } from "@/actions/referral";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

export async function createSolutionDraft(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  // Get expert profile
  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id }
  });

  if (!expert) return { error: "Expert profile not found" };

  // Basic validation/extraction
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const implementationPriceCents = parseInt(formData.get("implementationPriceCents") as string || "0");
  const deliveryDays = parseInt(formData.get("deliveryDays") as string || "7");
  const supportDays = parseInt(formData.get("supportDays") as string || "30");
  const lastStep = parseInt(formData.get("lastStep") as string || "1");

  if (!title) return { error: "Title is required" };

  // Generate basic slug
  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

  try {
    const solution = await prisma.solution.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        expertId: expert.id,
        title,
        slug,
        category: category || "Other",
        description: "",
        implementationPriceCents,
        deliveryDays,
        supportDays,
        status: "draft",
        lastStep,
        // Defaults
        integrations: [],
        included: [],
        excluded: [],
        requiredInputs: [],
        outline: [],
        structureConsistent: [],
        structureCustom: []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    });

    return { success: true, solutionId: solution.id };
  } catch (e) {
    log.error("solutions.create_draft_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: e instanceof Error ? e.message : "Failed to create draft" };
  }
}

export async function updateSolutionDraft(solutionId: string, data: Partial<Solution>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  // Verify ownership
  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id }
  });

  const existing = await prisma.solution.findUnique({
    where: { id: solutionId }
  });

  if (!existing || existing.expertId !== expert?.id) {
    return { error: "Unauthorized" };
  }

  // Check lock state
  const lockState = await getSolutionLockState(solutionId);
  if (lockState.locked) {
    return { error: `Solution is locked: ${lockState.reason}` };
  }

  try {
    await prisma.solution.update({
      where: { id: solutionId },
      data: data as Record<string, unknown>
    });
    return { success: true };
  } catch (e) {
    log.error("solutions.update_draft_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: e instanceof Error ? e.message : "Failed to update draft" };
  }
}

export async function publishSolution(solutionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id }
  });

  const solution = await prisma.solution.findUnique({
    where: { id: solutionId }
  });

  if (!solution || solution.expertId !== expert?.id) {
    return { error: "Unauthorized" };
  }

  // Final validation — delegated to shared pure function (also tested)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const solutionAny = solution as Record<string, unknown>;
  const validation = validateSolutionForPublish({
    title: solution.title,
    category: solution.category,
    longDescription: solution.longDescription,
    integrations: solution.integrations,
    structureConsistent: solutionAny.structureConsistent as string[] | undefined,
    structureCustom: solutionAny.structureCustom as string[] | undefined,
    measurableOutcome: solutionAny.measurableOutcome as string | null | undefined,
    included: solution.included,
    paybackPeriod: solutionAny.paybackPeriod as string | null | undefined,
    implementationPriceCents: solution.implementationPriceCents,
    deliveryDays: solution.deliveryDays,
    milestones: (solutionAny.milestones ?? []) as { title?: string; price?: number; description?: string }[],
  });

  if (!validation.valid) {
    return { error: validation.error ?? "Validation failed" };
  }

  // Auto-Approve Mode (MVP Phase 0: Always Auto-Approve)
  const moderationStatus = "auto_approved";
  const approvedAt = new Date();

  try {
    await prisma.solution.update({
      where: { id: solutionId },
      data: {
        status: "published",
        publishedAt: new Date(),
        moderationStatus,
        approvedAt
      } as Record<string, unknown>
    });

    // Handle Version Notifications
    if (solution.version > 1 && solution.parentId) {
      // Find buyers of the previous version
      // We look for orders of the parent solution that are "delivered" or "approved"
      const previousOrders = await prisma.order.findMany({
        where: {
          solutionId: solution.parentId,
          status: { in: ["delivered", "approved"] }
        },
        include: { buyer: true }
      });

      // Notify them
      await Promise.all(previousOrders.map(order =>
        createNotification(
          order.buyerId,
          "New Version Available",
          `A new version (v${solution.version}) of "${solution.title}" is available. Check out the upgrade.`,
          "info",
          `/solutions/${solution.id}`
        )
      ));
    }

    // Founding Expert Campaign Logic
    const publishedCount = await prisma.solution.count({
      where: {
        expertId: expert.id,
        status: "published"
      }
    });

    if (publishedCount >= 3 && !expert.isFoundingExpert) {
      const foundingCount = await prisma.specialistProfile.count({
        where: { isFoundingExpert: true }
      });

      if (foundingCount < 20) {
        await prisma.specialistProfile.update({
          where: { id: expert.id },
          data: {
            isFoundingExpert: true,
            platformFeePercentage: 11,
            foundingRank: foundingCount + 1
          }
        });

        await createNotification(
          session.user.id,
          "Founding Expert Status Confirmed!",
          "You have unlocked 11% platform fees for life.",
          "success",
          "/dashboard"
        );
      }
    }

    // Check Referral Condition
    await checkExpertReferralCondition(session.user.id);

    // Fire Suites notification once the expert has 3+ published solutions
    checkAndFireSuitesNotification(session.user.id, publishedCount).catch(() => {});

    return { success: true };
  } catch (e) {
    log.error("solutions.publish_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: e instanceof Error ? e.message : "Failed to publish" };
  }
}

export async function archiveSolution(solutionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id }
  });

  const solution = await prisma.solution.findUnique({
    where: { id: solutionId }
  });

  if (!solution || solution.expertId !== expert?.id) {
    return { error: "Unauthorized" };
  }

  // Check Lock
  const lockState = await getSolutionLockState(solutionId);
  if (lockState.locked) {
    return { error: `Cannot remove: ${lockState.reason}` };
  }

  try {
    await prisma.solution.update({
      where: { id: solutionId },
      data: { status: "archived" }
    });
    return { success: true };
  } catch (e) {
    log.error("solutions.archive_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to archive" };
  }
}

export async function createSolutionVersion(solutionId: string, changelog: string, upgradePriceCents: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id }
  });

  const parentSolution = await prisma.solution.findUnique({
    where: { id: solutionId }
  });

  if (!parentSolution || parentSolution.expertId !== expert?.id) {
    return { error: "Unauthorized" };
  }

  // Generate new slug
  const baseSlug = parentSolution.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  const slug = `${baseSlug}-v${parentSolution.version + 1}-${Math.random().toString(36).substring(2, 6)}`;

  try {
    // Clone the solution
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, publishedAt, approvedAt, orders, conversations, bids, savedByUsers, ...dataToClone } = parentSolution as Record<string, unknown>;

    const newSolution = await prisma.solution.create({
      data: {
        ...dataToClone,
        slug,
        version: parentSolution.version + 1,
        parentId: parentSolution.id,
        changelog,
        upgradePriceCents,
        status: "draft",
        moderationStatus: "pending",
        lastStep: 1 // Start wizard at step 1 for review
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any
    });

    return { success: true, solutionId: newSolution.id };
  } catch (e) {
    log.error("solutions.create_version_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to create new version" };
  }
}
