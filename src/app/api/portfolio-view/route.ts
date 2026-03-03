import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pageViewLimiter } from "@/lib/rate-limit";
import { log } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = pageViewLimiter.check(ip);
    if (!rl.success) return NextResponse.json({ ok: true });

    const { slug } = await request.json();
    if (!slug || typeof slug !== "string" || slug.length > 100) {
      return NextResponse.json({ ok: true });
    }

    await prisma.specialistProfile.updateMany({
      where: { slug, status: "APPROVED" },
      data: { portfolioViewCount: { increment: 1 } },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error("portfolio_view.increment_error", { error: String(error) });
    return NextResponse.json({ ok: true });
  }
}
