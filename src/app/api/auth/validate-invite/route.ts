import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const invite = await prisma.waitlistSignup.findUnique({
    where: { inviteToken: token },
    select: { email: true, fullName: true, role: true, usedAt: true },
  });

  if (!invite || invite.usedAt) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({
    valid: true,
    email: invite.email,
    name: invite.fullName,
    role: invite.role,
  });
}
