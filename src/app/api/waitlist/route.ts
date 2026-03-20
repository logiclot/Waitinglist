import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, getFromEmail } from "@/lib/resend";
import { log } from "@/lib/logger";
import { publicFormLimiter } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limit: 5 submissions per IP per 10 minutes
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = await publicFormLimiter.check(ip);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { fullName, email, role, honeypot } = body;

    // Honeypot — bots fill this, real users don't see it
    if (honeypot) return NextResponse.json({ ok: true, status: "created" });

    if (!fullName || !email || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma as any).waitlistSignup.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ ok: true, status: "existing" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).waitlistSignup.create({
      data: { fullName, email, role, source: "landing_waitlist" },
    });

    // Send confirmation email (only if sender is configured)
    const fromEmail = getFromEmail();
    if (fromEmail) {
      try {
        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: "You're on the LogicLot waitlist",
          html: `
            <p>Hi ${fullName},</p>
            <p>Thanks for joining the LogicLot waitlist as a <strong>${role}</strong>.</p>
            <p>We'll be in touch as soon as early access opens.</p>
            <br/>
            <p style="font-size:12px;color:#666;">If you didn't request this, you can safely ignore this email.</p>
          `,
        });
      } catch (emailError) {
        log.error("waitlist.email_send_failed", { email, error: String(emailError) });
      }
    }

    return NextResponse.json({ ok: true, status: "created" });

  } catch (error) {
    log.error("waitlist.api_error", { error: String(error) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
