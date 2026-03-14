// Seed script: Creates a Discovery Scan and Custom Project for manual testing.
// Run: node scripts/seed-test-jobs.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seed() {
  const buyerId = "27572733-d835-4d96-b20e-c9ecdaf265b5"; // saldo.helpdesk@gmail.com (BUSINESS)

  // ── 1. Upgrade one expert to ELITE so they can bid ──
  const expertProfile = await prisma.specialistProfile.update({
    where: { id: "8da034fa-9d6f-4ff2-890e-4eb2290398dd" }, // LANGA (langa.claudiu1995@gmail.com)
    data: { tier: "ELITE" },
  });
  console.log("Upgraded", expertProfile.displayName, "to ELITE tier");

  // ── 2. Create Discovery Scan job post ──
  const discoveryBrief = JSON.stringify({
    version: "2.0",
    sections: [
      {
        id: "a",
        title: "Business Context",
        qa: [
          {
            q: "What does your company do?",
            a: "We run a mid-size e-commerce business selling organic skincare products across Europe. We have around 35 employees and process about 2,000 orders per month.",
          },
          {
            q: "Products/Services",
            a: "Organic skincare - serums, moisturisers, SPF products. Sold DTC via Shopify and wholesale via email-based ordering.",
          },
          { q: "Company size", a: "35 employees, 8 in operations" },
        ],
      },
      {
        id: "b",
        title: "Current Pain Points",
        qa: [
          {
            q: "What are your biggest operational bottlenecks?",
            a: "Order processing is still semi-manual. Customer support responds to the same 10 questions over and over. Returns processing takes 3-5 days because we manually check inventory after each one.",
          },
          {
            q: "How much time is spent on repetitive tasks weekly?",
            a: "Roughly 40+ hours across the team - mostly data entry, order status updates, and copy-pasting between Shopify, Google Sheets, and our 3PL portal.",
          },
          {
            q: "Have you tried automating before?",
            a: "We set up a few Zapier workflows a year ago but they kept breaking and nobody maintained them. We don't have a technical person on staff.",
          },
        ],
      },
      {
        id: "c",
        title: "Tools & Systems",
        qa: [
          {
            q: "What tools do you currently use?",
            a: "Shopify (storefront), Google Workspace (docs/sheets/email), Zendesk (support tickets), ShipStation (fulfilment), QuickBooks (accounting), Slack (internal comms)",
          },
          {
            q: "Any integrations currently in place?",
            a: "Shopify to ShipStation is connected. Everything else is manual - we export CSVs from Shopify and import them into QuickBooks weekly.",
          },
        ],
      },
      {
        id: "d",
        title: "Goals & Budget",
        qa: [
          {
            q: "What would success look like?",
            a: "Ideally we want order processing to be fully hands-off, support tickets auto-triaged, and returns handled in under 24 hours. Would love to free up 20+ hours per week.",
          },
          {
            q: "Budget expectations",
            a: "We can invest 2,000-5,000 EUR for the initial setup if the ROI makes sense. Happy to pay monthly for ongoing automation tooling.",
          },
          {
            q: "Timeline preference",
            a: "Would love to see quick wins within 2 weeks and a full rollout within 6 weeks.",
          },
        ],
      },
    ],
  });

  const discoveryJob = await prisma.jobPost.create({
    data: {
      buyerId,
      title: "Discovery Scan: E-Commerce Operations Audit",
      goal: discoveryBrief,
      category: "Discovery Scan",
      tools: ["Shopify", "Zendesk", "Google Sheets", "ShipStation", "QuickBooks"],
      budgetRange: "\u20ac50 (Discovery)",
      timeline: "Discovery Phase",
      status: "open",
      paidAt: new Date(),
      paymentProvider: "simulated",
    },
  });
  console.log("Created Discovery Scan job:", discoveryJob.id);

  // ── 3. Create Custom Project job post ──
  const customGoal = [
    "We need a complete customer support automation system for our SaaS platform (project management tool with ~2,500 active users).",
    "",
    "Current situation:",
    "- We get 150-200 support tickets per day via Intercom",
    "- 60% are repetitive (password resets, billing questions, feature how-tos)",
    "- Our 3-person support team is overwhelmed and response times have climbed to 8+ hours",
    "- We have a knowledge base on Notion but customers rarely find it",
    "",
    "What we want:",
    "1. AI-powered auto-responder that handles the repetitive 60% of tickets using our knowledge base",
    "2. Smart routing for remaining tickets - billing issues go to finance, bug reports go to engineering",
    "3. Automated follow-up sequences (check back after 48h if no reply, auto-close after 5 days)",
    "4. Weekly digest report showing ticket volume, resolution times, and automation hit rate",
    "",
    "Our stack: Intercom (support), Notion (knowledge base), Slack (internal alerts), Linear (bug tracking), Stripe (billing)",
    "",
    "We want a specialist who can set this up end-to-end including the AI training on our knowledge base. Budget is flexible for the right solution.",
  ].join("\n");

  const customJob = await prisma.jobPost.create({
    data: {
      buyerId,
      title: "AI-Powered Customer Support Automation for SaaS Platform",
      goal: customGoal,
      category: "Customer Support",
      tools: ["Intercom", "Notion", "Slack", "Linear", "Stripe"],
      budgetRange: "$1,500\u2013$5,000",
      timeline: "1 month",
      status: "open",
      paidAt: new Date(),
      paymentProvider: "simulated",
    },
  });
  console.log("Created Custom Project job:", customJob.id);

  // ── 4. Create notifications for the business user ──
  await prisma.notification.createMany({
    data: [
      {
        userId: buyerId,
        title: "\uD83D\uDD14 Discovery Scan Posted",
        message:
          'Your Discovery Scan "E-Commerce Operations Audit" is now live. Up to 5 expert proposals will be submitted - you\'ll be notified as they arrive.',
        type: "success",
        actionUrl: "/jobs/" + discoveryJob.id,
      },
      {
        userId: buyerId,
        title: "\uD83D\uDD14 Custom Project Posted",
        message:
          'Your Custom Project "AI-Powered Customer Support Automation" is now live. Up to 3 expert proposals will be submitted - you\'ll be notified as they arrive.',
        type: "success",
        actionUrl: "/jobs/" + customJob.id,
      },
      {
        userId: buyerId,
        title: "\uD83E\uDDFE Invoice available",
        message:
          'Your invoice for the "E-Commerce Operations Audit" posting fee is ready. View and download it anytime.',
        type: "info",
        actionUrl: "/invoice/job/" + discoveryJob.id,
      },
      {
        userId: buyerId,
        title: "\uD83E\uDDFE Invoice available",
        message:
          'Your invoice for the "AI-Powered Customer Support Automation" posting fee is ready. View and download it anytime.',
        type: "info",
        actionUrl: "/invoice/job/" + customJob.id,
      },
    ],
  });
  console.log("Created notifications for business user");

  // ── 5. Notify ELITE experts about the new jobs ──
  const eliteExperts = await prisma.specialistProfile.findMany({
    where: {
      status: "APPROVED",
      OR: [{ tier: "ELITE" }, { isFoundingExpert: true }],
    },
    select: { userId: true, displayName: true },
  });

  for (const expert of eliteExperts) {
    await prisma.notification.createMany({
      data: [
        {
          userId: expert.userId,
          title: "\uD83D\uDD14 New Discovery Scan posted",
          message:
            '"E-Commerce Operations Audit" - Shopify, Zendesk, Google Sheets. Up to 5 proposals accepted.',
          type: "info",
          actionUrl: "/jobs/" + discoveryJob.id,
        },
        {
          userId: expert.userId,
          title: "\uD83D\uDD14 New Custom Project posted",
          message:
            '"AI-Powered Customer Support Automation for SaaS Platform" - Intercom, Notion, Slack. Budget: $1,500-$5,000. Up to 3 proposals accepted.',
          type: "info",
          actionUrl: "/jobs/" + customJob.id,
        },
      ],
    });
    console.log("Notified expert:", expert.displayName);
  }

  console.log("\nSeed complete!");
  console.log("Discovery Scan: /jobs/" + discoveryJob.id);
  console.log("Custom Project: /jobs/" + customJob.id);
  console.log(
    "\nLog in as saldo.helpdesk@gmail.com (BUSINESS) to see the posted jobs."
  );
  console.log(
    "Log in as langa.claudiu1995@gmail.com (EXPERT, ELITE) to bid on them."
  );
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
