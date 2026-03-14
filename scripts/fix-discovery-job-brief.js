// Fix the seeded Discovery Scan to use correct BriefV2 section IDs and Q&A structure.
// The detail page renders sections A–G with specific qa() index expectations.
// Run: node scripts/fix-discovery-job-brief.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fix() {
  const job = await prisma.jobPost.findFirst({
    where: { title: "Discovery Scan: E-Commerce Operations Audit" },
    select: { id: true },
  });

  if (!job) {
    console.log("Discovery Scan job not found.");
    return;
  }

  // Matches the real Discovery Scan wizard output structure exactly.
  // Section IDs must be uppercase A–G.
  // qa(s, i) indices must match what SectionA–F components expect.
  const briefData = JSON.stringify({
    version: "2.0",
    sections: [
      {
        // Section A — Business Context
        // SectionA reads: qa(s,0) = business model, qa(s,1) = what they sell, qa(s,2) = team size
        id: "A",
        title: "Business Context",
        qa: [
          { q: "What best describes your business?", a: "E-commerce / DTC" },
          { q: "What do you primarily sell?", a: "Organic skincare products — serums, moisturisers, and SPF. Sold direct-to-consumer via Shopify across Europe, plus wholesale via email-based ordering." },
          { q: "How big is your team?", a: "35 employees total, 8 in operations" },
        ],
      },
      {
        // Section B — Revenue & Operations
        // SectionB reads: qa(s,0..6) = customer acquisition, lead conversion, after-sale triggers,
        //                 revenue tracking, revenue predictability, what breaks at scale, handoffs
        id: "B",
        title: "Revenue & Operations",
        qa: [
          { q: "How do customers find you?", a: "Instagram ads, Google Shopping, organic SEO, and word-of-mouth referrals from existing customers." },
          { q: "How do leads convert?", a: "Customers browse the Shopify store, add to cart, and checkout. Wholesale clients email orders which we manually enter into the system." },
          { q: "What triggers after-sale work?", a: "Every order triggers fulfilment via ShipStation, but returns and exchanges require manual inventory checks that take 3-5 days." },
          { q: "How do you track revenue?", a: "Shopify dashboard for DTC sales. Weekly CSV exports into QuickBooks for accounting. Wholesale tracked in Google Sheets." },
          { q: "How predictable is your revenue?", a: "DTC is fairly predictable (seasonal spikes in summer for SPF). Wholesale is lumpy — large orders come in irregularly." },
          { q: "What breaks when you try to scale?", a: "Order processing is semi-manual — copy-pasting between Shopify, Google Sheets, and ShipStation. At 2,000+ orders/month, errors creep in and the team gets overwhelmed." },
          { q: "Where do handoffs happen?", a: "Sales to fulfilment (Shopify to ShipStation), support to returns (Zendesk to manual spreadsheet), and accounting (Shopify CSV export to QuickBooks weekly)." },
        ],
      },
      {
        // Section C — Tools & Stack
        // SectionC reads: qa(s,0) = core tools, qa(s,1) = source of truth, qa(s,2) = automation today
        id: "C",
        title: "Tools & Stack",
        qa: [
          { q: "What are your core tools?", a: ["Shopify", "Google Workspace", "Zendesk", "ShipStation", "QuickBooks", "Slack"] },
          { q: "Where is your source of truth?", a: "Shopify for orders and inventory. QuickBooks for financials. Google Sheets for wholesale tracking — but these often go out of sync." },
          { q: "What automation do you use today?", a: "Shopify to ShipStation is connected natively. Everything else is manual. We tried Zapier a year ago but the workflows kept breaking and nobody knew how to fix them." },
        ],
      },
      {
        // Section D — Pain Signals
        // SectionD reads: qa(s,0) = manual time drains, qa(s,1) = mistakes, qa(s,2) = slow spots, qa(s,3) = visibility
        id: "D",
        title: "Process Pain Signals",
        qa: [
          { q: "Where do you spend the most manual time?", a: "Data entry — copying order details between systems, manually updating spreadsheets, and responding to the same 10 support questions over and over. Roughly 40+ hours per week across the team." },
          { q: "Where do mistakes happen?", a: "Wrong items shipped (manual order entry errors), duplicate QuickBooks entries from bad CSV imports, and returns assigned to wrong inventory locations." },
          { q: "Where are things slow?", a: "Returns processing takes 3-5 days because we manually check inventory after each return. Customer support response time is 6-8 hours because agents search through Zendesk history to find previous answers." },
          { q: "How much visibility do you have into operations?", a: "Very limited. No real-time dashboards. We find out about problems when customers complain or when the weekly QuickBooks reconciliation surfaces discrepancies." },
        ],
      },
      {
        // Section E — Constraints
        // SectionE reads: qa(s,0) = system access, qa(s,1) = compliance, qa(s,2) = environments, qa(s,3) = vendor lock-ins
        id: "E",
        title: "Risk, Access & Constraints",
        qa: [
          { q: "What system access can you provide?", a: "Full admin on Shopify, Zendesk, Google Workspace. Read-only on QuickBooks (accountant manages write access). ShipStation API keys available." },
          { q: "Any compliance requirements?", a: "GDPR compliant (EU customers). Customer PII must stay within EU data centres. No sharing customer emails with third-party marketing tools without consent." },
          { q: "What environments do you work in?", a: "All cloud-based SaaS tools. No on-premise infrastructure. Team uses a mix of Mac and Windows laptops." },
          { q: "Any vendor lock-ins?", a: "Shopify annual contract (8 months remaining). QuickBooks subscription. No other long-term commitments — open to switching Zendesk if a better option exists." },
        ],
      },
      {
        // Section F — Outcome Orientation
        // SectionF reads: qa(s,0) = success metrics, qa(s,1) = top priority, qa(s,2) = if nothing changes, qa(s,3) = good proposal criteria
        id: "F",
        title: "Outcome Orientation",
        qa: [
          { q: "What does success look like in 3-6 months?", a: "Order processing is fully hands-off. Support tickets are auto-triaged. Returns handled in under 24 hours. Team freed up 20+ hours per week to focus on growth." },
          { q: "What is your single top priority?", a: "Eliminate the 40+ hours of weekly data entry and copy-pasting between systems. That alone would transform our operations." },
          { q: "What happens if nothing changes?", a: "We will need to hire 2-3 more operations staff within 6 months just to keep up. That is 6,000-9,000 EUR/month in salaries that could instead fund automation." },
          { q: "What makes a proposal stand out to you?", a: "Clear ROI calculation, phased approach (quick wins first), realistic timelines, and a maintenance plan so we do not end up with broken Zapier workflows again." },
        ],
      },
      {
        // Section G — Final note
        // Rendered as "In their own words" blockquote. qa(s,0) = free text
        id: "G",
        title: "Final Note",
        qa: [
          { q: "Anything else?", a: "We are ready to invest 2,000-5,000 EUR for the initial setup if the ROI makes sense. We are also happy to pay monthly for ongoing automation tooling. Quick wins within 2 weeks and full rollout within 6 weeks would be ideal. We do not have a technical person on staff, so the solution needs to be maintainable by non-technical team members." },
        ],
      },
    ],
  });

  await prisma.jobPost.update({
    where: { id: job.id },
    data: { goal: briefData },
  });

  console.log("Updated Discovery Scan", job.id, "with correct BriefV2 structure (sections A-G, uppercase IDs).");
  console.log("Refresh /jobs/" + job.id + " to see the populated sections.");
}

fix()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
