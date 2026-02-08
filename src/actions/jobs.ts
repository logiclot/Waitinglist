"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
    console.error(e);
    return { error: "Failed to create job post." };
  }
}

export async function createDiscoveryJobPost(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "BUSINESS") {
    return { success: false, error: "Unauthorized. Only businesses can post jobs." };
  }

  const businessModel = formData.get("businessModel") as string;
  const teamSize = formData.get("teamSize") as string;
  const timeDrain = formData.get("timeDrain") as string;
  const workflowVolume = formData.get("workflowVolume") as string;
  const stack = formData.get("stack") as string; // Comma separated
  const communicationHub = formData.get("communicationHub") as string;
  const businessDescription = formData.get("businessDescription") as string;
  const growthGoal = formData.get("growthGoal") as string;

  if (!businessModel || !teamSize || !businessDescription) {
    return { success: false, error: "Missing required fields." };
  }

  // Format data for JobPost model
  const title = `Discovery: ${businessModel} Automation`;
  const goal = `
**Business Model:** ${businessModel}
**Team Size:** ${teamSize}
**Primary Time Drain:** ${timeDrain}
**Monthly Volume:** ${workflowVolume}
**Communication Hub:** ${communicationHub}
**Growth Goal:** ${growthGoal}

**Business Flow Description:**
${businessDescription}
  `.trim();

  const tools = stack ? stack.split(",").filter(Boolean) : [];

  try {
    const job = await prisma.jobPost.create({
      data: {
        buyerId: session.user.id,
        title,
        goal,
        category: "Discovery",
        budgetRange: "$50 (Discovery)",
        timeline: "Discovery Phase",
        tools,
        status: "open", // Paid via client-side stub
        paidAt: new Date(),
        paymentProvider: "stripe_stub",
      },
    });

    revalidatePath("/jobs");
    return { success: true, jobId: job.id };
  } catch (e) {
    console.error("Discovery Job Error:", e);
    return { success: false, error: "Failed to create discovery post." };
  }
}

export async function markJobAsPaid(jobId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const job = await prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!job || job.buyerId !== session.user.id) {
      return { error: "Job not found or unauthorized" };
    }

    await prisma.jobPost.update({
      where: { id: jobId },
      data: {
        status: "open",
        paidAt: new Date(),
        paymentProvider: "simulated",
        paymentIntentId: "sim_12345",
      },
    });

    revalidatePath(`/jobs/${jobId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Payment failed" };
  }
}

export async function submitBid(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "SPECIALIST") {
    return { error: "Unauthorized" };
  }

  const jobId = formData.get("jobId") as string;
  const message = formData.get("message") as string;
  const estimatedTime = formData.get("estimatedTime") as string;
  const priceEstimate = formData.get("priceEstimate") as string;

  if (!message || !estimatedTime) {
    return { error: "Message and time estimate are required." };
  }

  try {
    // Check if specialist is ELITE
    const specialist = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!specialist || specialist.tier !== "ELITE") {
      return { error: "Only Elite specialists can bid on jobs." };
    }

    // Check if already bid
    const existingBid = await prisma.bid.findUnique({
      where: {
        jobPostId_specialistId: {
          jobPostId: jobId,
          specialistId: specialist.id,
        },
      },
    });

    if (existingBid) {
      return { error: "You have already placed a bid on this job." };
    }

    await prisma.bid.create({
      data: {
        jobPostId: jobId,
        specialistId: specialist.id,
        message,
        estimatedTime,
        priceEstimate,
        status: "submitted",
      },
    });

    revalidatePath(`/jobs/${jobId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to submit bid." };
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

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: { specialist: { include: { user: true } } },
    });

    if (!bid) return { error: "Bid not found" };

    // Transaction: Update Job -> Update Bid -> Create Conversation
    await prisma.$transaction(async (tx) => {
      await tx.jobPost.update({
        where: { id: jobId },
        data: { status: "awarded" },
      });

      await tx.bid.update({
        where: { id: bidId },
        data: { status: "accepted" },
      });

      // Create conversation
      const conversation = await tx.conversation.create({
        data: {
          buyerId: session.user.id!,
          sellerId: bid.specialistId,
          jobPostId: jobId,
        },
      });

      // Send system message
      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id!, // System message sent "from" buyer logic-wise or distinct system user? 
          // Schema has `type` field but `senderId` is required and links to User. 
          // For V1, we'll assign senderId to the buyer but mark type as system if possible, 
          // or just send a user message from the buyer.
          // Let's use the buyer's ID for now as the "sender" of the open thread message.
          body: "I've accepted your bid! Let's discuss the details here.",
          type: "user", 
        },
      });
    });

    revalidatePath(`/jobs/${jobId}`);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to award bid." };
  }
}
