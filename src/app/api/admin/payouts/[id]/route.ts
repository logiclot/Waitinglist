/**
 * PATCH /api/admin/payouts/:id
 *
 * Mark a manual payout as transferred or update its transfer note.
 * Admin-only.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status, transferNote } = await req.json();

    if (status && !["pending", "transferred", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const payout = await prisma.manualPayout.findUnique({
      where: { id: params.id },
    });

    if (!payout) {
      return NextResponse.json(
        { error: "Payout not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.manualPayout.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(status === "transferred" && { transferredAt: new Date() }),
        ...(transferNote !== undefined && { transferNote }),
      },
    });

    log.info("admin.payouts.updated", {
      payoutId: params.id,
      status: updated.status,
      adminId: session.user.id,
    });

    return NextResponse.json({ payout: updated });
  } catch (error) {
    log.error("admin.payouts.update_failed", {
      error: error instanceof Error ? error.message : String(error),
      payoutId: params.id,
    });
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to update payout" },
      { status: 500 }
    );
  }
}
