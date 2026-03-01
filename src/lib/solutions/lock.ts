import { prisma } from "@/lib/prisma";

export interface LockState {
  locked: boolean;
  reason?: string;
}

export async function getSolutionLockState(solutionId: string): Promise<LockState> {
  // Check active bids
  // Bids linked to this solution (offering this solution for a custom project)
  const activeBid = await prisma.bid.findFirst({
    where: {
      solutionId,
      status: { in: ["submitted", "shortlisted", "accepted"] }
    }
  });

  if (activeBid) {
    return { locked: true, reason: "This solution is currently used in an active bid." };
  }

  // Check active orders (projects)
  const activeOrder = await prisma.order.findFirst({
    where: {
      solutionId,
      status: { in: ["paid_pending_implementation", "in_progress", "delivered", "disputed"] }
    }
  });

  if (activeOrder) {
    return { locked: true, reason: "This solution is used in an active project." };
  }

  return { locked: false };
}
