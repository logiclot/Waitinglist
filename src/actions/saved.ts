"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleSavedSolution(solutionId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const userId = session.user.id;

  try {
    const existing = await prisma.savedSolution.findUnique({
      where: {
        userId_solutionId: {
          userId,
          solutionId,
        },
      },
    });

    if (existing) {
      await prisma.savedSolution.delete({
        where: { id: existing.id },
      });
      return { saved: false };
    } else {
      await prisma.savedSolution.create({
        data: {
          userId,
          solutionId,
        },
      });
      return { saved: true };
    }
  } catch (error) {
    console.error("Error toggling saved solution:", error);
    return { error: "Failed to update" };
  }
}

export async function getSavedSolutions() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return [];
  }

  try {
    const saved = await prisma.savedSolution.findMany({
      where: { userId: session.user.id },
      select: { solutionId: true },
    });
    return saved.map((s) => s.solutionId);
  } catch (error) {
    console.error("Error fetching saved solutions:", error);
    return [];
  }
}
