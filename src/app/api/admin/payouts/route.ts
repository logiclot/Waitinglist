/**
 * GET /api/admin/payouts
 *
 * Returns all manual payouts with specialist bank details.
 * Admin-only.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payouts = await prisma.manualPayout.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        specialist: {
          select: {
            id: true,
            displayName: true,
            legalFullName: true,
            country: true,
            bankAccountHolder: true,
            bankIban: true,
            bankSwiftBic: true,
            bankName: true,
            bankCurrency: true,
            user: {
              select: { email: true },
            },
          },
        },
        order: {
          select: {
            id: true,
            buyer: {
              select: {
                email: true,
                businessProfile: {
                  select: { companyName: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ payouts });
  } catch (error) {
    log.error("admin.payouts.list_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}
