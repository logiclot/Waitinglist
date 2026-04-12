import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logger";
import { auditTrackLimiter } from "@/lib/rate-limit";
import { botGuard } from "@/lib/botid-guard";

const VALID_EVENTS = ["quiz_start", "step_complete", "quiz_complete", "email_sent"] as const;

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = await auditTrackLimiter.check(ip);
    if (!rl.success) {
      return NextResponse.json({ ok: true }); // silently drop, don't error for tracking
    }


    const blocked = await botGuard();
    if (blocked) return blocked;

    const body = await request.json();
    const { sessionId, event, step, score, scoreLabel, answers, email } = body;

    if (!sessionId || typeof sessionId !== "string" || sessionId.length > 64) {
      return NextResponse.json({ ok: true }); // silently drop invalid
    }
    if (!VALID_EVENTS.includes(event)) {
      return NextResponse.json({ ok: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).auditEvent.create({
      data: {
        sessionId,
        event,
        step: event === "step_complete" && typeof step === "number" ? step : null,
        score: event === "quiz_complete" && typeof score === "number" ? score : null,
        scoreLabel: event === "quiz_complete" ? (scoreLabel ?? null) : null,
        answers: event === "quiz_complete" ? (answers ?? null) : null,
        email: event === "email_sent" ? (email ?? null) : null,
        ip: ip.split(",")[0].trim().slice(0, 45),
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error("audit.track_error", { error: String(error) });
    return NextResponse.json({ ok: true }); // never fail tracking calls
  }
}
