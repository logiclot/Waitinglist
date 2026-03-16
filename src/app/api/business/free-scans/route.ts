import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "BUSINESS") {
    return NextResponse.json({ remaining: 0 });
  }

  const profile = await prisma.businessProfile.findUnique({
    where: { userId: session.user.id },
    select: { freeDiscoveryScansRemaining: true },
  });

  return NextResponse.json({ remaining: profile?.freeDiscoveryScansRemaining ?? 0 });
}
