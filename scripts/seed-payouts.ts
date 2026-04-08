/**
 * Seed script: Create mocked ManualPayout records for testing.
 * Run with: npx tsx scripts/seed-payouts.ts
 *
 * Prerequisites: At least one SpecialistProfile and one Order must exist.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Grab existing specialists and orders to attach payouts to
  const specialists = await prisma.specialistProfile.findMany({
    take: 5,
    include: { user: { select: { email: true } } },
  });

  if (specialists.length === 0) {
    console.error("❌ No specialist profiles found. Seed some experts first.");
    process.exit(1);
  }

  const orders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  if (orders.length === 0) {
    console.error("❌ No orders found. Seed some orders first.");
    process.exit(1);
  }

  const MOCK_PAYOUTS = [
    {
      milestoneIndex: 0,
      milestoneTitle: "Initial research & analysis",
      amountCents: 45000,
      platformFeeCents: 5000,
      currency: "EUR",
      status: "transferred",
      transferredAt: new Date("2026-03-15"),
      transferNote: "Wise transfer #TRF-90241",
    },
    {
      milestoneIndex: 1,
      milestoneTitle: "Draft deliverable",
      amountCents: 72000,
      platformFeeCents: 8000,
      currency: "EUR",
      status: "transferred",
      transferredAt: new Date("2026-03-22"),
      transferNote: "Wise transfer #TRF-90358",
    },
    {
      milestoneIndex: 0,
      milestoneTitle: "Full project delivery",
      amountCents: 135000,
      platformFeeCents: 15000,
      currency: "USD",
      status: "pending",
      transferredAt: null,
      transferNote: null,
    },
    {
      milestoneIndex: 0,
      milestoneTitle: "Strategy consultation",
      amountCents: 27000,
      platformFeeCents: 3000,
      currency: "EUR",
      status: "pending",
      transferredAt: null,
      transferNote: null,
    },
    {
      milestoneIndex: 2,
      milestoneTitle: "Final revisions & handoff",
      amountCents: 54000,
      platformFeeCents: 6000,
      currency: "EUR",
      status: "cancelled",
      transferredAt: null,
      transferNote: null,
    },
    {
      milestoneIndex: 0,
      milestoneTitle: "Data pipeline setup",
      amountCents: 90000,
      platformFeeCents: 10000,
      currency: "USD",
      status: "transferred",
      transferredAt: new Date("2026-04-01"),
      transferNote: "Wise transfer #TRF-91002",
    },
    {
      milestoneIndex: 1,
      milestoneTitle: "Dashboard build-out",
      amountCents: 63000,
      platformFeeCents: 7000,
      currency: "EUR",
      status: "pending",
      transferredAt: null,
      transferNote: null,
    },
  ];

  let created = 0;

  for (let i = 0; i < MOCK_PAYOUTS.length; i++) {
    const mock = MOCK_PAYOUTS[i];
    const specialist = specialists[i % specialists.length];
    const order = orders[i % orders.length];

    await prisma.manualPayout.create({
      data: {
        specialistId: specialist.id,
        orderId: order.id,
        milestoneIndex: mock.milestoneIndex,
        milestoneTitle: mock.milestoneTitle,
        amountCents: mock.amountCents,
        platformFeeCents: mock.platformFeeCents,
        currency: mock.currency,
        status: mock.status,
        transferredAt: mock.transferredAt,
        transferNote: mock.transferNote,
      },
    });

    const amount = (mock.amountCents / 100).toFixed(2);
    const fee = (mock.platformFeeCents / 100).toFixed(2);
    console.log(
      `  ✅ ${mock.status.padEnd(11)} | ${mock.currency} ${amount.padStart(8)} (fee: ${fee}) | ${specialist.user.email} | "${mock.milestoneTitle}"`
    );
    created++;
  }

  console.log(`\n🎉 Seeded ${created} mock payouts.`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
