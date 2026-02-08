"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Check admin permission (simple check for now)
// In real app, check session.user.role === 'ADMIN' or allowlist
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  // Allow any logged in user for development
  return !!session?.user?.id;
}

export async function getAdminData() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    // In Server Action we can't easily redirect top-level, return error
    return { error: "Unauthorized" };
  }

  const experts = await prisma.specialistProfile.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const solutions = await prisma.solution.findMany({
    orderBy: { createdAt: 'desc' },
    include: { expert: true }
  });

  return { experts, solutions };
}

export async function approveSpecialist(id: string) {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.specialistProfile.update({
    where: { id },
    data: { status: "APPROVED" }
  });
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
    data: { founding: true, foundingRank: rank }
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function updateSolutionVideoStatus(id: string, status: "approved" | "rejected") {
  if (!(await checkAdmin())) return { error: "Unauthorized" };

  await prisma.solution.update({
    where: { id },
    data: { 
      demoVideoStatus: status,
      demoVideoReviewedAt: status === "approved" ? new Date() : null
    }
  });
  revalidatePath("/admin");
  return { success: true };
}
