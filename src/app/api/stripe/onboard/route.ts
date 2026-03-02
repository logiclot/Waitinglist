import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { log } from "@/lib/logger";
import { APP_URL } from "@/lib/app-url";
import { resolveStripeCountryCode } from "@/lib/stripe-countries";

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- route handler signature requires req
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expert = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!expert) {
      log.warn("stripe.onboard.expert_not_found", { userId: session.user.id });
      return NextResponse.json({ error: "Expert profile not found" }, { status: 404 });
    }

    let accountId = expert.stripeAccountId;

    // Resolve country to ISO code — never default to a wrong country
    const countryCode = resolveStripeCountryCode(expert.country);
    if (!countryCode) {
      log.warn("stripe.onboard.country_not_resolved", { country: expert.country, expertId: expert.id });
      return NextResponse.json(
        { error: `Could not resolve country "${expert.country}" to a Stripe-supported country code. Please update your country in your profile settings.` },
        { status: 400 }
      );
    }

    if (!accountId) {
      log.info("stripe.onboard.account_create", { expertId: expert.id });
      try {
        const account = await stripe.accounts.create({
          type: "express",
          country: countryCode,
          email: session.user.email || undefined,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });
        accountId = account.id;

        await prisma.specialistProfile.update({
          where: { id: expert.id },
          data: { stripeAccountId: accountId },
        });
        log.info("stripe.onboard.account_created", { accountId });
      } catch (stripeError) {
        log.error("stripe.onboard.account_creation_failed", { error: String(stripeError), expertId: expert.id });
        return NextResponse.json({ error: "Failed to create Stripe account: " + (stripeError as Error).message }, { status: 500 });
      }
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${APP_URL}/expert/settings?stripe=refresh`,
      return_url: `${APP_URL}/expert/settings?stripe=return`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    log.error("stripe.onboard.error", { error: String(error) });
    return NextResponse.json({ error: "Internal Server Error: " + (error as Error).message }, { status: 500 });
  }
}
