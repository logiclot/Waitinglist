import { BRAND_NAME } from "../branding";
import type { DocPage } from "../docs-content";

export const PLATFORM_DOCS: DocPage[] = [
  // ═══════════════════════════════════════════════════════════════
  // PLATFORM — LogicLot-specific
  // ═══════════════════════════════════════════════════════════════
  {
    slug: "discovery-scan-explained",
    title: "What Is a Discovery Scan? Find Your Best Automation Opportunities",
    description: `How ${BRAND_NAME} Discovery Scans work: a low-commitment way to get expert automation proposals, ROI estimates, and a prioritised automation roadmap for your business. Learn what you get, what it costs, who it is for, and what happens after.`,
    keywords: ["Discovery Scan", "automation audit", "automation opportunities", BRAND_NAME, "automation assessment", "automation roadmap", "automation proposal", "find automation opportunities", "business process audit", "automation gap analysis"],
    content: `
Most businesses know they should automate more. The problem is not motivation---it is knowing where to start. Which processes should you automate first? What tools should you use? How much will it cost? What ROI can you realistically expect? And how do you avoid investing in the wrong automation?

A Discovery Scan on ${BRAND_NAME} answers all of these questions. It is a structured, low-commitment process where you describe how your business operates and automation experts analyse your workflows to identify the highest-impact opportunities. You receive concrete proposals with scoped solutions, ROI estimates, timelines, and pricing---without sharing sensitive data, without committing to any project, and without spending more than €50.

This guide explains exactly how a Discovery Scan works, what you receive, who it is best for, and what happens after you get your proposals.

## The problem Discovery Scans solve

Businesses that try to identify automation opportunities internally run into three predictable problems.

**The knowledge gap.** You know your own processes, but you may not know what is automatable or which automation approach is best. An invoice approval workflow that takes your team 6 hours per week might be solvable with a simple Zapier flow, a Make scenario, a custom API integration, or an AI-powered classification system. Without expertise in automation tools and patterns, you cannot evaluate the options.

**The prioritisation problem.** Most businesses have 10 to 20 processes that could benefit from automation. Without a systematic way to compare ROI across these opportunities, teams default to automating the most annoying task (which may not have the highest ROI) or the easiest task (which may not deliver meaningful value). A proper assessment ranks opportunities by expected ROI, complexity, and risk.

**The scope trap.** Internal automation projects often start without clear scope, grow beyond initial expectations, and stall before delivering value. A Discovery Scan forces scoping upfront: each expert proposal defines exactly what will be built, how long it will take, and what it will cost.

A Discovery Scan eliminates these problems by bringing external expertise into the assessment phase---before you commit budget, time, or internal resources to a specific automation path.

## How a Discovery Scan works: the four-step process

### Step 1: Describe your business

You fill out a structured form on ${BRAND_NAME} that captures the information experts need to identify automation opportunities. The form covers:

- **Business model and industry:** What you do, who your customers are, and what industry you operate in. This helps experts apply industry-specific knowledge (e.g., healthcare compliance requirements, e-commerce fulfilment patterns, legal document workflows).
- **Team size and roles:** How many people are involved in the processes you want to assess. This helps experts estimate time savings and headcount impact.
- **Key processes and workflows:** A description of the repetitive, manual, or time-consuming processes in your business. You do not need to map every step---a high-level description is enough. Examples: "Our sales team manually enters leads from web forms into HubSpot," "We copy invoice data from email PDFs into QuickBooks," "Our support team routes tickets by reading each one and assigning it manually."
- **Tools and software you use:** The platforms, apps, and systems your business runs on. Experts use this to identify integration opportunities and choose the right automation tools. Common examples: CRM (HubSpot, Salesforce), accounting (QuickBooks, Xero), e-commerce (Shopify, WooCommerce), project management (Asana, Monday.com), communication (Slack, Microsoft Teams).
- **Known pain points:** Where you suspect the biggest inefficiencies are. This is not required---experts will identify opportunities you may not have considered---but it helps focus the analysis.
- **Constraints:** Budget range, timeline expectations, any tools or approaches that are required or off-limits, data sensitivity considerations, and compliance requirements.

**You do not need to share:** Logins, passwords, customer data, financial records, or proprietary information. The goal is to give experts enough context about your workflows and tools to identify where automation can create the most value.

The form takes most businesses 15 to 30 minutes to complete. The more detail you provide, the more specific and actionable the proposals you receive will be.

### Step 2: Experts analyse your submission

After you post your Discovery Scan, automation specialists on ${BRAND_NAME} review your submission. They bring cross-industry experience, deep knowledge of automation tools, and pattern recognition from dozens or hundreds of similar assessments.

**What experts look for:**
- **Repetitive manual work:** Tasks that follow predictable patterns and are performed multiple times per day or week. These are the highest-ROI automation targets because the time savings compound.
- **Cross-tool handoffs:** Points where data moves between systems manually (copy-paste from email to CRM, export from spreadsheet to accounting tool, manual sync between two databases). These handoffs are error-prone and time-consuming.
- **Decision bottlenecks:** Processes that stall waiting for a human decision that could be rule-based or AI-assisted. Approval workflows, ticket routing, lead qualification, and document classification are common examples.
- **Error-prone steps:** Manual processes with measurable error rates. Data entry, calculations, copy operations, and manual checks all have quantifiable error rates that automation can reduce to near zero.
- **Scalability constraints:** Processes that require adding headcount as volume grows. If your current process can handle 100 orders per day but breaks at 200, automation can remove that ceiling.
- **Compliance and audit gaps:** Missing audit trails, inconsistent process execution, or manual compliance checks that could be systematised.

Experts consider your specific tools, industry context, team size, and constraints when designing their proposals. A proposal for a 5-person marketing agency will look very different from one for a 50-person dental group, even if both describe similar pain points.

### Step 3: Receive up to 5 expert proposals

Within days of posting, you receive up to 5 proposals from qualified automation experts. Each proposal is a concrete, scoped plan---not a generic sales pitch. Proposals typically include:

- **Problem statement:** A clear articulation of the automation opportunity, including the current state (what your team does manually), the impact (time cost, error rate, revenue impact), and the root cause (why the process is manual).
- **Recommended approach:** The specific automation solution---which tools to use (Zapier, Make, n8n, custom API), what architecture to follow, and how the automation will work step by step. Good proposals explain the "why" behind tool choices, not just the "what."
- **ROI estimate:** Expected time savings, error reduction, revenue impact, and headcount implications. See our [automation ROI guide](/docs/automation-roi) for the frameworks experts use to calculate these numbers. Proposals should include the assumptions behind the estimate so you can validate them.
- **Milestone breakdown:** How the project would be delivered in phases. Each milestone has a defined deliverable, so you can review and approve incrementally rather than paying for everything upfront. Milestone-based delivery is standard on ${BRAND_NAME} and is protected by [escrow](/docs/how-escrow-works).
- **Timeline:** Expected duration from kick-off to completion. Simple automations: 1 to 2 weeks. Medium complexity: 2 to 4 weeks. Complex multi-system integrations: 4 to 8 weeks.
- **Pricing:** A fixed price for the proposed scope. No hourly billing surprises. The price includes the build, testing, documentation, and handoff. Ongoing maintenance (if needed) is quoted separately.
- **Expert credentials:** The expert's background, relevant experience, certifications, and past project examples. On ${BRAND_NAME}, experts are vetted and reviewed, so you can evaluate their track record before deciding.

You can ask clarifying questions to any expert before making a decision. Use the messaging system to dig into technical details, request scope adjustments, or ask about their experience with similar projects.

### Step 4: Choose an expert or take no action

Review the proposals and choose the one that best fits your needs, budget, and timeline. Or take none---there is zero obligation.

**If you proceed:** You accept a proposal and the project begins. Your Discovery Scan posting fee (€50) is credited toward the first milestone payment, so you effectively get the scan for free when you move forward. All project payments are protected by ${BRAND_NAME}'s [escrow system](/docs/how-escrow-works): funds are held until you approve each milestone delivery.

**If you do not proceed:** Keep the proposals as a reference. Many businesses use Discovery Scan proposals to build internal business cases, get budget approval, or plan their automation roadmap for the coming quarter. You have paid €50 for expert analysis that would cost hundreds or thousands from a consulting firm.

## What a Discovery Scan costs

**Posting fee: €50 (one-time).** This covers the cost of matching you with qualified experts, facilitating the proposal process, and running the platform infrastructure.

**Refund policy:** If no proposal meets your criteria---meaning the experts did not adequately address your needs or the proposals are not actionable---you receive a [75% refund](/pricing) (€37.50). This is rare; most Discovery Scans generate at least one strong proposal.

**Credit toward your first project:** When you accept a proposal and proceed with an expert, your €50 posting fee is credited toward the first milestone payment. If your first milestone costs €500, you pay €450 out of pocket.

**No additional fees for buyers.** ${BRAND_NAME} charges zero platform fees to businesses. You pay the expert's quoted price for the project. There is no markup, no hidden fee, and no percentage taken from your side. [Full pricing details](/docs/pricing).

### How this compares to alternatives

| Approach | Cost | What you get | Timeline |
|---|---|---|---|
| ${BRAND_NAME} Discovery Scan | €50 | Up to 5 scoped proposals with ROI estimates | Days |
| Management consulting firm | €5,000-€50,000+ | Process analysis report | 4-12 weeks |
| Freelance consultant (hourly) | €500-€2,000+ | Assessment document | 1-4 weeks |
| Internal assessment (DIY) | Staff time (hidden cost) | Varies widely in quality | Weeks to months |

The Discovery Scan is the most cost-efficient way to get expert automation analysis. You pay a fraction of what a consulting engagement costs and receive actionable proposals---not just a report.

## Who should use a Discovery Scan

### Businesses that are unsure where to start

If you know automation could help but do not know which processes to prioritise, a Discovery Scan gives you a ranked list of opportunities assessed by experts who have seen hundreds of similar businesses. This is the most common use case.

### Businesses with complex or legacy processes

If your workflows involve multiple systems, legacy software, manual handoffs, or industry-specific requirements, a Discovery Scan is particularly valuable. Generic automation advice does not account for your specific tool stack and constraints. Expert proposals do.

### Businesses that have tried DIY automation and hit limits

If you have built some automations internally but they are unreliable, hard to maintain, or not delivering the expected value, experts can assess what you have, identify what is working (and what is not), and propose improvements or replacements.

### Businesses building an automation roadmap

If you are planning a systematic automation programme (rather than one-off projects), use a Discovery Scan to get an expert-informed roadmap. Proposals will help you prioritise by ROI, sequence projects logically (build foundational integrations first, then advanced flows), and budget accurately.

### Businesses that need a business case for leadership

If you need to justify automation spend to a CFO, board, or leadership team, Discovery Scan proposals provide the numbers: expected ROI, payback period, time savings, and error reduction. These are far more credible than internal estimates because they come from experts with benchmarks from similar projects. See our [automation ROI guide](/docs/automation-roi) for the frameworks behind these calculations.

### Businesses in regulated industries

Healthcare, legal, financial services, and other regulated industries have automation needs that require compliance awareness. Discovery Scan experts consider regulatory requirements (HIPAA, GDPR, SOX, PCI-DSS) when designing proposals, flagging compliance considerations that generic automation advice would miss.

## What happens after a Discovery Scan

### If you accept a proposal

The project transitions from Discovery Scan to active project. Here is what happens:

1. **Kick-off conversation.** You and the expert align on scope, timeline, and the first milestone deliverable via ${BRAND_NAME}'s messaging system.
2. **First milestone payment.** You fund the first milestone (your €50 posting fee is credited). Funds are held in [escrow](/docs/how-escrow-works) until you approve the delivery.
3. **Expert builds.** The expert builds the first milestone---typically the core automation or a proof-of-concept that demonstrates the approach.
4. **Review and approve.** You test and review the delivery. If it meets the agreed requirements, you approve and funds release. If it needs adjustments, communicate with the expert for revisions.
5. **Continue through milestones.** Repeat for each subsequent milestone until the full scope is delivered.
6. **Handoff and documentation.** The expert provides documentation for the completed automation: how it works, how to monitor it, and what to do if something goes wrong.

### If you do not accept any proposal

You keep the proposals and the analysis. Many businesses:
- Use the proposals to build an internal business case and return to ${BRAND_NAME} when budget is approved
- Share proposals with their team to align on automation priorities
- Post a [Custom Project](/docs/custom-project-explained) with a more specific brief informed by what they learned
- Wait for a future quarter and post a new Discovery Scan with updated priorities

There is no pressure, no follow-up sales calls, and no obligation.

## Tips for getting the best proposals

**Be specific about your pain points.** "We waste time on admin" is too vague. "Our office manager spends 3 hours every Monday manually copying data from 15 web form submissions into our Salesforce CRM" gives experts exactly what they need to propose a targeted solution.

**List your tools.** Experts design solutions around your existing tool stack. If you use HubSpot, Slack, QuickBooks, and Google Workspace, say so. It changes the automation approach significantly.

**Share volume numbers.** How many invoices per month? How many leads per week? How many customer emails per day? Volume determines ROI and helps experts recommend the right tool tier.

**Be honest about constraints.** Budget limits, timeline requirements, team capacity for adoption, and technical limitations are all important context. Better to learn that your budget does not match the scope before a project starts.

**Mention previous automation attempts.** If you have tried Zapier flows that broke, an internal project that stalled, or a vendor that underdelivered, share that context. Experts will design around known failure points.

[Start a Discovery Scan now](/jobs/discovery) --- it takes 15 to 30 minutes and costs €50. Get expert proposals for your highest-ROI automation opportunities within days.
    `,
    relatedSlugs: ["custom-project-explained", "automation-for-beginners", "when-to-hire-automation-expert", "how-escrow-works", "automation-roi", "pricing"],
    faqs: [
      { question: "What is a Discovery Scan on LogicLot?", answer: "A Discovery Scan is a low-commitment process where you describe your business workflows and automation experts analyse them to identify the highest-impact automation opportunities. You receive up to 5 concrete proposals with scoped solutions, ROI estimates, timelines, and fixed pricing. It costs a one-time €50 posting fee with no obligation to proceed." },
      { question: "How much does a Discovery Scan cost?", answer: "A Discovery Scan costs a one-time €50 posting fee. If no proposal meets your criteria, you receive a 75% refund (€37.50). If you accept a proposal and proceed with a project, the €50 fee is credited toward your first milestone payment, effectively making the scan free." },
      { question: "What information do I need to provide for a Discovery Scan?", answer: "Describe your business model, team size, key processes and workflows, the tools and software you use, known pain points, and any constraints (budget, timeline, compliance requirements). You do not need to share logins, passwords, customer data, or proprietary information. The form takes 15-30 minutes to complete." },
      { question: "How long does it take to receive Discovery Scan proposals?", answer: "Most businesses receive their first proposals within a few days of posting. You can receive up to 5 proposals from qualified automation experts. Each proposal includes a problem statement, recommended approach, ROI estimate, milestone breakdown, timeline, and fixed pricing." },
    ],
  },
  {
    slug: "custom-project-explained",
    title: "How Custom Projects Work: Tailored Automation Built by Vetted Experts",
    description: `How ${BRAND_NAME} Custom Projects deliver tailored automation solutions. Learn the full lifecycle: posting a brief, expert matching, proposal review, milestone-based delivery, escrow payment protection, and post-delivery support.`,
    keywords: ["Custom Project", "custom automation", "tailored automation solution", BRAND_NAME, "hire automation expert", "automation project delivery", "milestone-based automation", "automation brief", "automation proposal", "custom workflow build", "bespoke automation"],
    content: `
A Discovery Scan helps you figure out what to automate. A Custom Project is for when you already know. You have a specific automation need---a multi-system integration, a complex workflow, an AI-powered process, or a custom build that no pre-made solution covers---and you want a vetted expert to build it for you with fixed pricing, milestone-based delivery, and full payment protection.

Custom Projects on ${BRAND_NAME} follow a structured lifecycle designed to minimise risk for buyers and ensure quality delivery from experts. This guide walks you through every stage: writing an effective brief, understanding how expert matching works, evaluating proposals, managing milestone delivery, using escrow protection, handling revisions and edge cases, and what happens after delivery.

## Why Custom Projects exist

Pre-built automation solutions (the kind you can browse and buy on ${BRAND_NAME}'s [solutions marketplace](/solutions)) cover common use cases: CRM lead routing, email sequences, form-to-database flows, and standard integrations. They work well when your needs match the template.

But many automation needs are not template-shaped:

- **Multi-system integrations** that connect 3 or more platforms with custom data mapping and business logic
- **Industry-specific workflows** with compliance requirements, specialised tools, or domain-specific processes (see our [niche automation guide](/docs/low-competition-automation-niches))
- **AI-powered automations** that combine workflow steps with classification, extraction, generation, or decision-making components
- **Legacy system connections** where standard connectors do not exist and custom API work is needed
- **End-to-end process automation** that spans multiple departments or functions
- **Custom dashboards and reporting** built on top of automated data pipelines

These require a tailored approach: an expert who understands your specific context, designs a solution for your exact requirements, and builds it to production quality. That is what Custom Projects deliver.

## The Custom Project lifecycle: step by step

### Step 1: Write your brief

The brief is the foundation of a successful project. It tells experts what you need, why you need it, and what constraints they should design within. A good brief gets better proposals, more accurate pricing, and fewer surprises during delivery.

**What to include in your brief:**

- **Problem statement:** What is the current process? What is wrong with it? Be specific. "Our team wastes time on manual data entry" is weak. "Our 3-person operations team manually copies order data from Shopify into our ERP (SAP Business One) for 15 orders per day, taking approximately 45 minutes. Errors occur on roughly 5% of orders, requiring 20 minutes each to investigate and correct" is strong.

- **Desired outcome:** What does success look like? Describe the end state, not the implementation. "Orders from Shopify should automatically appear in SAP Business One within 5 minutes, with all required fields mapped correctly. Our team should only need to handle exceptions flagged by the system."

- **Tools and systems involved:** List every platform, app, and system that the automation needs to connect to or interact with. Include version numbers if relevant (especially for legacy systems). Mention whether you have API access, admin credentials, and which subscription tiers you are on (this affects available integrations).

- **Volume and scale:** How many transactions, records, or events per day/week/month? Current volume and expected growth. This affects tool selection, architecture decisions, and pricing.

- **Constraints and requirements:**
  - Budget range (you do not need to give an exact number, but a range helps experts propose realistic solutions)
  - Timeline and deadline (is there a hard deadline or is timing flexible?)
  - Required tools (must use Zapier) or excluded tools (cannot use cloud-hosted solutions due to data sovereignty)
  - Compliance requirements (GDPR, HIPAA, SOX, industry-specific regulations)
  - Security requirements (data encryption, access controls, audit logging)
  - Integration with existing automations (does this need to work alongside automations you have already built?)

- **Nice-to-haves:** Features that are not essential but would add value. Labelling these separately helps experts propose a core solution within budget and optional enhancements if budget allows.

**Tips for better briefs:**
- Attach screenshots, flowcharts, or screen recordings of the current process
- Reference similar solutions you have seen (even if they do not exactly match your needs)
- Be honest about what you have tried and why it did not work
- State whether you want the expert to recommend tools or whether tools are already decided

### Step 2: Expert matching and proposal submission

After you post your brief, ${BRAND_NAME} matches it with qualified experts based on their skills, industry experience, tool expertise, and availability. Up to 3 experts submit proposals. This limit is intentional: it ensures each expert invests meaningful time in their proposal (rather than spray-and-pray bidding) and keeps your evaluation manageable.

**Who submits proposals:**

Custom Projects are open to experts with proven track records on the platform. The experts who bid on your project have demonstrated competence through completed projects, buyer reviews, and ${BRAND_NAME} verification processes. Their profiles show their specialisations, certifications, past work, and ratings.

**What each proposal includes:**

- **Scope definition:** Exactly what the expert will build, broken into clear deliverables. A good proposal leaves no ambiguity about what is included and what is not.
- **Architecture and approach:** How the solution will be built---which tools, what integration pattern, how data flows, how errors are handled. This lets you evaluate the expert's technical thinking, not just their price.
- **Milestone breakdown:** The project divided into 2 to 5 phases, each with a defined deliverable and independent value. This is critical for risk management: you review and approve each milestone before funding the next one. If the project needs to stop after milestone 2, you still have usable deliverables.
- **Timeline:** Start date, milestone delivery dates, and final completion date. Realistic timelines account for your review time between milestones.
- **Fixed price:** A total project price broken down by milestone. No hourly billing. No scope creep surprises (if scope changes, pricing is re-agreed before work continues).
- **Maintenance and support:** Whether ongoing support is included, offered as an add-on, or not provided. Many experts offer monthly maintenance retainers for complex automations.

### Step 3: Evaluate proposals and ask questions

You now have up to 3 detailed proposals to compare. Here is how to evaluate them effectively:

**Compare on value, not just price.** The cheapest proposal is not always the best. Consider: Does the expert understand your problem deeply? Is the architecture sound? Are milestones structured so you get value early? Does the expert have relevant industry or tool experience? What does post-delivery support look like?

**Use the messaging system.** Ask each expert clarifying questions before deciding. Good questions to ask:
- "How have you handled [specific edge case] in similar projects?"
- "What happens if [tool X] changes its API during the project?"
- "Can you walk me through the error handling approach?"
- "What does the handoff look like after the last milestone?"
- "Do you offer a maintenance retainer after delivery?"

**Check expert profiles.** Review completed projects, buyer reviews, response time, and expertise tags. An expert with 5-star reviews on 3 similar projects is a strong signal.

**Trust your gut on communication.** The proposal and messaging exchange give you a preview of what working with this expert will be like. Clear communication, responsiveness, and thoughtful answers correlate strongly with successful project delivery.

### Step 4: Accept a proposal and begin work

When you accept a proposal, the project moves to active status. Here is what happens:

**Kick-off.** You and the expert align on:
- The first milestone scope and deliverable
- Communication cadence (how often you will get updates---daily standup messages, weekly progress reports, or milestone-based updates)
- Access requirements (what accounts, tools, or permissions the expert needs to start)
- Review process (how you will test and approve each milestone)

**First milestone funding.** You fund the first milestone payment. Funds are captured via [Stripe](https://stripe.com) and held in ${BRAND_NAME}'s [escrow system](/docs/how-escrow-works). The expert can see that payment is secured (which motivates them to deliver) but cannot access the funds until you approve the delivery. Your Custom Project posting fee (€100) is credited toward this first payment.

### Step 5: Milestone-based delivery and review

This is where the work happens. The cycle for each milestone is:

**1. Expert builds.** The expert works on the milestone deliverable according to the agreed scope. They may send progress updates, ask clarifying questions, or request access to specific tools during this phase.

**2. Expert delivers.** The expert marks the milestone as delivered and provides:
- The completed automation or integration
- Documentation explaining how it works
- Testing evidence (screenshots, logs, or video walkthrough of the automation running)
- Any setup instructions or configuration notes

**3. You review.** Test the deliverable against the agreed requirements. Run it with real or test data. Check edge cases. Verify that it handles errors gracefully. This is your quality gate.

**4. You approve or request revisions.**
- **Approve:** If the milestone meets requirements, approve it. Funds release to the expert (minus the platform commission). Move to the next milestone.
- **Request revisions:** If the deliverable does not meet the agreed requirements, communicate what needs to change. Experts are expected to address legitimate revision requests within the milestone scope. Revisions due to scope changes (requirements that were not in the original brief) may require a scope change agreement and adjusted pricing.

**5. Fund next milestone.** After approving, fund the next milestone. The cycle repeats until all milestones are complete.

### Step 6: Project completion and handoff

When the final milestone is approved, the project is marked as complete. The expert provides:

- **Full documentation:** How the automation works, what triggers it, what it does at each step, how errors are handled, and how to monitor it.
- **Admin access and credentials:** Ownership of all automation assets (Zaps, Make scenarios, n8n workflows, custom code) transfers to you. You own what you paid for.
- **Monitoring setup:** For complex automations, the expert may set up error notifications, logging, or dashboards so you can monitor performance.
- **Knowledge transfer:** For teams that will maintain the automation internally, the expert walks through the architecture and common maintenance tasks.

## Cost structure

**Posting fee: €100 (one-time).** This is higher than the Discovery Scan fee (€50) because Custom Projects involve more platform infrastructure: expert matching, proposal facilitation, milestone management, escrow handling, and dispute resolution support.

**Refund policy:** If no proposal meets your criteria, you receive a [75% refund](/pricing) (€75). This is assessed on a good-faith basis.

**Credit:** The €100 posting fee is credited toward your first milestone payment when you proceed with an expert.

**Project pricing:** Set by the expert in their proposal. Fixed price per milestone. No hourly billing, no surprise fees. You know the total cost before you start. Typical ranges:

| Project complexity | Typical price range | Timeline |
|---|---|---|
| Simple (single integration, 2-3 steps) | €300 - €800 | 1-2 weeks |
| Medium (multi-tool, conditional logic) | €800 - €2,500 | 2-4 weeks |
| Complex (multi-system, AI, custom API) | €2,500 - €8,000 | 4-8 weeks |
| Enterprise (full process automation) | €8,000 - €25,000+ | 8-16 weeks |

**No buyer fees.** ${BRAND_NAME} charges zero platform fees to businesses. You pay the expert's quoted price. The platform is funded by [expert commissions](/docs/pricing), not buyer markups.

## Escrow protection: your financial safety net

Every milestone payment on ${BRAND_NAME} is protected by escrow. This means:

- **Your money is safe.** Funds are held by the platform (processed via [Stripe](https://stripe.com)) until you approve the delivery. The expert cannot access the funds.
- **The expert is motivated.** They can see that payment is secured, which means they know they will be paid once they deliver quality work.
- **You hold the leverage.** Funds only move when you approve. If you are not satisfied, you do not approve, and you can raise a dispute.
- **Disputes are mediated.** If you and the expert cannot agree on whether a milestone meets requirements, ${BRAND_NAME}'s support team reviews the evidence and makes a binding decision. [Full escrow details](/docs/how-escrow-works).

## When to use a Custom Project vs. a Discovery Scan

| Situation | Best option |
|---|---|
| You are not sure what to automate | [Discovery Scan](/docs/discovery-scan-explained) |
| You know the problem but not the solution | Discovery Scan or Custom Project (with open brief) |
| You have a clear, specific requirement | Custom Project |
| You want to compare multiple opportunities | Discovery Scan |
| You are ready to build now | Custom Project |
| You need an automation roadmap | Discovery Scan |

Many businesses start with a Discovery Scan to identify opportunities, then post Custom Projects for the specific builds they want to move forward with. The two complement each other.

## Tips for a successful Custom Project

**Invest time in the brief.** A 30-minute brief gets better results than a 5-minute brief. The more context you provide, the more accurate and useful the proposals will be.

**Respond promptly.** When experts ask clarifying questions during the proposal phase or the build phase, fast responses keep the project on track. Delayed responses are the most common cause of timeline slippage.

**Test thoroughly at each milestone.** Do not rubber-stamp milestone approvals. Test with real data, check edge cases, and verify error handling. It is much easier to catch issues milestone by milestone than to fix them at the end.

**Communicate scope changes early.** If your requirements change mid-project (which happens---business needs evolve), communicate the change to the expert as soon as possible. Agree on scope and pricing adjustments before work continues. Scope changes are normal; surprises are not.

**Leave a review.** After the project is complete, leave an honest review. Reviews help other buyers evaluate experts and help great experts build their reputation on the platform.

[Post a Custom Project now](/jobs/new) and get up to 3 expert proposals within days. Fixed pricing, milestone delivery, and escrow protection---all standard on ${BRAND_NAME}.
    `,
    relatedSlugs: ["discovery-scan-explained", "how-escrow-works", "what-is-a-workflow", "pricing", "when-to-hire-automation-expert"],
    faqs: [
      { question: "What is a Custom Project on LogicLot?", answer: "A Custom Project is a structured way to hire a vetted automation expert for a specific build. You post a brief describing your requirements, receive up to 3 fixed-price proposals from qualified experts, choose one, and work proceeds through milestone-based delivery with full escrow payment protection. You own all deliverables and approve each milestone before funds are released." },
      { question: "How much does it cost to post a Custom Project?", answer: "There is a one-time €100 posting fee. If no proposal meets your criteria, you receive a 75% refund (€75). If you accept a proposal, the €100 fee is credited toward your first milestone payment. Project pricing is set by the expert in their proposal as a fixed price, not hourly. There are no additional platform fees for buyers." },
      { question: "How does milestone-based delivery work?", answer: "Projects are divided into 2-5 milestones, each with a defined deliverable. You fund each milestone before work begins. Funds are held in escrow until you review and approve the delivery. This means you are never paying for work you have not seen, and you can stop a project after any milestone while retaining the deliverables you have already approved." },
      { question: "What happens if I am not satisfied with the work?", answer: "If a milestone delivery does not meet the agreed requirements, do not approve it. Communicate what needs to change, and the expert will revise within the agreed scope. If you and the expert cannot reach agreement, you can raise a dispute. LogicLot's support team reviews the project requirements, delivered work, and communication history to mediate and make a binding decision." },
    ],
  },
  {
    slug: "how-escrow-works",
    title: `How Escrow Protects Your Payment on ${BRAND_NAME}: A Complete Guide`,
    description: `How ${BRAND_NAME}'s escrow system works: how funds are held, milestone releases, dispute resolution, protection for both buyers and experts. Built on Stripe for PCI-DSS Level 1 security.`,
    keywords: ["escrow", "payment protection", "milestone payment", "secure payment", "escrow automation marketplace", "payment security", "buyer protection", "expert payment", "dispute resolution", "Stripe escrow", "milestone release", "fund protection"],
    content: `
Trust is the foundational challenge of any marketplace. A buyer wants assurance that their money is safe until work is delivered. An expert wants assurance that they will be paid once they deliver quality work. Without a mechanism that protects both sides, transactions stall: buyers hesitate to pay upfront, experts hesitate to work without payment, and both sides assume the worst.

Escrow solves this problem. On ${BRAND_NAME}, every project payment is held in escrow---a secure third-party hold---until you, the buyer, approve each milestone delivery. The expert can see that your payment is secured (motivating them to deliver) but cannot access the funds until you are satisfied (protecting your investment). This guide explains exactly how the escrow system works, what happens at each stage, how disputes are resolved, and how the technical infrastructure ensures your money is safe.

## Why escrow exists: the trust problem in automation services

Automation projects are particularly susceptible to trust failures because:

**The deliverable is intangible.** Unlike buying a physical product, you cannot inspect an automation before it is built. You are paying for expertise, time, and a digital deliverable that only has value if it works correctly.

**Quality is hard to verify upfront.** A polished proposal does not guarantee a polished build. The quality of an automation is only apparent after testing---after the expert has already invested significant time.

**Scope is complex.** Automation projects involve technical specifications, business logic, integrations, and edge cases. Misunderstandings about scope are common and can lead to disagreements about whether the work was "done."

**The stakes are real.** Businesses are investing hundreds to thousands of euros. Experts are investing days to weeks of work. Neither side can afford to lose.

Escrow eliminates the trust barrier by making the transaction conditional: the buyer commits the money, but the expert earns it only by delivering approved work. Both sides have skin in the game, and the platform mediates if they disagree.

## The escrow flow: step by step

### Step 1: Fund the milestone

When a [Custom Project](/docs/custom-project-explained) begins, the project is divided into milestones---each with a defined deliverable and price. Before the expert starts work on a milestone, you fund it.

**How funding works:**
- You click "Fund Milestone" in your project dashboard
- Payment is processed via [Stripe](https://stripe.com), the global payments infrastructure used by Amazon, Google, and millions of businesses worldwide
- Your payment method is charged (credit card, debit card, or other Stripe-supported method)
- Funds are captured by ${BRAND_NAME}'s Stripe account and placed in escrow
- You receive a confirmation that the milestone is funded
- The expert receives a notification that payment is secured

**What "funded" means:** Your money has left your account and is held by ${BRAND_NAME}. It is not in the expert's account. It is not available for the expert to withdraw. It is locked until you approve the delivery or a dispute is resolved.

**Currency and payment methods:** Payments are processed in euros (EUR). Stripe handles currency conversion for buyers paying from non-euro accounts. Stripe supports all major credit and debit cards, Apple Pay, Google Pay, and SEPA Direct Debit for European bank accounts. No cryptocurrency, no wire transfers, no PayPal---all payments go through Stripe for consistency and security.

### Step 2: Funds are locked in escrow

Once funded, the milestone enters the "locked" state. This is the period between your payment and the expert's delivery.

**What happens during the lock:**
- Funds sit in ${BRAND_NAME}'s Stripe escrow account
- The expert can see in their dashboard that the milestone is funded (a green "Payment Secured" indicator)
- Neither you nor the expert can withdraw the funds
- The expert begins working on the milestone deliverable
- You can message the expert, ask for updates, and track progress

**Why the lock matters for buyers:** Your money is committed but protected. If the expert disappears, fails to deliver, or delivers something that does not meet requirements, you have recourse through the dispute system. You are never in a position where you have paid and have no leverage.

**Why the lock matters for experts:** The expert knows that payment is guaranteed once they deliver approved work. This eliminates the risk of doing the work and then not getting paid---a common problem with freelance and consulting arrangements outside of escrow-protected platforms. The guaranteed payment motivates experts to prioritise your project and deliver their best work.

### Step 3: The expert delivers

When the expert completes the milestone deliverable, they mark it as delivered in the project dashboard. The delivery typically includes:

- The completed automation, integration, or workflow
- Documentation explaining how it works (architecture, triggers, actions, error handling)
- Testing evidence (screenshots, logs, video walkthrough, or test results)
- Setup instructions or configuration notes (if applicable)
- Any credentials, access details, or assets you need to own the deliverable

You receive a notification that the milestone is ready for review. The escrow status changes to "Delivered --- Awaiting Review."

### Step 4: You review the delivery

This is your quality gate. Take the time to review the deliverable thoroughly.

**How to review effectively:**
- **Test with real data (or realistic test data).** Run the automation with actual inputs. Does it produce the correct outputs? Does it handle the volume you specified?
- **Check edge cases.** What happens when input data is missing, malformed, or unexpected? Does the automation handle errors gracefully or fail silently?
- **Verify integrations.** If the automation connects multiple systems, verify that data flows correctly between all of them. Check that no data is lost, duplicated, or corrupted in transit.
- **Review documentation.** Is the documentation clear enough that your team could maintain the automation? Are the architecture decisions explained?
- **Compare to requirements.** Go back to the original brief and the expert's proposal. Does the delivery match what was agreed?

**Review timeline:** You have a reasonable window to review each milestone (typically 7 to 14 days, depending on project terms). If you need more time, communicate with the expert. Extended review periods without communication may trigger automated follow-ups from the platform.

### Step 5: Approve and release funds

When you are satisfied that the milestone meets the agreed requirements, you approve it in the project dashboard.

**What happens when you approve:**
- The escrow status changes to "Approved"
- Funds are released from escrow
- The platform commission is deducted (see [pricing](/docs/pricing) for commission rates)
- The remaining amount is transferred to the expert's connected [Stripe Connect](https://stripe.com/connect) account
- The expert typically receives the payout within 2 to 7 business days, depending on their Stripe account configuration and country
- You receive an [invoice](/docs/invoicing) for the milestone payment
- The project advances to the next milestone (if applicable)

**What you are approving:** You are confirming that the deliverable meets the requirements agreed in the proposal. You are not approving perfection---no software is perfect. You are confirming that the expert delivered what they said they would deliver, to the standard agreed upon.

### Step 6: Repeat for subsequent milestones

For multi-milestone projects, the cycle repeats:
1. Fund the next milestone
2. Expert builds
3. Expert delivers
4. You review
5. You approve (or request revisions)
6. Funds release

Each milestone is independent. You are never paying for work you have not reviewed. If you need to pause or cancel the project after a milestone, you keep all deliverables from approved milestones and owe nothing for future ones.

## Requesting revisions (before approving)

If the delivery does not fully meet the agreed requirements, you do not have to approve it immediately. Here is the revision process:

**1. Identify specific issues.** Be concrete. "This does not work" is not actionable. "The automation fails when the input email has no attachment---it should skip the attachment step and continue processing" is actionable.

**2. Communicate through the project messaging system.** Document revision requests in the platform's messaging system, not in external channels. This creates a record that is used if a dispute arises.

**3. The expert revises.** Legitimate revision requests---meaning issues where the delivery does not match the agreed scope---are addressed by the expert at no additional cost. The expert re-delivers, and you review again.

**4. Scope vs. revision.** If your revision request involves functionality that was not in the original scope (a new feature, an additional integration, or a changed requirement), the expert may flag it as a scope change. Scope changes are negotiated and priced separately. This is fair---the expert priced their proposal based on the original scope, and additions require additional work.

**How many revision rounds are typical?** For well-scoped milestones, 0 to 1 revision rounds are typical. If a milestone requires 3+ rounds of revisions, it usually indicates a scope clarity issue that should be discussed openly.

## Dispute resolution: when buyer and expert disagree

Disputes are rare (fewer than 5% of projects on well-run marketplaces), but when they occur, ${BRAND_NAME} has a structured resolution process.

### When to raise a dispute

Raise a dispute if:
- The expert delivered work that clearly does not match the agreed scope and has not addressed your revision requests
- The expert has stopped communicating and has not delivered
- You believe the quality of work is fundamentally below professional standards
- There is a disagreement about whether the scope was met that you and the expert cannot resolve directly

Do not raise a dispute for:
- Normal revision requests (use the revision process above)
- Scope changes you want but did not include in the original brief
- Buyer's remorse (you changed your mind about the project)
- Issues that the expert is actively working to resolve

### How dispute resolution works

**1. You raise the dispute.** Click "Raise Dispute" in the project dashboard. Describe the issue in detail and provide evidence (screenshots, test results, comparison to requirements).

**2. The expert responds.** The expert has an opportunity to respond with their perspective and evidence.

**3. ${BRAND_NAME} reviews.** Our support team reviews:
- The original brief and proposal (what was agreed)
- The delivered work (what was built)
- The revision history and communications (what was discussed)
- Both parties' dispute submissions (each side's case)

**4. Decision.** ${BRAND_NAME} makes a binding decision. Possible outcomes:
- **Full approval:** The work meets the agreed scope. Funds release to the expert.
- **Full refund:** The work fundamentally does not meet the agreed scope. Funds return to the buyer.
- **Partial refund:** The work partially meets requirements. A portion of funds is released to the expert for work completed; the remainder is refunded to the buyer.
- **Rework order:** The expert is directed to address specific issues before funds are released. A clear rework scope and timeline are defined.

**5. Execution.** The decision is executed within 48 hours. If a refund is ordered, funds are returned to your original payment method via Stripe.

### Dispute prevention

The best dispute is one that never happens. To minimise dispute risk:
- Write a detailed brief with clear, measurable requirements
- Ask clarifying questions during the proposal phase---do not assume
- Review and test each milestone thoroughly before approving
- Communicate scope changes early and agree on adjustments before they become disputes
- Use the platform messaging system for all project communication (creating a documentary record)

## How escrow protects experts

Escrow is not just for buyers. It protects experts in equal measure.

**Guaranteed payment.** Once a milestone is funded, the expert knows the money is there. They do not have to chase invoices, negotiate payment terms, or worry about non-payment. This is a significant improvement over the freelance and consulting norm, where late payments and non-payments are common ([a Freelancers Union survey](https://www.freelancersunion.org/) found that 71% of freelancers have struggled to collect payment at some point).

**Clear scope boundary.** Because the proposal defines the scope and the milestone defines the deliverable, experts have a clear reference point for what "done" means. If a buyer tries to add scope without adjusting the price, the expert can point to the agreed terms.

**Dispute protection.** If a buyer unreasonably refuses to approve a milestone that clearly meets the agreed scope, the expert can raise a dispute. ${BRAND_NAME}'s review process protects experts from bad-faith buyers just as it protects buyers from underdelivering experts.

**Professional environment.** The structured escrow process (fund, build, deliver, review, approve) creates a professional working relationship. Both parties know the rules. This reduces friction, builds trust, and leads to better outcomes.

## Technical infrastructure: how your money is secured

${BRAND_NAME}'s escrow system is built on [Stripe](https://stripe.com), the global payments infrastructure that processes hundreds of billions of dollars annually.

**PCI-DSS Level 1 compliance.** Stripe is certified to the highest level of payment card industry security standards. Your card details are never stored on ${BRAND_NAME}'s servers---they are handled entirely by Stripe's secure infrastructure.

**Fund segregation.** Escrowed funds are held in ${BRAND_NAME}'s Stripe account, separate from operational funds. We never commingle buyer payments with platform operating capital. This means your escrowed funds are not affected by the platform's operational expenses.

**Stripe Connect for payouts.** Expert payouts are handled via [Stripe Connect](https://stripe.com/connect), the marketplace payout system used by platforms like Lyft, Shopify, and DoorDash. Stripe Connect ensures that expert identity is verified, payouts are compliant with local regulations, and funds are transferred securely.

**Encryption.** All payment data is encrypted in transit (TLS 1.2+) and at rest (AES-256). Stripe's infrastructure is audited annually by independent PCI Qualified Security Assessors.

**Fraud protection.** Stripe's fraud detection system (Stripe Radar) monitors all transactions for suspicious activity. Combined with ${BRAND_NAME}'s own verification processes, this provides multi-layered protection against fraudulent transactions.

**Regulatory compliance.** Stripe operates under financial regulations in each country it serves. In Europe, Stripe is authorised by the Central Bank of Ireland as an electronic money institution, ensuring compliance with EU payment regulations including PSD2 (Payment Services Directive).

## Escrow for solution purchases

Escrow also applies to purchases of pre-built solutions from the ${BRAND_NAME} [solutions marketplace](/solutions). When you buy a solution:

- Payment is processed via Stripe
- If the solution includes a service component (setup, customisation), funds follow the same escrow flow as Custom Projects
- If the solution is a delivered digital product (template, workflow file), the purchase is completed immediately and the expert receives payment after a standard satisfaction window

## Frequently asked questions about escrow

Understanding how escrow works builds confidence in using the platform. Here are the most common questions, answered in detail.

**Can the expert access my funds before I approve?** No. Funds are locked in escrow from the moment you pay until the moment you approve (or a dispute is resolved). The expert can see that payment is secured, but they cannot withdraw, transfer, or access the funds in any way.

**What if the expert does not deliver?** If the expert fails to deliver within the agreed timeline and has not communicated a reasonable delay, you can raise a dispute. If the expert has not delivered work, funds are refunded to you.

**What if I forget to approve?** The platform sends reminders when a milestone is delivered and awaiting your review. If an extended period passes without review or communication, the platform may reach out to both parties to resolve the status.

**Are there any fees on escrow transactions?** Stripe's standard payment processing fees apply (built into the transaction). There is no additional escrow fee. Buyers pay the quoted price; experts receive the quoted price minus the platform commission. [Full pricing details](/docs/pricing).

**Can I fund all milestones upfront?** Milestones are funded one at a time by default. This protects you by limiting your financial exposure to one milestone at a time. You can fund the next milestone as soon as the previous one is approved.

**How long does a refund take?** Refunds are processed via Stripe and typically appear on your statement within 5 to 10 business days, depending on your bank or card issuer.

[Start a project with escrow protection](/jobs/new) --- post a Custom Project or [run a Discovery Scan](/jobs/discovery) on ${BRAND_NAME}. Every payment is protected.
    `,
    relatedSlugs: ["custom-project-explained", "pricing", "invoicing", "discovery-scan-explained"],
    faqs: [
      { question: "How does escrow protect my payment on LogicLot?", answer: "Funds are held in escrow (via Stripe) until you approve each milestone. The expert can see that payment is secured but cannot access the funds. You review and test the deliverable, and funds only release when you approve. If there is a dispute, LogicLot mediates and makes a binding decision." },
      { question: "What happens if I am not satisfied with the delivered work?", answer: "Do not approve the milestone. Communicate specific issues to the expert through the project messaging system. Legitimate revision requests (where the delivery does not match the agreed scope) are addressed at no additional cost. If you and the expert cannot resolve the issue, raise a dispute for LogicLot to review and mediate." },
      { question: "Who processes the escrow payments?", answer: "All payments are processed via Stripe, which is PCI-DSS Level 1 certified and handles hundreds of billions of dollars annually. Escrowed funds are held in LogicLot's Stripe account, separate from operational capital. Expert payouts are handled via Stripe Connect, the same system used by platforms like Shopify and DoorDash." },
      { question: "How does escrow protect experts?", answer: "Once a milestone is funded, the expert knows payment is guaranteed upon delivery approval. They do not need to chase invoices or worry about non-payment. If a buyer unreasonably refuses to approve work that meets the agreed scope, the expert can raise a dispute and LogicLot will review and mediate." },
    ],
  },
  {
    slug: "pricing",
    title: `${BRAND_NAME} Pricing: Transparent Fees for Businesses and Automation Experts`,
    description: `Complete pricing breakdown for ${BRAND_NAME}. Discovery Scans (€50), Custom Projects (€100 posting fee), expert commission tiers (16% to 11%), escrow protection, refund policies, and zero hidden fees. Transparent pricing for both sides of the marketplace.`,
    keywords: ["pricing", "fees", "commission", "escrow", "refund", "automation marketplace pricing", "automation expert commission", "Discovery Scan cost", "Custom Project cost", "marketplace fees", "transparent pricing", "no hidden fees", "automation platform cost"],
    content: `
Pricing confusion kills trust. When buyers do not know the total cost upfront, they hesitate. When experts do not know what percentage the platform takes, they under-price or avoid the platform entirely. ${BRAND_NAME} is built on radical pricing transparency: every fee is documented, no charges are hidden, and both sides of the marketplace know exactly what they pay and what they receive.

This page is the complete reference for ${BRAND_NAME} pricing. It covers what businesses pay, what experts pay, how commission tiers work, refund policies, payment processing, and how our pricing compares to alternatives. If a number exists, it is documented here.

## Pricing for businesses (buyers)

### The core principle: 0% platform fee on project payments

When you hire an expert on ${BRAND_NAME} to build an automation, you pay the expert's quoted price. There is no markup, no platform fee added to the project cost, and no percentage taken from your side.

If an expert quotes €2,000 for a project, you pay €2,000. Not €2,200. Not €2,000 plus a "service fee." The price you see in the proposal is the price you pay.

This is a deliberate design choice. Many marketplace platforms add a buyer fee (typically 5 to 15%) on top of the seller's price, which inflates costs and creates pricing confusion. ${BRAND_NAME} does not. The platform is funded entirely by expert commissions---the percentage deducted from the expert's earnings when a sale is completed. This means the buyer's interests and the platform's interests are aligned: both want the expert to deliver great work at a fair price.

### Discovery Scan posting fee: €50

A [Discovery Scan](/docs/discovery-scan-explained) is a structured process where you describe your business workflows and receive up to 5 expert proposals identifying your best automation opportunities.

**Cost: €50 one-time posting fee.**

This fee covers:
- Expert matching (connecting your submission with qualified automation specialists)
- Proposal facilitation (experts invest significant time analysing your business and writing scoped proposals)
- Platform infrastructure (secure messaging, proposal management, project dashboard)

**Refund policy:** If no proposal meets your criteria, you receive a 75% refund (€37.50). "No proposal meets your criteria" means the experts did not adequately address your needs or the proposals are not actionable. This is assessed on a good-faith basis.

**Credit toward your first project:** When you accept a proposal and proceed with an expert, your €50 posting fee is credited toward the first milestone payment. If your first milestone costs €500, you pay €450 out of pocket. This means the Discovery Scan is effectively free when you move forward.

**What you receive for €50:**
- Up to 5 detailed proposals from qualified automation experts
- Each proposal includes: problem analysis, recommended automation approach, tool recommendations, milestone breakdown, timeline, ROI estimate, and fixed pricing
- The ability to ask clarifying questions to any expert before deciding
- A prioritised automation roadmap for your business (derived from the expert analyses)

**How this compares:** A comparable assessment from a management consulting firm costs €5,000 to €50,000. A freelance consultant charges €500 to €2,000 for an assessment document. A Discovery Scan delivers actionable proposals from multiple experts for €50.

### Custom Project posting fee: €100

A [Custom Project](/docs/custom-project-explained) is for when you have a specific automation requirement. You post a detailed brief, receive up to 3 expert proposals, choose one, and work proceeds through milestone-based delivery with escrow protection.

**Cost: €100 one-time posting fee.**

This fee covers:
- Expert matching (more selective than Discovery Scans---Custom Projects are matched with experts who have specific relevant experience)
- Proposal facilitation (experts invest substantial time designing architecture, planning milestones, and calculating pricing for custom work)
- Full project infrastructure (milestone management, escrow handling, messaging, file sharing, dispute resolution support)

**Refund policy:** If no proposal meets your criteria, you receive a 75% refund (€75).

**Credit toward your first project:** The €100 posting fee is credited toward your first milestone payment when you accept a proposal and proceed.

### Solution purchases: listed price, no extras

When you buy a pre-built solution from the ${BRAND_NAME} [solutions marketplace](/solutions), you pay the listed price. There is no platform fee, no processing fee surcharge, and no additional charges. If a solution is listed at €299, you pay €299.

Payment processing fees (Stripe's standard fees) are included in the listed price---they are not added on top.

### Escrow: included at no extra cost

All project payments (Discovery Scans that convert to projects, Custom Projects, and applicable solution purchases) are protected by ${BRAND_NAME}'s [escrow system](/docs/how-escrow-works). There is no escrow fee. Funds are held until you approve each milestone delivery.

### Summary: what businesses pay

| Item | Cost | Refund policy |
|---|---|---|
| Discovery Scan posting fee | €50 (one-time) | 75% refund if no suitable proposal |
| Custom Project posting fee | €100 (one-time) | 75% refund if no suitable proposal |
| Project milestone payments | Expert's quoted price (0% platform markup) | Escrow-protected until approval |
| Solution purchases | Listed price (no extras) | Per solution terms |
| Escrow protection | Free (included) | N/A |
| Platform fee on payments | 0% | N/A |

**Total cost for a typical project:** €100 posting fee (credited to first milestone) + expert's quoted project price. Nothing else.

## Pricing for experts (sellers)

### Commission: the only fee you pay

${BRAND_NAME} charges a commission (percentage) on each completed sale. This is the platform's sole revenue source. There are no listing fees, no subscription fees, no proposal fees, and no monthly charges.

**How commission works:**
- When a buyer approves a milestone or completes a solution purchase, the sale amount is processed
- The platform commission is deducted
- The remaining amount is transferred to your connected Stripe account

**Example:** A buyer approves a €1,000 milestone. At a 16% commission rate, €160 goes to the platform and €840 goes to you. At a 12% commission rate, €120 goes to the platform and €880 goes to you.

### Commission tiers: rewarding loyalty and performance

Commission rates decrease as you complete more sales on the platform. This rewards experts who build a track record and deliver consistently.

| Tier | Commission rate | Qualification | Description |
|---|---|---|---|
| Standard | 16% | New experts (0-4 completed sales) | Starting rate for all new experts |
| Proven | 14% | After 5 completed sales | Demonstrated track record on the platform |
| Elite | 12% | Application-based (10+ sales, quality criteria) | Established expert with strong client history |
| Founder | 11% | First 20 experts on the platform | Lifetime rate for early adopters (limited) |

**How tier advancement works:**
- Tiers are based on the number of completed sales (approved milestones + solution purchases)
- Advancement is automatic---when you hit the threshold, your rate adjusts for all future sales
- There is no time requirement or minimum volume per period
- Tiers are permanent once earned (you do not drop back down)
- Admin can override tier rates for individual experts in special circumstances

**The Founder tier:** The Founder tier (11% commission) is reserved for the first 20 experts who join ${BRAND_NAME}. It is a lifetime rate that never increases, regardless of activity level. If you are one of the first 20, you lock in the lowest commission rate permanently. This tier is designed to reward early adopters who take a chance on a new platform and help build the initial marketplace.

### How commission compares to alternatives

| Platform / approach | Fee structure | Effective rate |
|---|---|---|
| ${BRAND_NAME} (Standard) | 16% commission, no other fees | 16% |
| ${BRAND_NAME} (Elite) | 12% commission, no other fees | 12% |
| ${BRAND_NAME} (Founder) | 11% commission, no other fees | 11% |
| Upwork | 10% service fee + payment processing | 10-13% effective |
| Fiverr | 20% commission | 20% |
| Toptal | ~30-40% (built into rate differential) | 30-40% |
| Direct freelancing | 0% platform fee + invoicing + collections + marketing time | 0% direct but high hidden costs |
| Agency subcontracting | 30-50% agency margin | 30-50% |

${BRAND_NAME}'s commission is competitive with general freelance platforms and significantly lower than agency models. The key difference is that ${BRAND_NAME} is a specialised automation marketplace, which means buyers come pre-qualified (they are specifically looking for automation expertise) and the platform handles matching, escrow, invoicing, and dispute resolution.

### No listing fees

There is no fee to list solutions on the marketplace. You can list 1 solution or 50 solutions---the cost is the same: zero.

### No proposal fees

There is no fee to submit proposals for Discovery Scans or Custom Projects. You invest your time in writing proposals; you are not charged for the opportunity to bid.

### No subscription or monthly fees

There is no monthly subscription, no annual fee, and no minimum activity requirement. If you have a quiet month with no sales, you pay nothing. The platform only earns when you earn.

### Payout timing and method

When a buyer approves a milestone or completes a purchase:
- Commission is deducted immediately
- Net earnings are transferred to your connected [Stripe Connect](https://stripe.com/connect) account
- Payout timing depends on your Stripe account configuration and country, but typically arrives within 2 to 7 business days
- Stripe supports payouts to bank accounts in 40+ countries

### Tax implications

${BRAND_NAME} does not withhold taxes from expert payouts. You are responsible for your own tax obligations based on your jurisdiction, business structure, and applicable tax laws. The platform provides [invoicing tools](/docs/invoicing) and transaction records to support your tax reporting. If you are VAT-registered, you can configure your VAT number in your [invoice settings](/expert/settings#invoice).

## Refund policies in detail

### Discovery Scan refunds

**When you qualify:** You receive a 75% refund (€37.50 of your €50 posting fee) if no proposal meets your criteria. This means:
- Fewer than the expected number of proposals were received
- The proposals received did not adequately address the needs described in your submission
- The proposals were not actionable or specific enough to make a decision

**When you do not qualify:** If you received actionable proposals but simply chose not to proceed, the posting fee is non-refundable. The experts invested time in analysis and proposal writing; the fee compensates for that investment.

**How to request:** Contact support through your dashboard. Refund requests are reviewed within 48 hours.

### Custom Project refunds

**When you qualify:** You receive a 75% refund (€75 of your €100 posting fee) under the same criteria as Discovery Scans---proposals were not received, not adequate, or not actionable.

**Milestone refunds:** If a dispute on a funded milestone is resolved in your favour, the escrowed funds are refunded to your original payment method. Refund processing takes 5 to 10 business days depending on your bank or card issuer.

### Solution purchase refunds

Solution refund policies are set by the individual expert and disclosed on the solution listing page. Some solutions offer satisfaction guarantees; others are sold as-is. Check the solution's terms before purchasing.

## Why this pricing model works

### For businesses

**Predictability.** You know the total cost before you start. Posting fee + expert's quoted price = total cost. No surprise fees appear after the fact.

**Alignment.** Because ${BRAND_NAME} does not add a buyer markup, the expert's price reflects the actual market rate for the work. You are not paying an inflated price to cover platform fees that you cannot see.

**Protection.** Escrow means you never pay for undelivered work. Refund policies mean you get most of your posting fee back if the process does not work for you.

### For experts

**Fair take rate.** At 12 to 16%, ${BRAND_NAME}'s commission is lower than most marketplace alternatives and dramatically lower than agency models. You keep the majority of every euro you earn.

**Earned reduction.** Commission rates decrease as you build your track record. This rewards loyalty and performance, and it incentivises experts to deliver excellent work (which leads to more sales and lower rates).

**No upfront costs.** You never pay to list, bid, or participate. The platform only earns when you earn. This eliminates the risk of paying for visibility that does not convert to revenue.

**Pre-qualified buyers.** ${BRAND_NAME} buyers are specifically looking for automation expertise. This means higher conversion rates from proposals to projects compared to general freelance platforms where buyers may be price-shopping across unrelated categories.

## Pricing FAQ: edge cases and details

**What payment methods are accepted?** All major credit and debit cards, Apple Pay, Google Pay, and SEPA Direct Debit (for European bank accounts). All payments are processed via [Stripe](https://stripe.com).

**What currency are prices in?** All prices on ${BRAND_NAME} are in euros (EUR). Stripe handles currency conversion for buyers and experts using non-euro currencies. Conversion rates are set by Stripe at market rates.

**Are there any hidden fees?** No. The fees documented on this page are the only fees that exist. There are no setup fees, no annual fees, no inactivity fees, no withdrawal fees (beyond standard Stripe processing), and no premium tier requirements.

**Can experts negotiate custom commission rates?** The standard tier structure applies to all experts. Admin may override commission rates in special circumstances (e.g., strategic partnerships, bulk volume agreements). Contact support for enquiries.

**What happens to my commission rate if the tier thresholds change?** Any tier you have already earned is permanent. If ${BRAND_NAME} adjusts thresholds in the future, you will never be moved to a higher commission rate than the one you have already qualified for.

[View the pricing page](/pricing) for a summary, or [start a Discovery Scan](/jobs/discovery) (€50) or [post a Custom Project](/jobs/new) (€100) to see the pricing in action.
    `,
    relatedSlugs: ["how-escrow-works", "invoicing", "custom-project-explained", "discovery-scan-explained"],
    faqs: [
      { question: "How much does it cost to use LogicLot as a business?", answer: "Businesses pay zero platform fees on project payments. The only costs are: Discovery Scan posting fee (€50, one-time, 75% refundable if no suitable proposals, credited toward your first project) or Custom Project posting fee (€100, same refund and credit terms). You then pay the expert's quoted price for the project with no markup. All payments are escrow-protected at no additional cost." },
      { question: "What are the expert commission rates on LogicLot?", answer: "Commission rates decrease with completed sales: Standard 16% (0-4 sales), Proven 14% (5+ sales), Elite 12% (application-based, 10+ sales), Founder 11% (first 20 experts, lifetime rate). There are no listing fees, proposal fees, subscription fees, or monthly charges. The platform only earns when experts earn." },
      { question: "Are there any hidden fees on LogicLot?", answer: "No. The fees documented on the pricing page are the only fees that exist. There are no setup fees, annual fees, inactivity fees, buyer markup fees, withdrawal fees, or premium tier requirements. Businesses pay posting fees plus the expert's quoted price. Experts pay a commission on completed sales. That is the complete fee structure." },
      { question: "How does the 75% refund policy work?", answer: "If you post a Discovery Scan (€50) or Custom Project (€100) and no proposal meets your criteria (proposals were not received, not adequate, or not actionable), you receive a 75% refund. If you received actionable proposals but chose not to proceed, the posting fee is non-refundable because experts invested time in analysis and proposal writing." },
    ],
  },
  {
    slug: "invoicing",
    title: "Invoicing",
    description: "How buyers get invoices and how experts customise their invoice template.",
    keywords: ["invoice", "invoicing", "receipt", "VAT", "billing"],
    content: `
${BRAND_NAME} supports invoicing for both buyers and experts. Buyers receive invoices for purchases; experts can customise the invoice template with their company details.

## For buyers

When you purchase a Discovery Scan, Custom Project, or Solution, you can access an invoice from your [Projects dashboard](/business/projects). Each completed or paid order has a downloadable invoice with line items, amounts, and seller details. Use "Print / Save as PDF" to keep a copy for expenses, VAT reclaim, or accounting.

## For experts

Experts can [set up their invoice template](/expert/settings#invoice) with company name, address, and VAT number. When a buyer pays, the platform generates an invoice using your template. You remain the seller of record for tax purposes—the invoice shows your business details, not ours.

## Why invoices matter

**Expense tracking.** Record and categorise spending for budgeting and forecasting.

**VAT reclaim.** If you're VAT-registered, you need a valid invoice to recover input VAT. Our invoice format includes the required fields.

**Audit trail.** Document purchases for accounting, compliance, and audits.

## Tax responsibility

Buyers and experts are responsible for their own tax obligations. We facilitate the transaction and provide invoice generation; we do not determine or collect VAT on your behalf. [Tax & Legal](/tax) has more detail.

[Configure your invoice details](/expert/settings#invoice) in Expert Settings.
    `,
    relatedSlugs: ["how-escrow-works", "pricing", "custom-project-explained"],
  },
];
