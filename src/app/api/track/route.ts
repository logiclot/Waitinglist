import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";
import { pageViewLimiter } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = pageViewLimiter.check(ip);
    if (!rl.success) {
      return NextResponse.json({ ok: true });
    }

    const body = await request.json();
    const { sessionId, pathname, referrer } = body;

    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 64) {
      return NextResponse.json({ ok: true });
    }
    if (!pathname || typeof pathname !== "string" || pathname.length > 500) {
      return NextResponse.json({ ok: true });
    }

    await prisma.pageView.create({
      data: {
        sessionId,
        pathname: pathname.slice(0, 500),
        referrer: typeof referrer === "string" ? referrer.slice(0, 1000) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error("track.pageview_error", { error: String(error) });
    return NextResponse.json({ ok: true });
  }
}
