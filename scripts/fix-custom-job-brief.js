// Fix the seeded Custom Project to use proper BriefV2 JSON format.
// Run: node scripts/fix-custom-job-brief.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fix() {
  // Find the seeded custom project
  const job = await prisma.jobPost.findFirst({
    where: { title: "AI-Powered Customer Support Automation for SaaS Platform" },
    select: { id: true },
  });

  if (!job) {
    console.log("Custom project not found — nothing to fix.");
    return;
  }

  const briefData = JSON.stringify({
    version: "2",
    sections: [
      {
        id: "A",
        title: "Business Context & Problem",
        subtitle: "What the business does and the core issue to solve",
        qa: [
          {
            q: "What best describes your business?",
            a: "B2B SaaS (Software as a Service)",
          },
          {
            q: "What do you primarily sell?",
            a: "A project management tool for mid-market teams — think Asana/Monday.com competitor with 2,500 active users and growing 20% month-over-month.",
          },
          {
            q: "How do customers typically interact with your business?",
            a: "Self-serve signup via website, in-app onboarding, support via Intercom live chat and help centre, billing managed through Stripe.",
          },
          {
            q: "In one sentence, what is the core problem you need solved?",
            a: "Our 3-person support team cannot keep up with 150-200 daily tickets, 60% of which are repetitive questions already answered in our knowledge base.",
          },
          {
            q: "Where does this problem occur?",
            a: "Intercom inbox — tickets pile up faster than agents can respond, leading to 8+ hour average response times.",
          },
          {
            q: "How long has this been a problem?",
            a: "About 4 months — it started when we crossed 2,000 active users. Before that, two agents could handle the volume.",
          },
          {
            q: "What typically triggers this problem?",
            a: "Every new feature release generates a spike of how-to questions. Billing cycle dates cause a wave of subscription/invoice queries. Password reset requests are constant.",
          },
        ],
      },
      {
        id: "B",
        title: "Current Process",
        subtitle: "How the workflow operates today and where it breaks",
        qa: [
          {
            q: "How is this currently handled?",
            a: "100% manual — agents read every ticket, search our Notion knowledge base for the answer, copy-paste or retype the response, then tag and close the ticket.",
          },
          {
            q: "What tools are involved in this process?",
            a: ["Intercom", "Notion", "Slack", "Linear", "Stripe"],
          },
          {
            q: "At what point does the process break down?",
            a: "When ticket volume exceeds ~80/day, the queue backs up. Agents start rushing, quality drops, customers get frustrated and submit duplicate tickets — which makes it worse.",
          },
          {
            q: "Who else is affected by this process?",
            a: "Engineering team (gets pinged in Slack for bug reports that should be routed to Linear), finance team (handles billing escalations manually), and ultimately our customers who churn due to slow support.",
          },
          {
            q: "Where does the definitive data for this process live?",
            a: "Notion (knowledge base with 200+ articles), Intercom (ticket history and customer data), Stripe (billing/subscription status), Linear (bug tracking).",
          },
        ],
      },
      {
        id: "C",
        title: "Impact & Risk",
        subtitle: "What this costs the business and how urgent it is",
        qa: [
          {
            q: "What is the most significant impact of this problem?",
            a: "Customer churn — our support NPS dropped from 45 to 18 in the last quarter. We estimate 15-20 churned accounts ($3,000-4,000 MRR lost) are directly tied to poor support experience.",
          },
          {
            q: "If this problem is not solved in the next 3 months, what happens?",
            a: "We will need to hire 2 more support agents ($8,000/month combined) just to maintain current (already poor) response times. That money could fund product development instead.",
          },
          {
            q: "How critical is solving this?",
            a: "High — it directly affects revenue retention and team morale. Two of our three agents are showing signs of burnout.",
          },
          {
            q: "What is driving the urgency?",
            a: "We are launching a major feature update next month that will likely increase ticket volume by 30-40%. Without automation, the support team will collapse.",
          },
        ],
      },
      {
        id: "D",
        title: "Constraints & Boundaries",
        subtitle: "Non-negotiables the solution must respect",
        qa: [
          {
            q: "Are there tools or platforms you must keep using?",
            a: "Yes — Intercom is non-negotiable (annual contract, deeply integrated). Notion knowledge base must remain the source of truth. Slack stays for internal comms.",
          },
          {
            q: "Are there systems or processes that cannot be changed?",
            a: "Our Stripe billing setup cannot change. The Linear workflow for bug tracking must stay intact. Support agents must still be able to manually intervene on any ticket.",
          },
          {
            q: "Who will be responsible for maintaining the automation after delivery?",
            a: "Our Head of Support (semi-technical, comfortable with no-code tools) will own it day-to-day. We want something she can tweak without needing a developer.",
          },
        ],
      },
      {
        id: "E",
        title: "Outcome & Success Criteria",
        subtitle: "What success looks like and how you will measure it",
        qa: [
          {
            q: "When this is solved, what does the ideal outcome look like?",
            a: "60% of incoming tickets are auto-resolved without human intervention. Remaining tickets are intelligently routed to the right team. Average response time drops from 8 hours to under 30 minutes.",
          },
          {
            q: "What is the single most important outcome?",
            a: "Auto-resolution of repetitive tickets (password resets, billing FAQs, feature how-tos) using our existing Notion knowledge base as the AI training source.",
          },
          {
            q: "How will you judge whether the solution works?",
            a: "Weekly metrics: auto-resolution rate (target 60%), average first response time (target <30 min), customer satisfaction score (target NPS >35), and agent workload reduction (target 50% fewer manual tickets).",
          },
          {
            q: "What would prove the problem is truly solved?",
            a: "Our support team of 3 can comfortably handle the current volume AND the expected 30-40% increase from the upcoming launch — without hiring additional agents.",
          },
          {
            q: "What proof or deliverable will confirm acceptance?",
            a: "A 2-week pilot period where the automation runs alongside human agents. If auto-resolution hits 50%+ and no critical tickets are mishandled, we accept the full rollout.",
          },
        ],
      },
      {
        id: "F",
        title: "Final Clarifier",
        subtitle: "Anything else the expert should know",
        qa: [
          {
            q: "Is there anything else you want the expert to know?",
            a: "We also want a weekly digest report emailed to the leadership team showing ticket volume, resolution times, automation hit rate, and trending topics. This will help us proactively update the knowledge base. Budget is flexible for the right solution — we care more about quality and maintainability than saving a few hundred euros.",
          },
        ],
      },
    ],
  });

  await prisma.jobPost.update({
    where: { id: job.id },
    data: { goal: briefData },
  });

  console.log("Updated Custom Project", job.id, "with proper BriefV2 JSON format.");
  console.log("Refresh /jobs/" + job.id + " to see the structured Q&A sections.");
}

fix()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
