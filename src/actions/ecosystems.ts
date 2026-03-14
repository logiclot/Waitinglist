"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { log } from "@/lib/logger";
import { createNotification } from "@/lib/notifications";
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

export async function createEcosystem(data: { title: string; description?: string; shortPitch?: string }) {
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
        shortPitch: data.shortPitch ?? data.description ?? "",
        businessGoal: "",
        isPublished: false,
      },
    });
    revalidatePath("/expert/ecosystems");
    return { success: true, ecosystemId: ecosystem.id };
  } catch (e) {
    log.error("ecosystems.create_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to create suite" };
  }
}

export async function updateEcosystem(id: string, data: {
  title?: string;
  shortPitch?: string;
  bundlePriceCents?: number | null;
  extSupport6mCents?: number | null;
  extSupport12mCents?: number | null;
  extSupportDescription?: string | null;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return { error: "Unauthorized" };

  // Validate pricing fields must be positive when set
  if (data.bundlePriceCents != null && data.bundlePriceCents <= 0) {
    return { error: "Bundle price must be a positive amount" };
  }
  if (data.extSupport6mCents != null && data.extSupport6mCents <= 0) {
    return { error: "6-month support price must be a positive amount" };
  }
  if (data.extSupport12mCents != null && data.extSupport12mCents <= 0) {
    return { error: "12-month support price must be a positive amount" };
  }

  try {
    // Verify ownership
    const existing = await prisma.ecosystem.findUnique({ where: { id } });
    if (!existing || existing.expertId !== expertId) return { error: "Unauthorized" };

    await prisma.ecosystem.update({
      where: { id },
      data,
    });
    revalidatePath(`/expert/ecosystems/${id}`);
    // Also revalidate public pages so pricing/support changes show immediately
    if (existing.isPublished && existing.slug) {
      revalidatePath(`/stacks/${existing.slug}`);
      revalidatePath("/stacks");
    }
    return { success: true };
  } catch (e) {
    log.error("ecosystems.update_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to update suite" };
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
      data: { isPublished: publish },
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

    // If this was a partner solution, update the invite status
    await prisma.ecosystemInvite.updateMany({
      where: { ecosystemId, solutionId, status: "accepted" },
      data: { status: "withdrawn" },
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

  // Notify partner experts before cascade-delete
  const acceptedInvites = await prisma.ecosystemInvite.findMany({
    where: { ecosystemId: id, status: "accepted" },
    include: { invitee: { select: { userId: true } }, solution: { select: { title: true } } },
  });
  for (const invite of acceptedInvites) {
    await createNotification(
      invite.invitee.userId,
      "🗂️ Suite removed",
      `The suite "${existing.title}" containing your solution "${invite.solution.title}" has been removed by the owner.`,
      "info"
    );
  }

  // EcosystemItems + EcosystemInvites cascade-delete automatically via schema onDelete: Cascade
  await prisma.ecosystem.delete({ where: { id } });

  revalidatePath("/expert/ecosystems");
  if (existing.isPublished) revalidatePath(`/stacks/${existing.slug}`);
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
      items: { include: { solution: true } },
      invites: { where: { status: "pending" }, select: { id: true } },
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
    where: { solutionId, ecosystem: { isPublished: true } },
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
    where: { isPublished: true },
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

/** Full suite data for the premium SuiteCard — returns ALL items with pricing, delivery, expert info. */
export async function getPublishedEcosystemsFull() {
  return await prisma.ecosystem.findMany({
    where: { isPublished: true },
    include: {
      items: {
        include: {
          solution: {
            select: {
              id: true,
              slug: true,
              title: true,
              shortSummary: true,
              outcome: true,
              category: true,
              implementationPriceCents: true,
              monthlyCostMinCents: true,
              monthlyCostMaxCents: true,
              deliveryDays: true,
              supportDays: true,
              integrations: true,
              businessGoals: true,
              expertId: true,
              expert: {
                select: {
                  id: true,
                  displayName: true,
                  slug: true,
                  isFoundingExpert: true,
                  tier: true,
                  user: { select: { profileImageUrl: true } },
                },
              },
            },
          },
        },
        orderBy: { position: "asc" },
      },
      expert: {
        select: {
          id: true,
          displayName: true,
          slug: true,
          isFoundingExpert: true,
          tier: true,
          user: { select: { profileImageUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── Suite Partnership Functions ──────────────────────────────────────────────

export async function searchPublishedSolutions(query: string, ecosystemId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return [];

  // Verify the caller is the ecosystem owner
  const ecosystem = await prisma.ecosystem.findUnique({ where: { id: ecosystemId } });
  if (!ecosystem || ecosystem.expertId !== expertId) return [];

  // Get IDs of solutions already in the suite or pending invite
  const [existingItems, pendingInvites] = await Promise.all([
    prisma.ecosystemItem.findMany({
      where: { ecosystemId },
      select: { solutionId: true },
    }),
    prisma.ecosystemInvite.findMany({
      where: { ecosystemId, status: "pending" },
      select: { solutionId: true },
    }),
  ]);
  const excludeIds = [
    ...existingItems.map((i) => i.solutionId),
    ...pendingInvites.map((i) => i.solutionId),
  ];

  return await prisma.solution.findMany({
    where: {
      status: "published",
      expertId: { not: expertId },
      ...(excludeIds.length > 0 ? { id: { notIn: excludeIds } } : {}),
      title: { contains: query, mode: "insensitive" },
    },
    include: {
      expert: { select: { id: true, displayName: true, slug: true } },
    },
    take: 10,
  });
}

export async function inviteToEcosystem(
  ecosystemId: string,
  solutionId: string,
  message?: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return { error: "Expert profile not found" };

  try {
    const ecosystem = await prisma.ecosystem.findUnique({ where: { id: ecosystemId } });
    if (!ecosystem || ecosystem.expertId !== expertId) return { error: "Unauthorized" };

    const solution = await prisma.solution.findUnique({
      where: { id: solutionId },
      include: { expert: { select: { id: true, userId: true, displayName: true } } },
    });
    if (!solution || solution.status !== "published") return { error: "Solution not found or not published" };
    if (solution.expertId === expertId) return { error: "Cannot invite your own solution" };

    // Check for existing invite
    const existing = await prisma.ecosystemInvite.findUnique({
      where: { ecosystemId_solutionId: { ecosystemId, solutionId } },
    });
    if (existing) {
      if (existing.status === "pending") return { error: "Invite already pending" };
      if (existing.status === "accepted") return { error: "Solution already in suite" };
      // Re-invite if previously declined or withdrawn
      await prisma.ecosystemInvite.update({
        where: { id: existing.id },
        data: { status: "pending", message },
      });
    } else {
      await prisma.ecosystemInvite.create({
        data: {
          ecosystemId,
          solutionId,
          inviterId: expertId,
          inviteeId: solution.expertId,
          status: "pending",
          message,
        },
      });
    }

    await createNotification(
      solution.expert.userId,
      "🤝 Suite partnership invite",
      `Your solution "${solution.title}" has been invited to join the suite "${ecosystem.title}".`,
      "info",
      "/expert/suite-invites"
    );

    revalidatePath(`/expert/ecosystems/${ecosystemId}`);
    return { success: true };
  } catch (e) {
    log.error("ecosystems.invite_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to send invite" };
  }
}

export async function respondToInvite(inviteId: string, accept: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return { error: "Expert profile not found" };

  try {
    const invite = await prisma.ecosystemInvite.findUnique({
      where: { id: inviteId },
      include: {
        ecosystem: { select: { id: true, title: true, slug: true, expertId: true } },
        solution: { select: { id: true, title: true, slug: true } },
        inviter: { select: { userId: true, displayName: true } },
      },
    });

    if (!invite || invite.inviteeId !== expertId) return { error: "Invite not found" };
    if (invite.status !== "pending") return { error: "Invite is no longer pending" };

    // Verify solution is still published
    const solution = await prisma.solution.findUnique({
      where: { id: invite.solutionId },
      select: { status: true },
    });
    if (!solution || solution.status !== "published") {
      await prisma.ecosystemInvite.update({
        where: { id: inviteId },
        data: { status: "declined" },
      });
      return { error: "Solution is no longer published" };
    }

    if (accept) {
      // Get the next position in the suite
      const lastItem = await prisma.ecosystemItem.findFirst({
        where: { ecosystemId: invite.ecosystemId },
        orderBy: { position: "desc" },
      });
      const position = (lastItem?.position ?? -1) + 1;

      await prisma.$transaction([
        prisma.ecosystemInvite.update({
          where: { id: inviteId },
          data: { status: "accepted" },
        }),
        prisma.ecosystemItem.create({
          data: {
            ecosystemId: invite.ecosystemId,
            solutionId: invite.solutionId,
            position,
          },
        }),
      ]);

      await createNotification(
        invite.inviter.userId,
        "✅ Suite invite accepted",
        `"${invite.solution.title}" has been added to your suite "${invite.ecosystem.title}".`,
        "success",
        `/expert/ecosystems/${invite.ecosystemId}`
      );
    } else {
      await prisma.ecosystemInvite.update({
        where: { id: inviteId },
        data: { status: "declined" },
      });

      await createNotification(
        invite.inviter.userId,
        "Suite invite declined",
        `The expert declined to add "${invite.solution.title}" to "${invite.ecosystem.title}".`,
        "info",
        `/expert/ecosystems/${invite.ecosystemId}`
      );
    }

    revalidatePath("/expert/suite-invites");
    revalidatePath(`/expert/ecosystems/${invite.ecosystemId}`);
    if (invite.ecosystem.slug) {
      revalidatePath(`/stacks/${invite.ecosystem.slug}`);
    }
    // Revalidate solution page so suite badge appears
    revalidatePath(`/solutions/${invite.solutionId}`);
    if (invite.solution.slug) {
      revalidatePath(`/solutions/${invite.solution.slug}`);
    }
    return { success: true };
  } catch (e) {
    log.error("ecosystems.respond_invite_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to respond to invite" };
  }
}

export async function withdrawFromEcosystem(ecosystemId: string, solutionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return { error: "Expert profile not found" };

  try {
    // Verify the solution belongs to this expert
    const solution = await prisma.solution.findUnique({ where: { id: solutionId } });
    if (!solution || solution.expertId !== expertId) return { error: "Unauthorized" };

    await prisma.ecosystemItem.deleteMany({
      where: { ecosystemId, solutionId },
    });

    await prisma.ecosystemInvite.updateMany({
      where: { ecosystemId, solutionId, status: "accepted" },
      data: { status: "withdrawn" },
    });

    const ecosystem = await prisma.ecosystem.findUnique({
      where: { id: ecosystemId },
      include: { expert: { select: { userId: true } } },
    });
    if (ecosystem) {
      await createNotification(
        ecosystem.expert.userId,
        "🔄 Partner withdrew from suite",
        `"${solution.title}" has been withdrawn from your suite "${ecosystem.title}".`,
        "alert",
        `/expert/ecosystems/${ecosystemId}`
      );
    }

    revalidatePath(`/expert/ecosystems/${ecosystemId}`);
    revalidatePath("/expert/suite-invites");
    return { success: true };
  } catch (e) {
    log.error("ecosystems.withdraw_failed", { error: e instanceof Error ? e.message : String(e) });
    Sentry.captureException(e);
    return { error: "Failed to withdraw" };
  }
}

export async function getMyPendingInvites() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return [];

  return await prisma.ecosystemInvite.findMany({
    where: { inviteeId: expertId, status: "pending" },
    include: {
      ecosystem: { select: { id: true, title: true, slug: true } },
      solution: { select: { id: true, title: true } },
      inviter: { select: { displayName: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingInviteCount() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return 0;

  const expertId = await getExpertId(session.user.id);
  if (!expertId) return 0;

  return await prisma.ecosystemInvite.count({
    where: { inviteeId: expertId, status: "pending" },
  });
}
