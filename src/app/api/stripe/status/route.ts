import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { log } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- route handler signature requires req
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expert = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!expert) {
      return NextResponse.json({ error: "Expert profile not found" }, { status: 404 });
    }

    let isConnected = expert.stripeDetailsSubmitted;
    let chargesEnabled = expert.stripeChargesEnabled;
    let payoutsEnabled = expert.stripePayoutsEnabled;

    // If we have an account ID, sync the full status from Stripe directly.
    // This catches cases where the account.updated webhook was missed.
    if (expert.stripeAccountId) {
      try {
        const account = await stripe.accounts.retrieve(expert.stripeAccountId);

        const needsSync =
          expert.stripeDetailsSubmitted !== (account.details_submitted ?? false) ||
          expert.stripeChargesEnabled !== (account.charges_enabled ?? false) ||
          expert.stripePayoutsEnabled !== (account.payouts_enabled ?? false);

        if (needsSync) {
          isConnected = account.details_submitted ?? false;
          chargesEnabled = account.charges_enabled ?? false;
          payoutsEnabled = account.payouts_enabled ?? false;

          await prisma.specialistProfile.update({
            where: { id: expert.id },
            data: {
              stripeDetailsSubmitted: isConnected,
              stripeChargesEnabled: chargesEnabled,
              stripePayoutsEnabled: payoutsEnabled,
            },
          });
        }
      } catch (stripeError) {
        log.error("stripe.retrieve_account_failed", { error: stripeError instanceof Error ? stripeError.message : String(stripeError) });
        Sentry.captureException(stripeError);
      }
    }

    return NextResponse.json({
      isConnected,
      chargesEnabled,
      payoutsEnabled,
      accountId: expert.stripeAccountId,
    });
  } catch (error) {
    log.error("stripe.status_check_failed", { error: error instanceof Error ? error.message : String(error) });
    Sentry.captureException(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
