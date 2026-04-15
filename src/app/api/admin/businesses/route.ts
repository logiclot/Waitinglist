import { authOptions } from "@/lib/auth";
import { log } from "@/lib/logger";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import * as Sentry from "@sentry/nextjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/businesses
 * List all business profiles with user info. Admin-only.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const businesses = await prisma.businessProfile.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        country: true,
        freeDiscoveryScansRemaining: true,
        freeCustomProjects: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ businesses });
  } catch (error) {
    log.error("admin.businesses.list_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/businesses
 * Increment or decrement freeDiscoveryScansRemaining or freeCustomProjects for a business profile.
 * Body: { businessProfileId: string, action: "increment" | "decrement", kind?: "scan" | "customProject" }
 * Admin-only.
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { businessProfileId, action, kind = "scan" } = await req.json();

    if (
      !businessProfileId ||
      !["increment", "decrement"].includes(action) ||
      !["scan", "customProject"].includes(kind)
    ) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const profile = await prisma.businessProfile.findUnique({
      where: { id: businessProfileId },
      select: {
        freeDiscoveryScansRemaining: true,
        freeCustomProjects: true,
        userId: true,
        firstName: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Business profile not found" },
        { status: 404 }
      );
    }

    const field =
      kind === "scan" ? "freeDiscoveryScansRemaining" : "freeCustomProjects";
    const currentValue = profile[field];

    if (action === "decrement" && currentValue <= 0) {
      return NextResponse.json(
        { error: "Cannot go below 0" },
        { status: 400 }
      );
    }

    const updated = await prisma.businessProfile.update({
      where: { id: businessProfileId },
      data: {
        [field]:
          action === "increment" ? { increment: 1 } : { decrement: 1 },
      },
      select: { freeDiscoveryScansRemaining: true, freeCustomProjects: true },
    });

    if (action === "increment") {
      const isScan = kind === "scan";
      createNotification(
        profile.userId,
        isScan
          ? "🎁 Free Discovery Scan unlocked!"
          : "🎁 Free Custom Project unlocked!",
        isScan
          ? `Hi ${profile.firstName}, you've been awarded a free Discovery Scan! Let our experts assess your business and propose where automation can save you the most time and money.`
          : `Hi ${profile.firstName}, you've been awarded a free Custom Project! Post a custom request and our experts will get to work for you.`,
        "success",
        isScan ? "/jobs/discovery" : "/jobs/new"
      ).catch((err) => {
        log.warn("admin.businesses.gift_notification_failed", {
          error: String(err),
        });
        Sentry.captureException(err);
      });
    }

    log.info("admin.businesses.gift_updated", {
      businessProfileId,
      action,
      kind,
      newCount: updated[field],
      adminId: session.user.id,
    });

    return NextResponse.json({
      freeDiscoveryScansRemaining: updated.freeDiscoveryScansRemaining,
      freeCustomProjects: updated.freeCustomProjects,
    });
  } catch (error) {
    log.error("admin.businesses.scan_update_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to update scans" },
      { status: 500 }
    );
  }
}
