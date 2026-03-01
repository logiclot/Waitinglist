import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expert = await prisma.specialistProfile.findUnique({
    where: { userId: session.user.id },
    select: { stripeAccountId: true },
  });

  if (!expert?.stripeAccountId) {
    return NextResponse.json(
      { error: "No Stripe account connected" },
      { status: 400 }
    );
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(
      expert.stripeAccountId
    );
    return NextResponse.json({ url: loginLink.url });
  } catch {
    return NextResponse.json(
      { error: "Failed to create dashboard link" },
      { status: 500 }
    );
  }
}
