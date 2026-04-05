import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, getFromEmail } from "@/lib/resend";
import { log } from "@/lib/logger";
import { publicFormLimiter } from "@/lib/rate-limit";
import fs from "fs";
import path from "path";
import { waitlistSchema } from "@/lib/validation";


export async function POST(request: Request) {
  try {
    // Rate limit: 5 submissions per IP per 10 minutes
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const rl = await publicFormLimiter.check(ip);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();

    const result = waitlistSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message ?? "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { fullName, email, role, honeypot } = result.data;

    // Honeypot — bots fill this, real users don't see it
    if (honeypot) return NextResponse.json({ ok: true, status: "created" });

    const existing = await prisma.waitlistSignup.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ ok: true, status: "existing" });


    await prisma.waitlistSignup.create({
      data: { fullName, email, role, source: "landing_waitlist" },
    });

    // Send confirmation email (only if sender is configured)
    const fromEmail = getFromEmail();
    if (fromEmail) {
      try {
        // Read the ebook PDF for attachment
        const ebookPath = path.join(process.cwd(), "public", "automation_boom_ebook.pdf");
        const ebookBuffer = fs.readFileSync(ebookPath);

        await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: "You're on the LogicLot waitlist + your free ebook",
          html: `
            <p>Hi ${fullName},</p>
            <p>Thanks for joining the LogicLot waitlist as a <strong>${role}</strong>.</p>
            <p>As a thank you, we've attached your free copy of <strong>"The Automation Boom"</strong>, our guide to understanding where automation delivers the highest ROI for businesses like yours.</p>
            <p>We'll be in touch as soon as early access opens.</p>
            <br/>
            <p style="font-size:12px;color:#666;">If you didn't request this, you can safely ignore this email.</p>
          `,
          attachments: [
            {
              filename: "The_Automation_Boom_LogicLot.pdf",
              content: ebookBuffer,
            },
          ],
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
