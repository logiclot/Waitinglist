/**
 * ONE-TIME demo seeder — creates sample job posts and bids so you can
 * see the full discovery scan / custom project flow in the UI.
 *
 * DELETE THIS FILE before going live.
 *
 * Usage:  visit /api/admin/seed-demo while logged in as admin.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // Accept either: logged-in admin OR the dev secret key
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  const hasSecret = secret === (process.env.SEED_SECRET ?? "logiclot-seed-dev");

  if (!isAdmin && !hasSecret) {
    return NextResponse.json({ error: "Admin only — pass ?secret=logiclot-seed-dev or log in as admin" }, { status: 403 });
  }

  // ── 1. Find a business user to be the demo buyer ──────────────────────────
  const businessUser = await prisma.user.findFirst({
    where: { role: "BUSINESS" },
    include: { businessProfile: true },
  });

  if (!businessUser) {
    return NextResponse.json(
      { error: "No BUSINESS user found. Create one via onboarding first." },
      { status: 400 }
    );
  }

  // ── 2. Find an expert to be the demo bidder ───────────────────────────────
  const expertProfile = await prisma.specialistProfile.findFirst({
    include: { user: true },
  });

  if (!expertProfile) {
    return NextResponse.json(
      { error: "No expert profile found. Create one via onboarding first." },
      { status: 400 }
    );
  }

  // Temporarily upgrade the expert to ELITE so they can see and bid on jobs
  await prisma.specialistProfile.update({
    where: { id: expertProfile.id },
    data: { tier: "ELITE" },
  });

  // ── 3. Create the Discovery Scan demo job ─────────────────────────────────
  const discoveryGoal = JSON.stringify({
        version: "2",
        sections: [
          {
            id: "A",
            title: "Business Context",
            subtitle: "Basic details about your organization",
            qa: [
              { q: "What best describes your business model?",  a: "B2B SaaS — subscription software for independent retailers" },
              { q: "What do you primarily sell?",               a: ["Inventory management software", "API integrations", "Onboarding services"] },
              { q: "Approximate company size",                  a: "8 people (2 founders, 3 product, 2 ops, 1 customer success)" },
            ],
          },
          {
            id: "B",
            title: "Revenue & Operations",
            subtitle: "How money and work flow through your business",
            qa: [
              { q: "How does a typical customer find you?",                    a: ["Cold email outreach", "LinkedIn", "Referrals from existing clients"] },
              { q: "How do customers usually convert?",                        a: "30-minute demo call → 14-day free trial → paid subscription" },
              { q: "What triggers work internally after a customer converts?", a: ["New Stripe payment confirmed", "Monthly renewal", "Support ticket opened"] },
              { q: "How is revenue tracked today?",                            a: "Stripe dashboard + manual spreadsheet reconciled monthly" },
              { q: "How predictable is your revenue?",                         a: "Mostly predictable — recurring MRR but high churn in first 90 days" },
              { q: "What happens when volume increases?",                      a: "Customer success gets overloaded, onboarding delays increase, errors spike" },
              { q: "Where do handoffs between teams or tools usually happen?", a: ["Sales → CS (onboarding)", "CS → Dev support (technical issues)", "Ops → Finance (invoicing)"] },
            ],
          },
          {
            id: "C",
            title: "Tools & Stack",
            subtitle: "Technical constraints and integration effort",
            qa: [
              { q: "Which tools are core to your daily operations?", a: ["Stripe", "HubSpot CRM", "Slack", "Notion", "Intercom", "Google Workspace"] },
              { q: "Where is your \"source of truth\" today?",       a: "HubSpot (CRM + deal pipeline)" },
              { q: "Are you already using any automation?",          a: "Minimal — a few Zapier zaps for lead capture, rest is manual" },
            ],
          },
          {
            id: "D",
            title: "Process Pain Signals",
            subtitle: "Where friction exists in your day-to-day",
            highlight: true,
            qa: [
              { q: "Which activities consume the most manual time each week?", a: ["Manual customer onboarding (45 min/customer × 60 customers/month = 45 hrs/month)", "Monthly Stripe-to-spreadsheet reconciliation (8 hrs/month)", "Sending invoices and renewal reminders manually"] },
              { q: "Which tasks often lead to mistakes or need redoing?",     a: ["CRM data entry — wrong plan info entered at signup", "Slack invite sent to wrong workspace", "Wrong subscription tier activated in the billing system"] },
              { q: "Where do delays most often occur?",                        a: ["Customer waiting 2–4 hours for Slack access after payment", "Monthly reports 3–5 days late"] },
              { q: "How visible are your operations right now?",               a: "None — no dashboard showing onboarding status, no alert when a step fails" },
            ],
          },
          {
            id: "E",
            title: "Risk, Access & Constraints",
            subtitle: "Boundaries for the proposed solution",
            qa: [
              { q: "What level of system access are you comfortable with?",   a: "Full API access available for Stripe, HubSpot, Slack, Intercom" },
              { q: "Are there compliance or regulatory constraints?",         a: ["GDPR — customer data must stay in the EU", "No US-only SaaS tools allowed"] },
              { q: "What environments do you operate in?",                    a: ["Production only — no staging environment currently"] },
              { q: "Are there tools or vendors that must NOT be changed?",    a: "Yes — Cannot replace HubSpot (locked in 12-month contract), Intercom stays" },
            ],
          },
          {
            id: "F",
            title: "Outcome Orientation",
            subtitle: "What success looks like for you",
            highlight: true,
            qa: [
              { q: "What would success look like in 3–6 months?",    a: ["Zero manual steps in the onboarding flow", "Reconciliation runs automatically every month", "Team handles 10× volume without new hires", "Error rate under 1%"] },
              { q: "Which outcome matters most right now?",           a: "Customer onboarding automation — this is the biggest pain and highest ROI" },
              { q: "If nothing changes, what happens?",               a: "At current growth rate we need to hire 2 more ops people in Q3 — that\u2019s \u20ac80k+/year in salaries we\u2019d rather not spend" },
              { q: "How will you decide if a proposal is \"good\"?", a: ["Must work within our existing stack (no new tools)", "Must go live within 3 weeks", "Expert works directly inside our accounts — not a black box"] },
            ],
          },
          {
            id: "G",
            title: "In Their Own Words",
            subtitle: "Final clarifier from the business",
            qa: [
              { q: "Is there anything about your business that would change how solutions should be designed?", a: "We are onboarding about 15 new customers per week now, growing to 30+ in Q4. If we don\u2019t automate this by October we physically cannot handle it. We tried to build something with Zapier but it broke every time the Stripe webhook changed. Looking for someone who has done this exact thing \u2014 HubSpot + Stripe + Slack \u2014 before and can point to it." },
            ],
          },
        ],
  });

  const discoveryJob = await prisma.jobPost.upsert({
    where: { id: "demo-discovery-scan-001" },
    update: { goal: discoveryGoal },
    create: {
      id: "demo-discovery-scan-001",
      buyerId: businessUser.id,
      title: "Discovery: SaaS E-Commerce Automation",
      goal: discoveryGoal,
      category: "Discovery",
      budgetRange: "€50 (Discovery)",
      timeline: "Discovery Phase",
      tools: ["Slack", "Stripe", "HubSpot", "Shopify"],
      status: "open",
      paidAt: new Date(),
      paymentProvider: "stripe_stub",
    },
  });

  // ── 4. Create the Custom Project demo job ─────────────────────────────────
  const customProjectGoal = JSON.stringify({
    version: "2",
    sections: [
      {
        id: "A",
        title: "Business Context & Problem",
        subtitle: "What the business does and the core issue to solve",
        qa: [
          { q: "What best describes your business?",       a: "B2B services / agency — we onboard clients onto our retainer programme" },
          { q: "What do you primarily sell?",              a: ["Services", "Subscriptions / recurring plans"] },
          { q: "Primary customer journey",                 a: "Customers talk to sales before buying (sales-assisted)" },
          { q: "Problem to solve",                         a: "After a customer pays via Stripe, onboarding requires 45 minutes of manual work per customer across 4 tools — none of which talk to each other." },
          { q: "Where does this problem show up?",         a: ["Customer experience (inconsistent onboarding)", "Internal operations (repeated manual steps)", "Team capacity (bottleneck when volume grows)"] },
          { q: "How long has this problem existed?",       a: "Over a year — we always planned to fix it but kept deprioritising" },
          { q: "What triggers or exposes this problem?",   a: "Every single new paying customer — it happens 60 times a month right now" },
          { q: "Additional context",                       a: "We're growing fast — expecting 30+ sign-ups/week by Q4. If this isn't fixed we physically cannot handle it without new hires." },
        ],
      },
      {
        id: "B",
        title: "Current Process",
        subtitle: "How it works — or breaks — today",
        qa: [
          { q: "How is this process handled right now?",   a: "Fully manual — one ops person does it all after receiving a Slack alert from Stripe" },
          { q: "Which tools are involved?",                a: ["CRM (HubSpot)", "Email (Resend)", "Slack", "Calendly", "Stripe"] },
          { q: "Where does this process slow down?",       a: "Manual input / duplication — copying customer data from Stripe into HubSpot, then again into the Slack invite, then into Calendly" },
          { q: "Who is most affected?",                    a: ["The customer (waits hours for access)", "Ops team (bottleneck)", "Account managers (can't prepare without CRM entry)"] },
          { q: "Source of truth for this process",         a: "Stripe — payment confirmation is the trigger, but data then needs to be manually pushed everywhere else" },
          { q: "Process description",                      a: "1. Stripe payment confirmed → 2. Ops manually creates HubSpot contact → 3. Sends welcome email via Resend → 4. Invites customer to Slack → 5. Schedules kickoff in Calendly → 6. Posts a summary in #new-customers. Total: 45 min/customer." },
        ],
      },
      {
        id: "C",
        title: "Impact & Risk",
        subtitle: "Why this matters and what's at stake",
        qa: [
          { q: "Main impact of this problem",              a: "Lost time — 45 hrs/month (and growing) on repetitive manual work that should be automated" },
          { q: "What happens if not solved?",              a: "The problem scales with volume — at 30 sign-ups/week we'd need a dedicated full-time ops hire just for onboarding" },
          { q: "How critical is this to the business?",    a: "Business-critical — it directly affects every new customer's first impression and our team's ability to scale" },
          { q: "Deadline or urgency driver",               a: "Yes — Q4 growth target requires this live before October or we miss the window" },
          { q: "Risks or concerns",                        a: "We tried Zapier once but the webhook connection kept breaking whenever Stripe updated their payload structure. Need something robust." },
        ],
      },
      {
        id: "D",
        title: "Constraints & Boundaries",
        subtitle: "What experts must respect",
        qa: [
          { q: "Tools that must be used",                  a: "Yes — HubSpot (CRM), Resend (email), Slack (workspace), Calendly (scheduling). All accounts already exist." },
          { q: "Systems that must NOT be changed",         a: "Yes — HubSpot configuration must not be changed. Existing pipelines and properties must remain intact." },
          { q: "Acceptable system access level",           a: "Full API access — we'll provide API keys. Expert works inside our existing accounts." },
          { q: "Who will implement the solution?",         a: "External expert builds and hands over — our ops team will maintain it after documentation" },
          { q: "Additional boundaries",                    a: "Customer data must remain GDPR-compliant — EU only, no US-only SaaS tools." },
        ],
      },
      {
        id: "E",
        title: "Outcome & Success Criteria",
        subtitle: "What done looks like",
        qa: [
          { q: "What does a successful solution look like?",          a: ["Zero manual steps in the onboarding flow", "Customer receives welcome email, Slack invite, and kickoff booking within 5 minutes of payment", "Ops team alerted in Slack automatically — no manual monitoring required"] },
          { q: "Which outcome matters most?",                         a: "Eliminating manual work — the 45 minutes per customer is the number we want at zero" },
          { q: "How will you judge success?",                         a: "Run 5 real customer sign-ups through the automation with zero manual intervention from ops" },
          { q: 'What would make you say "this solved my problem"?',   a: "Ops team can take a day off during a sign-up day and every customer still gets onboarded perfectly" },
          { q: "Required proof of completion",                        a: "Live demo on real customer data + Loom walkthrough of the full scenario with error handling explained" },
        ],
      },
      {
        id: "F",
        title: "Final Clarifier",
        subtitle: "Extra context from the business owner",
        qa: [
          { q: "Anything else that would help experts?",   a: "We already have Make.com on our shortlist — preference for Make.com or n8n over Zapier given our previous bad experience. Budget is €1,500–€3,000 and we are serious about moving fast. The expert who wins this will likely get invited to automate our churn recovery flow next." },
        ],
      },
    ],
  });

  const customJob = await prisma.jobPost.upsert({
    where: { id: "demo-custom-project-001" },
    update: { goal: customProjectGoal },
    create: {
      id: "demo-custom-project-001",
      buyerId: businessUser.id,
      title: "Build a customer onboarding automation pipeline",
      goal: customProjectGoal,
      category: "Custom Project",
      budgetRange: "€1,500 – €3,000",
      timeline: "2–3 weeks",
      tools: ["HubSpot", "Slack", "Calendly", "Resend", "Make.com"],
      status: "open",
      paidAt: new Date(),
      paymentProvider: "stripe_stub",
    },
  });

  // ── 5. Create demo bids (one on each job from the expert) ─────────────────
  const discoveryProposal = JSON.stringify({
    automationTitle: "Customer Onboarding Pipeline — Zero Manual Steps",
    problemAddressed:
      "Your onboarding currently takes 45 minutes per customer, manually. At 60 sign-ups/month that's 45 hours of repetitive work — work that breaks as you scale and creates inconsistent customer experiences. This is the single highest-ROI thing to automate first.",
    whatYoullBuild:
      "A Make.com scenario triggered by a confirmed Stripe payment that automatically: (1) creates a HubSpot CRM contact with all customer data mapped to the right fields, (2) sends a personalised welcome email via Resend with their specific plan details, (3) invites them to your Slack workspace with the correct channel permissions, (4) books a kickoff call in Calendly with their account manager pre-assigned, and (5) posts a summary card in your internal #new-customers Slack channel. Full error handling and retry logic so nothing silently fails.",
    outcomes: [
      { what: "Manual time per onboarding", value: "45 min → 0", timeframe: "From day 1 after go-live" },
      { what: "Hours recovered per month", value: "45 hrs/month", timeframe: "Immediately" },
      { what: "Customer experience consistency", value: "100% uniform", timeframe: "Every single sign-up" },
    ],
    tools: ["Make.com", "HubSpot", "Resend", "Slack", "Calendly", "Stripe (webhook)"],
    phases: [
      {
        name: "Phase 1 — Core pipeline",
        scope: "Stripe webhook → HubSpot CRM creation + Resend welcome email. Field mapping, email template, and error handling.",
        duration: "Week 1",
      },
      {
        name: "Phase 2 — Collaboration layer",
        scope: "Slack workspace invite + Calendly kickoff scheduling + ops team notification card in #new-customers.",
        duration: "Week 2",
      },
      {
        name: "Phase 3 — QA & handover",
        scope: "Full test run on real data, documentation walkthrough, 30-minute handover call with your team.",
        duration: "Week 3",
      },
    ],
    included: [
      "Full Make.com scenario built inside your account",
      "Resend welcome email template (HTML)",
      "HubSpot field mapping & contact creation",
      "Slack invite automation + ops alert",
      "Calendly booking with account manager pre-selection",
      "Written documentation + Loom walkthrough",
      "30-day support window for bug fixes",
    ],
    excluded: [
      "Ongoing maintenance after 30-day support window",
      "Additional integrations not listed above",
      "Data migration from any previous system",
      "Custom CRM workflows beyond contact creation",
    ],
    credibility:
      "I've built 14 customer onboarding automations for B2B SaaS companies, 4 of them using this exact HubSpot + Slack + Calendly stack. One client — similar size, 80 sign-ups/month — went from 50 minutes per customer to fully automated in 12 days. Happy to share a case study if it helps.",
  });

  const discoveryBid = await prisma.bid.upsert({
    where: {
      jobPostId_specialistId: {
        jobPostId: discoveryJob.id,
        specialistId: expertProfile.id,
      },
    },
    update: { proposedApproach: discoveryProposal },
    create: {
      jobPostId: discoveryJob.id,
      specialistId: expertProfile.id,
      message:
        "Based on your pain points around manual onboarding and 60 sign-ups/month, I recommend building a fully automated pipeline that handles the entire new-customer journey — CRM entry, welcome email, Slack invite, and kickoff scheduling — with zero manual intervention. Built in Make.com inside your account, live in 3 weeks.",
      estimatedTime: "3 weeks",
      priceEstimate: "€1,800",
      proposedApproach: discoveryProposal,
      status: "submitted",
    },
  });

  const customProposal = JSON.stringify({
    automationTitle: "End-to-End B2B Customer Onboarding Automation",
    problemAddressed:
      "The project brief describes 45 minutes of manual work per sign-up across 4 systems (HubSpot, Resend, Slack, Calendly). At 60 customers/month, that's a part-time job that only exists because the tools aren't talking to each other. This is a straightforward integration problem with a very high ROI.",
    whatYoullBuild:
      "A Make.com automation triggered by Stripe webhooks (payment_intent.succeeded) that orchestrates the full onboarding sequence: HubSpot contact creation with all relevant fields, personalised Resend welcome email using your existing templates, Slack workspace invite via the API, Calendly booking with the correct account manager pre-selected based on customer region/plan, and an internal ops notification in Slack. Built in your Make.com account with documented error paths so your team can maintain it.",
    outcomes: [
      { what: "Manual onboarding time", value: "0 minutes", timeframe: "From go-live" },
      { what: "Monthly hours recovered", value: "45+ hours", timeframe: "Month 1" },
      { what: "Error rate in customer data", value: "Near zero", timeframe: "Eliminates manual entry errors" },
      { what: "Time to first customer contact", value: "Under 2 minutes", timeframe: "vs. current same-day or next-day" },
    ],
    tools: ["Make.com", "Stripe (webhook)", "HubSpot CRM", "Resend", "Slack API", "Calendly"],
    phases: [
      {
        name: "Phase 1 — Stripe → HubSpot + Resend",
        scope: "Webhook listener, contact creation, field mapping, welcome email trigger. Includes test suite.",
        duration: "Week 1",
      },
      {
        name: "Phase 2 — Slack + Calendly",
        scope: "Slack workspace invite with correct channel permissions. Calendly booking with account manager routing logic.",
        duration: "Week 2",
      },
      {
        name: "Phase 3 — Ops notifications + QA",
        scope: "Internal ops Slack card, end-to-end QA on real data, monitoring dashboard in Make.com, handover session.",
        duration: "Week 3",
      },
    ],
    included: [
      "Full scenario built in your Make.com account",
      "Stripe webhook setup & verification",
      "HubSpot contact creation with all mapped fields",
      "Resend email trigger (uses your existing templates)",
      "Slack API workspace invite automation",
      "Calendly booking with account manager routing",
      "Ops notification card in #new-customers",
      "Error handling + retry logic on all steps",
      "Complete documentation + Loom walkthrough",
      "30-day bug fix support",
    ],
    excluded: [
      "Ongoing monthly maintenance",
      "Additional workflow steps beyond those listed",
      "HubSpot pipeline/deal automation (separate scope)",
      "Email template design (assumes templates exist)",
    ],
    credibility:
      "I've built 8 Make.com onboarding pipelines for B2B SaaS companies. Two used this exact stack (HubSpot + Slack + Calendly). The most recent client had 80 sign-ups/month — went from 50 min/customer to zero manual steps in 11 days. I work directly in your tools so you're never locked into me.",
  });

  const customBid = await prisma.bid.upsert({
    where: {
      jobPostId_specialistId: {
        jobPostId: customJob.id,
        specialistId: expertProfile.id,
      },
    },
    update: { proposedApproach: customProposal },
    create: {
      jobPostId: customJob.id,
      specialistId: expertProfile.id,
      message:
        "I've built this exact pipeline for SaaS companies at your scale — HubSpot, Slack, Calendly, Resend, Stripe. Your 45-minute manual onboarding becomes fully automated in 3 weeks. Built inside your Make.com account, documented, with 30 days of support.",
      estimatedTime: "3 weeks",
      priceEstimate: "€1,800",
      proposedApproach: customProposal,
      status: "submitted",
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Demo data created. Visit /jobs to see the jobs as a business, or sign in as the expert to see and bid.",
    data: {
      expertUpgradedToElite: expertProfile.user.email,
      businessBuyer: businessUser.email,
      jobs: [
        { id: discoveryJob.id, title: discoveryJob.title, url: `/jobs/${discoveryJob.id}` },
        { id: customJob.id, title: customJob.title, url: `/jobs/${customJob.id}` },
      ],
      bids: [
        { id: discoveryBid.id, job: "Discovery Scan" },
        { id: customBid.id, job: "Custom Project" },
      ],
    },
  });
}

// Cleanup route — call /api/admin/seed-demo with DELETE to remove demo data
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  const hasSecret = secret === (process.env.SEED_SECRET ?? "logiclot-seed-dev");

  if (!isAdmin && !hasSecret) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  await prisma.bid.deleteMany({
    where: { jobPostId: { in: ["demo-discovery-scan-001", "demo-custom-project-001"] } },
  });
  await prisma.jobPost.deleteMany({
    where: { id: { in: ["demo-discovery-scan-001", "demo-custom-project-001"] } },
  });

  return NextResponse.json({ ok: true, message: "Demo data removed." });
}
