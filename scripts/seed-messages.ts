/**
 * Seed realistic conversational messages between a Specialist and a Business user.
 * Run with: npx tsx scripts/seed-messages.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SPECIALIST_PROFILE_ID = "f2583ea7-e2a9-4304-8661-a0b34cde5ccf";
const SPECIALIST_USER_ID = "1c709302-a80f-4dcb-a37c-b1f750b40095";

const BUSINESS_PROFILE_ID = "519102e9-8d2e-4e50-bd93-801af45bb206";
const BUSINESS_USER_ID = "dbd4a8a3-eff0-40d1-9410-6bffb32073b7";

type ScriptMessage = {
  sender: "business" | "specialist";
  body: string;
  offsetMinutes: number;
};

const CONVERSATIONS: {
  title: string;
  messages: ScriptMessage[];
}[] = [
    {
      title: "CRM Lead Routing Automation",
      messages: [
        { sender: "business", body: "Hi! I saw your CRM automation solution and I'm really interested. We're a B2B SaaS company with about 200 inbound leads per month and our sales team is drowning in manual lead assignment.", offsetMinutes: 0 },
        { sender: "specialist", body: "Hey, thanks for reaching out! That's a very common pain point. Can you tell me a bit more about your current setup — which CRM are you using and how are leads currently being routed to reps?", offsetMinutes: 12 },
        { sender: "business", body: "We're on HubSpot. Right now our ops manager manually checks each lead's form submission every morning and assigns them to reps based on territory and deal size. It usually takes 2-3 hours.", offsetMinutes: 25 },
        { sender: "specialist", body: "Got it. So you're losing speed-to-lead time and your ops manager is spending half their morning on something that should be automated. I've built lead-routing workflows in HubSpot for a few similar companies. Typically I set up a scoring + assignment engine that routes leads within seconds of submission based on criteria you define.", offsetMinutes: 38 },
        { sender: "business", body: "That sounds exactly like what we need. What criteria can we route on? We mainly care about territory (US vs EU), company size, and whether they're an existing customer.", offsetMinutes: 52 },
        { sender: "specialist", body: "All of those work perfectly. We'd use HubSpot workflows with custom properties: territory is derived from IP or form field, company size from enrichment (Clearbit or HubSpot's built-in), and existing customer status from a CRM lookup. I'd also add a round-robin fallback so no rep gets overloaded.", offsetMinutes: 67 },
        { sender: "business", body: "Love it. What does the timeline look like? We're hoping to have this live before the end of the month because we have a product launch coming up that's going to spike inbound volume.", offsetMinutes: 85 },
        { sender: "specialist", body: "Totally doable. Implementation typically takes 5-7 business days: 2 days for mapping your rules and building the workflow, 2 days for testing with sample leads, and 1-2 days for go-live monitoring. I'll also document everything so your team can tweak rules later without needing me.", offsetMinutes: 103 },
        { sender: "business", body: "That's great. One more thing — we also want Slack notifications when a high-value lead comes in. Is that something you can include?", offsetMinutes: 118 },
        { sender: "specialist", body: "Absolutely, that's a quick add-on. I'll set up a Slack integration that pings a dedicated channel (or DMs the assigned rep) whenever a lead scores above your threshold. No extra cost for that.", offsetMinutes: 130 },
        { sender: "business", body: "Perfect. I think we're ready to move forward. Should I place the order through the platform?", offsetMinutes: 145 },
        { sender: "specialist", body: "Yes! Go ahead and place the order and I'll get started right away. I'll send over a brief questionnaire first to nail down your routing rules, rep list, and Slack workspace details. Looking forward to it! 🚀", offsetMinutes: 152 },
      ],
    },
    {
      title: "Invoice Processing Automation",
      messages: [
        { sender: "business", body: "Hey there, I have a question about your invoice processing automation. We get around 500 invoices a month from vendors, mostly PDFs via email, and our AP team manually enters them into QuickBooks. It's brutal.", offsetMinutes: 0 },
        { sender: "specialist", body: "Oh I hear you — that's one of the most soul-crushing manual processes out there. What format are the invoices in? Mostly structured PDFs or do you get a mix of scanned documents and handwritten ones too?", offsetMinutes: 18 },
        { sender: "business", body: "Mostly structured PDFs from bigger vendors, but we do get some scanned ones from smaller suppliers. Maybe 80/20 split.", offsetMinutes: 35 },
        { sender: "specialist", body: "Perfect, that's a good ratio. For the structured PDFs I'd use a parsing engine (like Docparser or a custom regex pipeline) to extract key fields — vendor name, invoice number, line items, total, due date. For the scanned ones, we'd layer in OCR with some AI-powered extraction. Everything feeds into a staging area for quick human review before pushing to QuickBooks.", offsetMinutes: 55 },
        { sender: "business", body: "So there's still a human review step? We were hoping for full automation.", offsetMinutes: 68 },
        { sender: "specialist", body: "Great question. For the 80% structured invoices, we can absolutely go fully automated with a confidence threshold — if the system is 95%+ confident in the extraction, it auto-posts. The 20% scanned ones would go to a review queue. Over time, the AI model improves and the review queue shrinks. Most of my clients get to 90%+ full automation within 2-3 months.", offsetMinutes: 82 },
        { sender: "business", body: "That makes sense. What's the integration with QuickBooks look like? We're on QuickBooks Online.", offsetMinutes: 98 },
        { sender: "specialist", body: "QBO has a solid API. I'd build a direct integration — parsed invoice data maps to a Bill in QBO with the right vendor, account codes, and line items. You'd also get a dashboard showing processing stats, flagged invoices, and monthly savings. I've done this exact integration about a dozen times.", offsetMinutes: 115 },
        { sender: "business", body: "Impressive. Can you give me a rough cost estimate? We're a 50-person company so budget is something we need to think about.", offsetMinutes: 130 },
        { sender: "specialist", body: "Totally understand. For your volume and the dual-track approach (structured + scanned), we're typically looking at a one-time implementation fee plus minimal monthly costs for the OCR service. I'll put together a detailed proposal with exact numbers — usually takes me a day. Want me to go ahead?", offsetMinutes: 148 },
        { sender: "business", body: "Yes please, that would be great. Also, is there any disruption to our current process during implementation? We can't afford to miss any invoices.", offsetMinutes: 162 },
        { sender: "specialist", body: "Zero disruption. I run the new system in parallel with your existing process for the first 2 weeks. Your AP team keeps doing their thing while we validate that the automation is catching everything. Once we're confident, we do a clean cutover. I'll have the proposal to you by tomorrow.", offsetMinutes: 175 },
        { sender: "business", body: "That's exactly the approach I was hoping for. Looking forward to the proposal!", offsetMinutes: 188 },
        { sender: "specialist", body: "Sounds good! I'll also include a few case studies from similar-sized companies so you can see the typical ROI. Talk soon! 👋", offsetMinutes: 195 },
      ],
    },
    {
      title: "Customer Onboarding Workflow",
      messages: [
        { sender: "business", body: "Hi! We just closed a big round and expect to 3x our customer base in the next 6 months. Our onboarding process is mostly manual — welcome emails, account setup, data migration, training scheduling. It's not going to scale. Can you help?", offsetMinutes: 0 },
        { sender: "specialist", body: "Congrats on the funding! And yes, onboarding is one of those things that breaks spectacularly at scale. Let me ask — what tools are you currently using? CRM, project management, email, etc.?", offsetMinutes: 15 },
        { sender: "business", body: "HubSpot for CRM, Notion for internal docs, Gmail for customer comms, and Calendly for scheduling. We've been wanting to add Intercom for in-app messaging too.", offsetMinutes: 28 },
        { sender: "specialist", body: "Great stack. Here's what I'd propose: an end-to-end onboarding automation that triggers the moment a deal is marked 'Closed Won' in HubSpot. It would automatically:\n\n1. Send a branded welcome email sequence\n2. Create a Notion workspace from a template for the customer\n3. Generate Calendly links for kickoff and training sessions\n4. Set up Intercom tags for in-app onboarding flows\n5. Notify your CS team in Slack with a summary\n\nEverything orchestrated through a central workflow.", offsetMinutes: 48 },
        { sender: "business", body: "That's ambitious but exactly what we need. How reliable is this kind of multi-tool orchestration? We've tried Zapier before and it broke constantly.", offsetMinutes: 65 },
        { sender: "specialist", body: "Valid concern. Zapier is great for simple A→B automations but falls apart with complex, multi-step workflows. I'd build this on Make (formerly Integromat) or n8n depending on your preference — both handle error retry, branching logic, and webhook monitoring much better. Plus I build in health checks and alerting so if any step fails, your team knows immediately and there's an automatic retry.", offsetMinutes: 80 },
        { sender: "business", body: "That's reassuring. What about customization per customer tier? We have three tiers: Starter, Growth, and Enterprise. Each gets a different onboarding experience.", offsetMinutes: 98 },
        { sender: "specialist", body: "Easily handled. We'd use the deal's tier property in HubSpot to branch the workflow. Starter gets a self-serve email sequence. Growth gets email + a scheduled 30-min kickoff. Enterprise gets the white-glove treatment — personalized Notion workspace, dedicated CS rep assignment, 60-min kickoff + 2 training sessions. All automated, all triggered from the same deal close event.", offsetMinutes: 115 },
        { sender: "business", body: "You've clearly done this before. What's the implementation timeline? We'd love to have at least the Starter and Growth tracks live within 3 weeks.", offsetMinutes: 132 },
        { sender: "specialist", body: "3 weeks is tight but doable if we start this week. Here's how I'd structure it:\n\n- Week 1: Discovery + architecture + Starter track build\n- Week 2: Growth track build + integrations testing\n- Week 3: Enterprise track + end-to-end QA + go-live\n\nI'd need 2-3 hours of your team's time for discovery and UAT. The rest is on me.", offsetMinutes: 148 },
        { sender: "business", body: "Let's do it. I'll loop in our Head of CS for the discovery session. Should I place the order now?", offsetMinutes: 160 },
        { sender: "specialist", body: "Yes, go ahead! Once the order is in, I'll send a discovery questionnaire and we can book the kickoff for this week. Excited to build this — it's going to save your team a ton of time. 🎯", offsetMinutes: 168 },
      ],
    },
  ];

async function main() {
  for (const convo of CONVERSATIONS) {
    console.log(`\n📨 Creating conversation: "${convo.title}"`);

    const baseTime = new Date();
    baseTime.setHours(baseTime.getHours() - 48 - CONVERSATIONS.indexOf(convo) * 72);

    const conversation = await prisma.conversation.create({
      data: {
        buyerId: BUSINESS_USER_ID,
        sellerId: SPECIALIST_PROFILE_ID,
        status: "active",
        createdAt: baseTime,
        updatedAt: baseTime,
      },
    });

    console.log(`   ✅ Conversation created: ${conversation.id}`);

    const messages = convo.messages.map((msg) => {
      const senderId =
        msg.sender === "business" ? BUSINESS_USER_ID : SPECIALIST_USER_ID;
      const createdAt = new Date(
        baseTime.getTime() + msg.offsetMinutes * 60_000
      );
      return {
        conversationId: conversation.id,
        senderId,
        body: msg.body,
        type: "user" as const,
        createdAt,
      };
    });

    await prisma.message.createMany({ data: messages });
    console.log(`   💬 ${messages.length} messages created`);
  }

  console.log("\n✅ All mock conversations seeded successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
