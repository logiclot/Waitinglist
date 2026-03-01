import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { checkoutLimiter } from "@/lib/rate-limit";
import { log } from "@/lib/logger";
import { Analytics } from "@/lib/analytics";
import { CheckoutBodySchema } from "@/lib/schemas/api";
import { APP_URL } from "@/lib/app-url";

interface SolutionMilestone {
  title: string;
  description: string;
  price: number;
  deliveryTime?: string;
  priceCents?: number;
  status?: string;
}

interface ReferralRewards {
  expertDiscountCount: number;
  businessDiscountCount: number;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit by user ID (20 checkout attempts per minute)
  const rl = checkoutLimiter.check(session.user.id);
  if (!rl.success) {
    log.warn("checkout.rate_limited", { userId: session.user.id });
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  try {
    const raw = await req.json();
    const parsed = CheckoutBodySchema.safeParse(raw);
    if (!parsed.success) {
      log.warn("checkout.invalid_body", { errors: parsed.error.flatten() });
      return NextResponse.json({ error: "Invalid request body", details: parsed.error.flatten() }, { status: 400 });
    }
    const { solutionId, isUpgrade, type } = parsed.data;

    const solution = await prisma.solution.findUnique({
      where: { id: solutionId },
      include: { expert: true },
    });

    if (!solution) {
      return NextResponse.json({ error: "Solution not found" }, { status: 404 });
    }

    const milestones = (solution.milestones as unknown as SolutionMilestone[]) || [];
    
    // Handle Pricing Logic
    let priceCents = 0;
    let productName = "";
    let productDesc = "";
    let metadataType = "";

    if (type === "demo_booking") {
        priceCents = solution.demoPriceCents || 200; // Default 200 (2 EUR)
        productName = `${solution.title} - Expert Demo & Consultation`;
        productDesc = "Book a paid demo session with the expert.";
        metadataType = "demo_booking";
    } else if (isUpgrade) {
      if (!solution.upgradePriceCents) {
        return NextResponse.json({ error: "No upgrade price defined" }, { status: 400 });
      }
      priceCents = solution.upgradePriceCents;
      productName = `${solution.title} - Upgrade to v${solution.version || 2}`;
      productDesc = solution.changelog || "Version Upgrade";
      metadataType = "version_upgrade";
    } else {
      // Standard Milestone 1 Logic
      if (milestones.length === 0) {
        return NextResponse.json({ error: "No milestones defined" }, { status: 400 });
      }

      const firstMilestone = milestones[0];
      let priceVal = Number(firstMilestone.price);
      if (isNaN(priceVal)) priceVal = 0;
      priceCents = Math.round(priceVal * 100);
      productName = `${solution.title} - Milestone 1: ${firstMilestone.title}`;
      productDesc = firstMilestone.description;
      metadataType = "milestone_funding";
    }

    if (priceCents < 50) { // Stripe minimum is 50 cents
       return NextResponse.json({ error: `Price too low (€${(priceCents/100).toFixed(2)}). Minimum €0.50 required.` }, { status: 400 });
    }

    // For milestone orders, expert must have Stripe connected or payout will silently fail
    if (!type && !isUpgrade && !solution.expert.stripeAccountId) {
      return NextResponse.json({ error: "Expert has not connected a Stripe account yet. Checkout is unavailable." }, { status: 400 });
    }

    // Check if the buyer has a referral discount available (5% off next purchase, excluding demo bookings)
    let discountApplied = false;
    let originalPriceCents = priceCents;
    if (type !== "demo_booking") {
      const buyer = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { referralRewards: true },
      });
      const rewards = (buyer?.referralRewards as ReferralRewards | null) ?? { expertDiscountCount: 0, businessDiscountCount: 0 };
      if ((rewards.businessDiscountCount || 0) > 0) {
        originalPriceCents = priceCents;
        priceCents = Math.round(priceCents * 0.95);
        discountApplied = true;
      }
    }

    // Create or Get Business Profile
    let business = await prisma.businessProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!business) {
        // Auto-create a dummy business profile for the user to allow checkout
        log.info("checkout.business_auto_create", { userId: session.user.id });
        business = await prisma.businessProfile.create({
            data: {
                userId: session.user.id,
                firstName: session.user.name?.split(" ")[0] || "Guest",
                lastName: session.user.name?.split(" ")[1] || "User",
                companyName: "Self-Employed",
                jobRole: "Individual",
                howHeard: "Internal",
                interests: [],
                tools: [],
            }
        });
    }

    // Ensure Stripe Customer ID exists
    let stripeCustomerId = business.stripeCustomerId;
    
    if (stripeCustomerId) {
      try {
        const existingCustomer = await stripe.customers.retrieve(stripeCustomerId);
        if (existingCustomer.deleted) {
          stripeCustomerId = null; // Force recreate
        }
      } catch (e) {
        log.warn("checkout.stripe_customer_not_found", { error: String(e) });
        stripeCustomerId = null; // Force recreate
      }
    }

    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: session.user.email || undefined,
            name: `${business.firstName} ${business.lastName}`,
            metadata: {
                userId: session.user.id,
                businessId: business.id
            }
        });
        stripeCustomerId = customer.id;
        
        await prisma.businessProfile.update({
            where: { id: business.id },
            data: { stripeCustomerId }
        });
    }

    // Order Creation (Only for Milestones & Upgrades, Demo is ephemeral but we can track it as an order for simplicity and records)
    // Actually, let's create an Order for Demo too, so it shows up in billing history.
    const order = await prisma.order.create({
      data: {
        buyerId: session.user.id,
        sellerId: solution.expertId,
        solutionId: solution.id,
        priceCents: priceCents,
        status: "draft", // Will be updated to paid/approved via webhook
        deliveryNote: type === "demo_booking" ? "Paid Demo Session" : undefined,
        milestones: type === "demo_booking" 
            ? [{ title: "Demo Session", description: productDesc, price: priceCents / 100, status: "pending_payment" }]
            : isUpgrade 
                ? [{ title: "Version Upgrade", description: productDesc, price: priceCents / 100, status: "pending_payment" }]
                : milestones.map((m, index) => ({
                    ...m,
                    status: index === 0 ? "pending_payment" : "waiting",
                })),
      },
    });

    const successUrl = `${APP_URL}/business/projects?success=true&orderId=${order.id}&type=${metadataType}`;
    const cancelUrl = `${APP_URL}/solutions/${solution.id}?canceled=true`;

    // Stripe Session Config
    // TODO: type this properly — use Stripe.Checkout.SessionCreateParams from stripe package
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionConfig: any = {
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      allow_promotion_codes: true,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: productName,
              description: productDesc,
            },
            unit_amount: priceCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: order.id,
        milestoneIndex: "0",
        type: metadataType,
        expertId: solution.expertId,
        buyerId: session.user.id,
        discountApplied: discountApplied ? "true" : "false",
        originalPriceCents: discountApplied ? String(originalPriceCents) : "",
      },
    };

    // Application Fee Logic for Demo
    if (metadataType === "demo_booking") {
        // Transfer to expert minus platform fee (2 EUR = 200 cents)
        const platformFeeCents = 200;
        const transferAmount = Math.max(0, priceCents - platformFeeCents);
        
        if (transferAmount > 0 && solution.expert.stripeAccountId) {
            sessionConfig.payment_intent_data = {
                application_fee_amount: platformFeeCents,
                transfer_data: {
                    destination: solution.expert.stripeAccountId,
                },
            };
        } else {
            // If no connected account or price <= fee, platform keeps it all (or logic fails, but we assume platform keeps)
             // Or we just don't transfer.
        }
    }

    const sessionStripe = await stripe.checkout.sessions.create(sessionConfig);

    Analytics.checkoutStarted(session.user.id, {
      solutionId,
      type: type ?? "milestone_funding",
      priceCents: solution.implementationPriceCents ?? 0,
    });

    return NextResponse.json({ url: sessionStripe.url });
  } catch (error) {
    log.error("checkout.session_creation_failed", { error: String(error) });
    return NextResponse.json({ error: `Internal Server Error: ${(error as Error).message}` }, { status: 500 });
  }
}
