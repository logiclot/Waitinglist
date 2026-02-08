import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";

// Simple in-memory rate limit
const rateLimit = new Map<string, { count: number; lastReset: number }>();
const LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

export async function POST(request: Request) {
  try {
    // 1. Rate Limit
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const record = rateLimit.get(ip) || { count: 0, lastReset: now };

    if (now - record.lastReset > LIMIT_WINDOW) {
      record.count = 0;
      record.lastReset = now;
    }

    if (record.count >= MAX_REQUESTS) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    record.count += 1;
    rateLimit.set(ip, record);

    // 2. Parse Body
    const body = await request.json();
    const { fullName, email, role, honeypot } = body;

    // 3. Honeypot check
    if (honeypot) {
      // Silently return success
      return NextResponse.json({ ok: true, status: "created" });
    }

    // 4. Validation
    if (!fullName || !email || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 5. DB Insert/Upsert
    // @ts-expect-error: Prisma client might not be regenerated yet
    const existing = await prisma.waitlistSignup.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ ok: true, status: "existing" });
    }

    // @ts-expect-error: Prisma client might not be regenerated yet
    await prisma.waitlistSignup.create({
      data: {
        fullName,
        email,
        role,
        source: "landing_waitlist",
      },
    });

    // 6. Send Email
    try {
      // Use configured sender or fallback to testing domain
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
      
      await resend.emails.send({
        from: fromEmail, 
        to: email,
        subject: "You’re on the LogicLot waitlist",
        html: `
          <p>Hi ${fullName},</p>
          <p>Thanks for joining the LogicLot waitlist as a <strong>${role}</strong>.</p>
          <p>We’ll email you as soon as early access opens.</p>
          <br/>
          <p style="font-size: 12px; color: #666;">If you didn’t request this, ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({ ok: true, status: "created" });

  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
