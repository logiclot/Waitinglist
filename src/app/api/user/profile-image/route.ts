import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const profileImageUrl = typeof body.profileImageUrl === "string" ? body.profileImageUrl : null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { profileImageUrl: profileImageUrl || null },
  });

  return NextResponse.json({ success: true });
}
