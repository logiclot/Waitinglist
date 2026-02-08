"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Solution } from "@prisma/client";
import { getSolutionLockState } from "@/lib/solutions/lock";

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
        prerequisites: [],
        requiredInputs: [],
        outline: [],
        commissionRate: 15.0 // Default platform fee
      }
    });

    return { success: true, solutionId: solution.id };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create draft" };
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
      data
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update draft" };
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

  // Final Validation (Server-side)
  const missing = [];
  if (!solution.title) missing.push("Title");
  if (!solution.category) missing.push("Category");
  if (!solution.longDescription) missing.push("Long Description");
  if (solution.integrations.length === 0) missing.push("Tools");
  if (solution.included.length < 3) missing.push("Included Deliverables (min 3)");
  if (!solution.implementationPriceCents) missing.push("Price");
  if (!solution.deliveryDays) missing.push("Delivery Time");
  if (!solution.accessRequired) missing.push("Access Requirements");
  if (!solution.paybackPeriod) missing.push("ROI Timeframe");

  if (missing.length > 0) {
    return { error: `Missing required fields: ${missing.join(", ")}` };
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
      }
    });
    return { success: true };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "Failed to publish" };
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
    console.error(e);
    return { error: "Failed to archive" };
  }
}
