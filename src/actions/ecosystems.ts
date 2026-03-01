"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

// Helper to generate slug
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

async function getExpertId(userId: string) {
  const expert = await prisma.specialistProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  return expert?.id;
}

export async function createEcosystem(data: { title: string; description?: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return { error: "Expert profile not found" };

  let slug = slugify(data.title);
  // Ensure uniqueness
  let count = 0;
  while (await prisma.ecosystem.findUnique({ where: { slug } })) {
    count++;
    slug = `${slugify(data.title)}-${count}`;
  }

  try {
    const ecosystem = await prisma.ecosystem.create({
      data: {
        expertId,
        title: data.title,
        slug,
        description: data.description ?? null,
        published: false,
      },
    });
    revalidatePath("/expert/ecosystems");
    return { success: true, ecosystemId: ecosystem.id };
  } catch (e) {
    log.error("ecosystems.create_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to create ecosystem" };
  }
}

export async function updateEcosystem(id: string, data: { title?: string; description?: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return { error: "Unauthorized" };

  try {
    // Verify ownership
    const existing = await prisma.ecosystem.findUnique({ where: { id } });
    if (!existing || existing.expertId !== expertId) return { error: "Unauthorized" };

    await prisma.ecosystem.update({
      where: { id },
      data,
    });
    revalidatePath(`/expert/ecosystems/${id}`);
    return { success: true };
  } catch (e) {
    log.error("ecosystems.update_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to update ecosystem" };
  }
}

export async function publishEcosystem(id: string, publish: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return { error: "Unauthorized" };

  try {
    const existing = await prisma.ecosystem.findUnique({ 
      where: { id },
      include: { items: { include: { solution: { select: { id: true, slug: true } } } } }
    });
    
    if (!existing || existing.expertId !== expertId) return { error: "Unauthorized" };

    if (publish && existing.items.length === 0) {
      return { error: "Cannot publish an empty suite. Add at least one solution." };
    }

    await prisma.ecosystem.update({
      where: { id },
      data: { published: publish },
    });

    revalidatePath(`/expert/ecosystems`);
    revalidatePath(`/stacks/${existing.slug}`);
    // Revalidate each solution page so the suite badge/section appears immediately
    for (const item of existing.items) {
      revalidatePath(`/solutions/${item.solution.id}`);
      revalidatePath(`/solutions/${item.solution.slug}`);
    }
    return { success: true };
  } catch (e) {
    log.error("ecosystems.publish_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to update publish status" };
  }
}

export async function addSolutionToEcosystem(ecosystemId: string, solutionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return { error: "Unauthorized" };

  try {
    const ecosystem = await prisma.ecosystem.findUnique({ where: { id: ecosystemId } });
    if (!ecosystem || ecosystem.expertId !== expertId) return { error: "Unauthorized" };

    // Get current max position
    const lastItem = await prisma.ecosystemItem.findFirst({
      where: { ecosystemId },
      orderBy: { position: 'desc' }
    });
    const position = (lastItem?.position ?? -1) + 1;

    await prisma.ecosystemItem.create({
      data: {
        ecosystemId,
        solutionId,
        position
      }
    });

    // Revalidate the solution's public page so the suite section appears immediately
    const solution = await prisma.solution.findUnique({ where: { id: solutionId }, select: { slug: true } });
    if (solution) {
      revalidatePath(`/solutions/${solutionId}`);
      revalidatePath(`/solutions/${solution.slug}`);
    }
    revalidatePath(`/expert/ecosystems/${ecosystemId}`);
    return { success: true };
  } catch (e) {
    log.error("ecosystems.add_solution_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to add solution" };
  }
}

export async function removeSolutionFromEcosystem(ecosystemId: string, solutionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return { error: "Unauthorized" };

  try {
    const ecosystem = await prisma.ecosystem.findUnique({ where: { id: ecosystemId } });
    if (!ecosystem || ecosystem.expertId !== expertId) return { error: "Unauthorized" };

    await prisma.ecosystemItem.deleteMany({
      where: { ecosystemId, solutionId }
    });

    // Revalidate the solution's public page so the suite badge is removed immediately
    const solution = await prisma.solution.findUnique({ where: { id: solutionId }, select: { slug: true } });
    if (solution) {
      revalidatePath(`/solutions/${solutionId}`);
      revalidatePath(`/solutions/${solution.slug}`);
    }
    revalidatePath(`/expert/ecosystems/${ecosystemId}`);
    return { success: true };
  } catch (e) {
    log.error("ecosystems.remove_solution_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to remove solution" };
  }
}

export async function reorderEcosystemItems(ecosystemId: string, orderedSolutionIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return { error: "Unauthorized" };

  try {
    const ecosystem = await prisma.ecosystem.findUnique({ where: { id: ecosystemId } });
    if (!ecosystem || ecosystem.expertId !== expertId) return { error: "Unauthorized" };

    // Transaction to update all positions
    await prisma.$transaction(
      orderedSolutionIds.map((solutionId, index) => 
        prisma.ecosystemItem.updateMany({
          where: { ecosystemId, solutionId },
          data: { position: index }
        })
      )
    );
    
    revalidatePath(`/expert/ecosystems/${ecosystemId}`);
    return { success: true };
  } catch (e) {
    log.error("ecosystems.reorder_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to reorder items" };
  }
}

export async function deleteEcosystem(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return { error: "Unauthorized" };

  const existing = await prisma.ecosystem.findUnique({ where: { id } });
  if (!existing || existing.expertId !== expertId) return { error: "Unauthorized" };

  // EcosystemItems cascade-delete automatically via schema onDelete: Cascade
  await prisma.ecosystem.delete({ where: { id } });

  revalidatePath("/expert/ecosystems");
  if (existing.published) revalidatePath(`/stacks/${existing.slug}`);
  return { success: true };
}

export async function getExpertEcosystems() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return [];

  return await prisma.ecosystem.findMany({
    where: { expertId },
    include: { 
      items: { include: { solution: true } } 
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function getEcosystemBySlug(slug: string) {
  return await prisma.ecosystem.findUnique({
    where: { slug },
    include: {
      expert: true,
      items: {
        include: { solution: { include: { expert: true } } },
        orderBy: { position: 'asc' }
      }
    }
  });
}

export async function getEcosystemsForSolution(solutionId: string) {
  const items = await prisma.ecosystemItem.findMany({
    where: { solutionId, ecosystem: { published: true } },
    include: {
      ecosystem: {
        include: {
          items: {
            include: { solution: true },
            orderBy: { position: 'asc' }
          }
        }
      }
    },
    take: 2 // Limit to 2 as requested
  });

  return items.map(item => item.ecosystem);
}

export async function getPublishedEcosystems() {
  return await prisma.ecosystem.findMany({
    where: { published: true },
    include: {
      items: {
        include: { solution: true },
        take: 4 // Preview items
      },
      expert: true
    },
    orderBy: { createdAt: 'desc' }
  });
}
