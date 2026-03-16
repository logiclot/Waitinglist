export interface HireVsAutomateRole {
  id: string;
  title: string;
  categorySlug: string;
  categoryLabel: string;
  hire: {
    bullets: string[];
    monthlyCostLow: number;
    monthlyCostHigh: number;
  };
  automate: {
    bullets: string[];
    setupCostLow: number;
    setupCostHigh: number;
    monthlyCost: number;
  };
  intro: string;
  verdict: string;
  faq: { question: string; answer: string }[];
  annualHireCost: { low: number; high: number };
  roiMonths: number;
}

export const HIRE_VS_AUTOMATE_ROLES: HireVsAutomateRole[] = [
  {
    id: "receptionist",
    title: "Receptionist",
    categorySlug: "ops-admin-automation",
    categoryLabel: "Ops & Admin Automation",
    hire: {
      bullets: [
        "Available during business hours only",
        "Handles one caller at a time",
        "Needs 1-2 weeks training on your systems",
        "Takes sick days, holidays, and vacation",
        "Can build rapport with repeat visitors",
        "Salary increases expected annually",
      ],
      monthlyCostLow: 1800,
      monthlyCostHigh: 2500,
    },
    automate: {
      bullets: [
        "Available 24/7 including weekends",
        "Handles unlimited calls simultaneously",
        "Set up in days, no ongoing training needed",
        "Consistent greeting and routing every time",
        "Integrates with your calendar and CRM",
        "Fixed monthly cost, no salary negotiations",
      ],
      setupCostLow: 1000,
      setupCostHigh: 2500,
      monthlyCost: 80,
    },
    intro: "For most small and mid-sized businesses, automating reception tasks saves 70-85% compared to hiring. An AI receptionist handles call routing, appointment booking, and basic inquiries 24/7 without breaks. Hiring still makes sense if your visitors expect a personal, in-person greeting or you need someone to handle physical mail and deliveries.",
    verdict: "Automate if your reception work is primarily phone-based, appointment scheduling, or call routing. Hire if you have a physical office where visitors need to be greeted in person, or if your callers frequently need complex, empathetic conversations that go beyond standard routing.",
    faq: [
      {
        question: "Can an automated receptionist handle multiple languages?",
        answer: "Yes. Most AI receptionist systems support 10+ languages out of the box and can detect the caller's language automatically. A human receptionist is typically limited to 1-3 languages.",
      },
      {
        question: "What happens when the AI receptionist cannot answer a question?",
        answer: "The system escalates to a human team member immediately, either by transferring the call or sending a notification with full context. No caller is left without a resolution path.",
      },
      {
        question: "Will callers know they are speaking to an AI?",
        answer: "Modern AI voice systems sound natural, but transparency requirements vary by region. In the EU, you may need to disclose that the caller is interacting with an automated system.",
      },
    ],
    annualHireCost: { low: 28080, high: 40500 },
    roiMonths: 1,
  },
  {
    id: "customer-support-rep",
    title: "Customer Support Rep",
    categorySlug: "support-ticketing",
    categoryLabel: "Support & Ticketing",
    hire: {
      bullets: [
        "Covers one shift - nights and weekends unattended",
        "Response quality varies with mood and workload",
        "Takes 2-4 weeks to learn your product fully",
        "Can only handle one conversation at a time",
        "Brings empathy and judgment to edge cases",
        "Turnover risk - you lose trained knowledge",
      ],
      monthlyCostLow: 2000,
      monthlyCostHigh: 2800,
    },
    automate: {
      bullets: [
        "Responds instantly, 24/7, in any language",
        "Handles hundreds of conversations at once",
        "Consistent answers based on your knowledge base",
        "Learns from every interaction over time",
        "Escalates complex cases to humans automatically",
        "No turnover - knowledge stays in the system",
      ],
      setupCostLow: 1500,
      setupCostHigh: 3000,
      monthlyCost: 180,
    },
    intro: "Automated customer support resolves 60-80% of common tickets instantly, cutting response times from hours to seconds. The annual cost of automation is roughly 10-15% of hiring a full-time rep. However, complex emotional situations and novel product issues still benefit from human judgment. The best approach for most businesses is automation for tier-1 support with human escalation for edge cases.",
    verdict: "Automate if most of your support volume is repetitive questions (order status, password resets, how-to guides). Hire if your product is highly technical, your customers expect white-glove service, or your support interactions frequently require empathy and creative problem-solving.",
    faq: [
      {
        question: "How does automated support handle angry customers?",
        answer: "AI systems detect negative sentiment and can immediately escalate to a human agent. They never respond with frustration, which actually de-escalates many situations. For genuinely upset customers, the handoff to a human happens within seconds.",
      },
      {
        question: "What is the typical resolution rate for automated support?",
        answer: "Well-configured AI support systems resolve 60-80% of tickets without human intervention. The exact rate depends on your product complexity and how well your knowledge base is maintained.",
      },
      {
        question: "Does automated support work for B2B companies?",
        answer: "Yes, especially for technical documentation lookups, account management queries, and billing questions. B2B companies often see even higher automation rates because their queries tend to be more structured and predictable.",
      },
    ],
    annualHireCost: { low: 31200, high: 45360 },
    roiMonths: 2,
  },
  {
    id: "sales-rep",
    title: "Sales Rep (BDR)",
    categorySlug: "sales-automations",
    categoryLabel: "Sales Automations",
    hire: {
      bullets: [
        "Makes 40-60 outreach touches per day max",
        "Follow-ups drop off when pipeline gets busy",
        "Ramp-up takes 1-3 months to full productivity",
        "Performance varies by individual motivation",
        "Builds genuine human relationships with prospects",
        "Takes pipeline knowledge with them if they leave",
      ],
      monthlyCostLow: 2200,
      monthlyCostHigh: 3000,
    },
    automate: {
      bullets: [
        "Sends thousands of personalised touches per day",
        "Never misses a follow-up - every lead is tracked",
        "Operational from day one, no ramp-up needed",
        "Consistent outreach quality across all leads",
        "Hands off warm leads to your team automatically",
        "All pipeline data stays in your CRM permanently",
      ],
      setupCostLow: 1500,
      setupCostHigh: 3000,
      monthlyCost: 180,
    },
    intro: "Automating outbound prospecting handles the volume side of sales development at a fraction of the cost. Automated sequences can send thousands of personalised messages daily while a human BDR manages 40-60. The savings are significant, but closing deals still requires human relationship-building. Most companies automate top-of-funnel outreach and keep humans for qualified conversations.",
    verdict: "Automate if your sales process starts with high-volume outreach (cold email, LinkedIn, lead scoring). Hire if your sales cycle requires in-person meetings, complex negotiations, or building trust over weeks before a deal closes. The best results come from combining both.",
    faq: [
      {
        question: "Will automated outreach hurt my brand reputation?",
        answer: "Not if configured properly. Modern sales automation tools personalise each message using prospect data, company info, and timing signals. Generic spam hurts your brand, but well-crafted automated sequences perform as well as or better than manual outreach.",
      },
      {
        question: "Can automation handle the entire sales cycle?",
        answer: "No, and it should not try to. Automation excels at prospecting, follow-ups, and lead scoring. Once a prospect is qualified, a human closer should take over. Trying to automate relationship-dependent steps reduces conversion rates.",
      },
    ],
    annualHireCost: { low: 34320, high: 48600 },
    roiMonths: 1,
  },
  {
    id: "social-media-manager",
    title: "Social Media Manager",
    categorySlug: "marketing-automation",
    categoryLabel: "Marketing Automation",
    hire: {
      bullets: [
        "Manages 2-3 platforms well, more is a stretch",
        "Creative output varies day to day",
        "Posting gaps during holidays and sick leave",
        "Manual tracking of engagement metrics",
        "Brings creative judgment and brand intuition",
        "Audience growth limited by one person's bandwidth",
      ],
      monthlyCostLow: 2400,
      monthlyCostHigh: 3200,
    },
    automate: {
      bullets: [
        "Posts across all platforms simultaneously",
        "Content scheduled weeks in advance, no gaps",
        "AI-generated caption variations for each channel",
        "Real-time engagement dashboards, no manual tracking",
        "Consistent posting frequency even during holidays",
        "Scales across platforms without extra cost",
      ],
      setupCostLow: 1000,
      setupCostHigh: 2200,
      monthlyCost: 120,
    },
    intro: "Social media automation handles scheduling, cross-posting, analytics, and basic content generation at roughly 5% of a full-time manager's cost. It eliminates posting gaps and ensures consistent frequency across all channels. However, brand voice development, community engagement, and creative campaign strategy still require human thinking. Most businesses benefit from automating the operational side while keeping strategic oversight human.",
    verdict: "Automate if your social media needs are primarily about consistent posting, cross-platform scheduling, and engagement tracking. Hire if your brand relies on a distinctive creative voice, real-time community management, or if social media is your primary customer acquisition channel.",
    faq: [
      {
        question: "Can AI generate social media content that matches my brand voice?",
        answer: "AI can generate drafts that follow your brand guidelines, but the best results come from a human reviewing and refining the output. Fully autonomous content generation works well for data-driven posts (stats, updates, promotions) but less well for opinion pieces or humor.",
      },
      {
        question: "How much time does social media automation actually save?",
        answer: "Most businesses report saving 10-15 hours per week on scheduling, posting, and reporting tasks. The time saved on analytics alone is typically 3-5 hours weekly, since dashboards update automatically instead of requiring manual data pulls.",
      },
    ],
    annualHireCost: { low: 37440, high: 51840 },
    roiMonths: 1,
  },
  {
    id: "seo-specialist",
    title: "SEO Specialist",
    categorySlug: "seo-automation",
    categoryLabel: "SEO Automation",
    hire: {
      bullets: [
        "Can audit and optimise a few pages per week",
        "Rankings checked manually or semi-weekly",
        "Competitor monitoring is time-consuming",
        "Reports compiled manually each month",
        "Brings strategic judgment on content direction",
        "Knowledge loss if they leave for another role",
        "Needs expensive tool subscriptions on top of salary",
      ],
      monthlyCostLow: 2800,
      monthlyCostHigh: 3800,
    },
    automate: {
      bullets: [
        "Audits your entire site on a schedule automatically",
        "Tracks every keyword daily, alerts on drops",
        "Monitors competitors in real time",
        "Reports generated and delivered automatically",
        "Flags declining pages before they hurt traffic",
        "All historical data preserved permanently",
      ],
      setupCostLow: 1500,
      setupCostHigh: 3000,
      monthlyCost: 180,
    },
    intro: "SEO automation handles the data-heavy side of search optimization: rank tracking, site audits, competitor monitoring, and reporting. These tasks consume 60-70% of an SEO specialist's time but can run automatically. The strategic side, including keyword strategy, content planning, and link building decisions, still benefits from human expertise. Most businesses save by automating monitoring and reporting while consulting a specialist quarterly for strategy.",
    verdict: "Automate if you need continuous rank tracking, automated site audits, and regular reporting. Hire if you are entering a competitive market, launching a new site, or need someone to develop and execute a content strategy from scratch. Consider a hybrid: automate the monitoring and hire a part-time consultant for strategy.",
    faq: [
      {
        question: "Can automation replace SEO strategy entirely?",
        answer: "No. Automation handles execution and monitoring very well, but strategic decisions like which keywords to target, what content to create, and how to build authority still require human judgment. Think of automation as the data layer that makes strategic decisions faster and better informed.",
      },
      {
        question: "How much do SEO tool subscriptions add to the cost of hiring?",
        answer: "A typical SEO tool stack (rank tracker, site auditor, competitor tool, backlink checker) costs 200-500 per month on top of salary. With automation, these tools are part of the system and included in the monthly cost.",
      },
      {
        question: "Will my rankings drop if I switch from a human SEO to automation?",
        answer: "Not if the transition is managed properly. Automation maintains the same optimizations a human would, often more consistently. The risk comes from losing strategic direction, which is why periodic human review is recommended even with full automation.",
      },
    ],
    annualHireCost: { low: 43680, high: 61560 },
    roiMonths: 1,
  },
  {
    id: "admin-assistant",
    title: "Admin Assistant",
    categorySlug: "ops-admin-automation",
    categoryLabel: "Ops & Admin Automation",
    hire: {
      bullets: [
        "Handles tasks one at a time, sequentially",
        "Manual errors in scheduling and data entry",
        "Available only during office hours",
        "Needs onboarding to your tools and processes",
        "Good at handling ambiguous or unusual requests",
      ],
      monthlyCostLow: 1900,
      monthlyCostHigh: 2600,
    },
    automate: {
      bullets: [
        "Processes multiple tasks in parallel instantly",
        "Zero errors in scheduling and data routing",
        "Works around the clock, weekends included",
        "Connects to your tools from day one",
        "Handles routine work - frees you for decisions",
        "Scales with your business at no extra cost",
      ],
      setupCostLow: 800,
      setupCostHigh: 1800,
      monthlyCost: 100,
    },
    intro: "Administrative automation eliminates the most time-consuming parts of office management: scheduling, data entry, document routing, and email triage. These tasks are highly repetitive and error-prone when done manually. Automation handles them faster, cheaper, and without mistakes. Hire when you need someone to handle ambiguous requests, office coordination that requires physical presence, or tasks that change unpredictably.",
    verdict: "Automate if your admin tasks are primarily digital: calendar management, email sorting, data entry, and document processing. Hire if you need physical office presence, someone to handle unpredictable requests, or if your admin role includes significant interpersonal coordination that requires judgment.",
    faq: [
      {
        question: "What admin tasks are easiest to automate?",
        answer: "Calendar scheduling, email triage, data entry from forms or documents, invoice processing, and meeting note distribution are the quickest wins. These tasks follow predictable patterns and benefit immediately from automation.",
      },
      {
        question: "How long does it take to set up admin automation?",
        answer: "Basic automation (scheduling, email routing, data entry) can be operational in 1-2 weeks. More complex workflows involving multiple tools and approval chains typically take 3-4 weeks to configure and test.",
      },
    ],
    annualHireCost: { low: 29640, high: 42120 },
    roiMonths: 1,
  },
  {
    id: "accountant",
    title: "Accountant",
    categorySlug: "finance-invoicing",
    categoryLabel: "Finance & Invoicing",
    hire: {
      bullets: [
        "Financial statements ready monthly, not daily",
        "Payroll runs require manual oversight each cycle",
        "Audit prep is a seasonal time crunch",
        "Tax rules need continuous education to stay current",
        "Provides strategic financial advice and judgment",
        "Errors can go unnoticed until end of quarter",
      ],
      monthlyCostLow: 2800,
      monthlyCostHigh: 3800,
    },
    automate: {
      bullets: [
        "Financial data updated in real time, always current",
        "Payroll calculated automatically every cycle",
        "Audit-ready reports generated on demand",
        "Tax rules applied consistently, updated centrally",
        "Anomalies flagged instantly, not months later",
        "Scales with transaction volume at no extra cost",
      ],
      setupCostLow: 2000,
      setupCostHigh: 3500,
      monthlyCost: 180,
    },
    intro: "Accounting automation handles transaction categorization, invoice processing, payroll calculations, and financial reporting at a fraction of the cost of a full-time accountant. For SMBs processing fewer than 500 transactions monthly, automation covers 80-90% of bookkeeping tasks. Strategic tax planning, financial advisory, and audit representation still require a qualified professional, but most businesses only need that expertise quarterly.",
    verdict: "Automate if your accounting needs are primarily bookkeeping, invoice processing, expense categorization, and standard reporting. Hire (or retain a part-time advisor) if you need tax strategy, financial planning, investor reporting, or audit representation. Most SMBs benefit from automating daily bookkeeping and consulting an accountant quarterly.",
    faq: [
      {
        question: "Is automated bookkeeping accurate enough to rely on?",
        answer: "Yes, for standard transactions. Modern accounting automation correctly categorizes 95%+ of recurring transactions. The remaining edge cases are flagged for human review. Error rates are actually lower than manual bookkeeping because automation does not suffer from fatigue or distraction.",
      },
      {
        question: "Can automation handle VAT and multi-country tax compliance?",
        answer: "Most accounting automation platforms support EU VAT rules, including reverse-charge mechanisms and country-specific rates. However, complex cross-border structuring and tax optimization still require a qualified tax advisor.",
      },
      {
        question: "What happens during an audit if I use automated bookkeeping?",
        answer: "Automated systems maintain a complete, timestamped audit trail of every transaction, which auditors actually prefer. The data is more organized and accessible than manual records. You will still need a human accountant to represent you during the audit itself.",
      },
    ],
    annualHireCost: { low: 43680, high: 61560 },
    roiMonths: 1,
  },
  {
    id: "content-writer",
    title: "Content Writer",
    categorySlug: "seo-automation",
    categoryLabel: "SEO Automation",
    hire: {
      bullets: [
        "Produces 2-4 articles per week at best",
        "Quality dips under tight deadlines",
        "Needs briefing and review cycles for each piece",
        "Writer's block and creative slumps happen",
        "Brings unique voice and storytelling ability",
      ],
      monthlyCostLow: 2200,
      monthlyCostHigh: 3200,
    },
    automate: {
      bullets: [
        "Drafts outlines and first versions in minutes",
        "Consistent output regardless of volume",
        "Topics sourced automatically from keyword gaps",
        "Declining content flagged for refresh instantly",
        "Formatted and ready for CMS in one workflow",
        "Human editor reviews - best of both worlds",
      ],
      setupCostLow: 1000,
      setupCostHigh: 2200,
      monthlyCost: 180,
    },
    intro: "Content automation accelerates the production pipeline: topic research, outline generation, first drafts, and publishing workflows. It can produce 10-20x the volume of a single writer for routine content like product descriptions, data-driven articles, and FAQ pages. Original thought leadership, brand storytelling, and pieces requiring real-world experience still need a human writer. The most effective setup uses AI for drafts and a human editor for quality control.",
    verdict: "Automate if you need high-volume content production for SEO, product descriptions, or knowledge base articles. Hire if your content strategy depends on original research, a distinctive brand voice, or long-form thought leadership. The ideal approach combines automated drafting with human editing.",
    faq: [
      {
        question: "Will Google penalize AI-generated content?",
        answer: "Google has stated it evaluates content based on quality, not how it was produced. Well-edited AI-assisted content that provides genuine value ranks just as well as human-written content. The key is ensuring accuracy, depth, and usefulness regardless of the production method.",
      },
      {
        question: "How much editing does AI-generated content need?",
        answer: "For factual, structured content (how-to guides, product descriptions), editing typically takes 10-15 minutes per piece. For opinion or strategy pieces, expect 30-60 minutes of editing. The time savings versus writing from scratch are still substantial.",
      },
      {
        question: "Can AI match my brand's writing style?",
        answer: "AI can be trained on your existing content to approximate your brand voice. It handles tone, vocabulary, and structure well. Subtle elements like humor, cultural references, and personal anecdotes require human input.",
      },
    ],
    annualHireCost: { low: 34320, high: 51840 },
    roiMonths: 1,
  },
  {
    id: "it-support",
    title: "IT Support Technician",
    categorySlug: "support-ticketing",
    categoryLabel: "Support & Ticketing",
    hire: {
      bullets: [
        "Available during business hours only",
        "Handles one ticket at a time",
        "Repetitive issues (password resets) consume most time",
        "Response times vary with ticket volume",
        "Can troubleshoot novel and complex problems",
        "Knowledge leaves when the person leaves",
      ],
      monthlyCostLow: 2400,
      monthlyCostHigh: 3200,
    },
    automate: {
      bullets: [
        "Self-service portal available 24/7",
        "Password resets and access requests resolved instantly",
        "Unlimited tickets handled simultaneously",
        "Consistent SLA compliance with auto-escalation",
        "Knowledge base grows with every resolved ticket",
        "Complex issues still routed to humans immediately",
      ],
      setupCostLow: 1500,
      setupCostHigh: 3000,
      monthlyCost: 150,
    },
    intro: "IT support automation resolves the most common tickets instantly: password resets, access provisioning, software installation, and VPN troubleshooting. These repetitive requests typically account for 40-60% of all IT tickets. Automated self-service portals handle them 24/7 without wait times. Complex infrastructure issues, hardware problems, and novel troubleshooting still need a human technician.",
    verdict: "Automate if most of your IT tickets are repetitive (password resets, access requests, standard troubleshooting). Hire if your infrastructure is complex, you manage on-premise hardware, or your team needs hands-on technical support for specialized software. Most companies automate tier-1 support and keep a smaller human team for escalations.",
    faq: [
      {
        question: "What percentage of IT tickets can be automated?",
        answer: "Industry data shows 40-60% of IT support tickets are repetitive and automatable: password resets, access requests, VPN issues, and software installations. The exact percentage depends on your infrastructure complexity.",
      },
      {
        question: "Does IT automation work with our existing ticketing system?",
        answer: "Most IT automation platforms integrate with common ticketing systems (Jira Service Management, Zendesk, Freshdesk, ServiceNow). Tickets are created, updated, and resolved within your existing workflow.",
      },
    ],
    annualHireCost: { low: 37440, high: 51840 },
    roiMonths: 1,
  },
  {
    id: "recruiter",
    title: "Recruiter",
    categorySlug: "lead-qualification-enrichment",
    categoryLabel: "Lead Qualification & Enrichment",
    hire: {
      bullets: [
        "Sources 10-20 candidates per role per week",
        "Manual CV screening is time-consuming and inconsistent",
        "Scheduling interviews involves back-and-forth emails",
        "Pipeline visibility depends on how well they log data",
        "Builds genuine relationships with candidates",
        "Recruitment knowledge leaves with them",
      ],
      monthlyCostLow: 2600,
      monthlyCostHigh: 3600,
    },
    automate: {
      bullets: [
        "Sources hundreds of matching profiles automatically",
        "CVs screened against your criteria in seconds",
        "Candidates self-schedule through a booking link",
        "Pipeline always up to date with parsed data in ATS",
        "Personalised outreach sequences at scale",
        "All sourcing data stays in your system permanently",
      ],
      setupCostLow: 1500,
      setupCostHigh: 3000,
      monthlyCost: 180,
    },
    intro: "Recruitment automation handles sourcing, CV screening, interview scheduling, and candidate communication at scale. It can screen 500+ CVs in minutes versus days for a human recruiter. The cost per hire drops significantly when high-volume screening and scheduling are automated. However, assessing cultural fit, selling your company vision, and negotiating offers still need a human. Most companies automate the sourcing pipeline and keep recruiters focused on interviews and closing.",
    verdict: "Automate if you hire frequently, receive high volumes of applications, or need to source candidates at scale. Hire if your roles require extensive candidate relationship management, your industry relies on passive candidate outreach through personal networks, or if cultural fit assessment is critical to your hiring process.",
    faq: [
      {
        question: "Is automated CV screening biased?",
        answer: "Any screening system, human or automated, can reflect biases in the criteria it uses. Automated systems have the advantage of applying criteria consistently across all candidates, eliminating the inconsistency of human fatigue and mood. Regular auditing of screening criteria is recommended regardless of method.",
      },
      {
        question: "Can automation handle the candidate experience well?",
        answer: "Yes. Automated systems provide instant acknowledgement of applications, regular status updates, and self-service scheduling, which candidates actually prefer over waiting for a recruiter to respond. The experience often improves compared to manual processes where candidates are left waiting.",
      },
    ],
    annualHireCost: { low: 40560, high: 58320 },
    roiMonths: 1,
  },
  {
    id: "crm-manager",
    title: "CRM Manager",
    categorySlug: "crm-automation",
    categoryLabel: "CRM Automation",
    hire: {
      bullets: [
        "Data cleanup is ongoing and never truly complete",
        "Reports are only as current as the last manual update",
        "Integration issues require technical problem-solving",
        "CRM rules depend on one person's understanding",
        "Can train team members and enforce adoption",
        "Custom workflows limited by one person's bandwidth",
        "If they leave, CRM logic becomes a black box",
      ],
      monthlyCostLow: 2800,
      monthlyCostHigh: 3800,
    },
    automate: {
      bullets: [
        "Deduplication and data cleaning runs nightly",
        "Reports generated from live data, always current",
        "Integrations sync bi-directionally without manual work",
        "Automation rules documented and version-controlled",
        "Deals move through pipeline stages automatically",
        "Stale deals and missing follow-ups flagged instantly",
        "Logic stays in the system regardless of team changes",
      ],
      setupCostLow: 2000,
      setupCostHigh: 3500,
      monthlyCost: 220,
    },
    intro: "CRM automation keeps your sales data clean, your pipeline moving, and your integrations synced without a dedicated manager. Automated workflows handle deduplication, deal stage progression, follow-up reminders, and reporting. For companies with fewer than 50 sales reps, automation handles 80%+ of CRM management tasks. Hiring a CRM manager makes sense during initial CRM implementation or if your sales process requires frequent custom workflow changes.",
    verdict: "Automate if your CRM is already set up and your primary need is data hygiene, pipeline automation, and reporting. Hire if you are implementing a new CRM, migrating from another system, or need someone to drive CRM adoption across a large sales team. After implementation, most companies transition to automation for ongoing management.",
    faq: [
      {
        question: "What CRM platforms work best with automation?",
        answer: "HubSpot, Salesforce, and Pipedrive have the strongest automation ecosystems. Most automation platforms also support Zoho, Close, and Monday CRM through API integrations. The specific platform matters less than having clean, structured data to work with.",
      },
      {
        question: "How do I prevent automation from overwriting important CRM data?",
        answer: "Well-designed CRM automation uses rules with safeguards: it will not overwrite fields that have been manually updated recently, it logs every change for audit purposes, and critical updates require confirmation before executing. Data protection is built into the workflow design.",
      },
    ],
    annualHireCost: { low: 43680, high: 61560 },
    roiMonths: 1,
  },
  {
    id: "marketing-manager",
    title: "Marketing Manager",
    categorySlug: "marketing-automation",
    categoryLabel: "Marketing Automation",
    hire: {
      bullets: [
        "Campaign launches depend on one person's availability",
        "A/B testing is manual and time-consuming",
        "Audience segmentation updated periodically, not live",
        "Performance reports compiled weekly or monthly",
        "Brings creative strategy and brand judgment",
        "Freelancer coordination adds overhead",
      ],
      monthlyCostLow: 3000,
      monthlyCostHigh: 4200,
    },
    automate: {
      bullets: [
        "Campaigns triggered automatically by user behaviour",
        "A/B tests run continuously with auto-winning variants",
        "Audiences segmented in real time from live data",
        "Performance dashboards updated by the minute",
        "External teams briefed via automated notifications",
        "Scales to more channels without more headcount",
      ],
      setupCostLow: 1200,
      setupCostHigh: 2500,
      monthlyCost: 150,
    },
    intro: "Marketing automation handles campaign execution, audience segmentation, A/B testing, and performance reporting automatically. It removes the operational bottleneck of depending on one person to launch and monitor campaigns. The strategic layer, including brand positioning, creative direction, and channel strategy, still requires human thinking. Companies that automate marketing operations typically run 3-5x more campaigns with the same budget.",
    verdict: "Automate if your marketing is execution-heavy: email sequences, ad campaign management, lead nurturing, and reporting. Hire if you need someone to develop brand strategy, manage agency relationships, or lead creative direction. Many companies automate execution first and then decide whether they still need a full-time marketing hire.",
    faq: [
      {
        question: "Can automation replace a marketing manager entirely?",
        answer: "Not entirely. Automation handles execution brilliantly but cannot develop brand strategy, create original campaign concepts, or make judgment calls about positioning. Most businesses automate 60-70% of marketing operations and retain strategic oversight through a part-time hire or consultant.",
      },
      {
        question: "How long before automated marketing campaigns show results?",
        answer: "Email automation typically shows results within 2-4 weeks. Ad campaign automation needs 4-8 weeks to gather enough data for optimization. Lead nurturing sequences usually take 1-3 months to demonstrate measurable impact on conversion rates.",
      },
    ],
    annualHireCost: { low: 46800, high: 68040 },
    roiMonths: 1,
  },
  {
    id: "account-manager",
    title: "Account Manager",
    categorySlug: "sales-automations",
    categoryLabel: "Sales Automations",
    hire: {
      bullets: [
        "Manages 15-25 accounts effectively - more is risky",
        "Check-ins happen when they remember, not on schedule",
        "Renewal dates tracked in spreadsheets or memory",
        "Upsell signals spotted only during conversations",
        "Builds genuine trust and personal relationships",
        "Account history leaves when the person does",
      ],
      monthlyCostLow: 2800,
      monthlyCostHigh: 3800,
    },
    automate: {
      bullets: [
        "Monitors every account's health in real time",
        "Check-in emails triggered by engagement patterns",
        "Renewal alerts sent automatically 90/60/30 days ahead",
        "Upsell signals surfaced from product usage data",
        "Account history preserved permanently in CRM",
        "Your team focuses on relationships, not admin",
      ],
      setupCostLow: 1500,
      setupCostHigh: 2800,
      monthlyCost: 150,
    },
    intro: "Account management automation handles the operational side: health monitoring, renewal tracking, check-in scheduling, and upsell signal detection. It ensures no account falls through the cracks, even as your customer base grows. The relationship side, including strategic conversations, conflict resolution, and trust building, still requires a human. Automation lets each account manager handle 2-3x more accounts by eliminating administrative overhead.",
    verdict: "Automate if your account management is bottlenecked by admin tasks (tracking renewals, scheduling check-ins, monitoring engagement). Hire if your accounts require deep personal relationships, complex negotiations, or if your product needs hands-on onboarding and training. The best results combine automation for monitoring with humans for relationship management.",
    faq: [
      {
        question: "Will my customers notice if account management is partially automated?",
        answer: "If done well, customers experience better service: faster responses to usage changes, proactive renewal reminders, and consistent check-ins. The automation handles the invisible operational work while your team focuses on meaningful conversations.",
      },
      {
        question: "How does automation detect upsell opportunities?",
        answer: "By monitoring product usage patterns, feature adoption rates, and support ticket topics. When an account hits usage thresholds or starts using features that indicate readiness for an upgrade, the system alerts your team with context and suggested talking points.",
      },
    ],
    annualHireCost: { low: 43680, high: 61560 },
    roiMonths: 1,
  },
  {
    id: "customer-success-manager",
    title: "Customer Success Manager",
    categorySlug: "support-ticketing",
    categoryLabel: "Support & Ticketing",
    hire: {
      bullets: [
        "Handles 20-40 accounts - quality drops with more",
        "Health monitoring is manual and often reactive",
        "At-risk accounts found too late for intervention",
        "QBR prep takes hours per account",
        "Brings empathy and strategic thinking to relationships",
      ],
      monthlyCostLow: 2800,
      monthlyCostHigh: 4000,
    },
    automate: {
      bullets: [
        "Every account monitored continuously, no limits",
        "Health scores calculated from real product usage data",
        "At-risk accounts flagged before they churn",
        "QBR decks pre-built from live CRM and product data",
        "Routine check-ins automated - humans handle strategy",
        "Scales with your customer base at no extra cost",
      ],
      setupCostLow: 1800,
      setupCostHigh: 3500,
      monthlyCost: 200,
    },
    intro: "Customer success automation monitors account health continuously, detects churn risk early, and pre-builds review materials from live data. It shifts your CS team from reactive firefighting to proactive strategy. Automated health scoring catches at-risk accounts weeks before a human would notice. However, the strategic conversations, executive alignment, and creative problem-solving that save at-risk accounts still need experienced humans.",
    verdict: "Automate if you need to scale customer success beyond what your current team can handle, or if churn detection is too slow. Hire if your product requires high-touch onboarding, your accounts involve executive stakeholders, or if customer success is your primary growth engine (expansion revenue). Most SaaS companies automate monitoring and reporting while keeping CSMs for strategic accounts.",
    faq: [
      {
        question: "How does automated health scoring work?",
        answer: "Health scores combine multiple signals: product login frequency, feature adoption depth, support ticket volume and sentiment, billing history, and engagement with emails and check-ins. Each signal is weighted based on its correlation with churn in your historical data.",
      },
      {
        question: "Can automation actually prevent churn?",
        answer: "Automation detects churn risk earlier, which gives your team more time to intervene. The prevention itself still happens through human action: a well-timed call, a product walkthrough, or a pricing discussion. Automation provides the early warning system that makes intervention possible.",
      },
    ],
    annualHireCost: { low: 43680, high: 64800 },
    roiMonths: 1,
  },
  {
    id: "inventory-manager",
    title: "Inventory Manager",
    categorySlug: "ops-admin-automation",
    categoryLabel: "Ops & Admin Automation",
    hire: {
      bullets: [
        "Stock checks happen periodically, not in real time",
        "Reorders placed manually - risk of stockouts",
        "Data across channels reconciled once a week or month",
        "Forecasting based on gut feel and spreadsheets",
        "Can negotiate with suppliers and handle exceptions",
        "Errors go unnoticed until physical audit",
      ],
      monthlyCostLow: 2200,
      monthlyCostHigh: 3000,
    },
    automate: {
      bullets: [
        "Stock levels tracked in real time across all channels",
        "Purchase orders triggered automatically at thresholds",
        "Cross-channel inventory synced continuously",
        "Demand forecasting from historical data and trends",
        "Discrepancies flagged instantly, not during audits",
        "Scales across warehouses without added headcount",
      ],
      setupCostLow: 1500,
      setupCostHigh: 3000,
      monthlyCost: 150,
    },
    intro: "Inventory automation provides real-time stock visibility, automatic reordering, cross-channel synchronization, and demand forecasting. It eliminates stockouts caused by delayed manual checks and reduces overstock from inaccurate forecasting. For businesses with fewer than 5,000 SKUs, automation handles 90%+ of inventory management tasks. Supplier negotiations, exception handling, and physical warehouse operations still need humans.",
    verdict: "Automate if your inventory challenges are about visibility, sync accuracy, and reorder timing. Hire if you manage complex supplier relationships, handle perishable goods requiring judgment calls, or operate warehouse logistics that need physical oversight. Most e-commerce and retail businesses see the fastest ROI from inventory automation.",
    faq: [
      {
        question: "How accurate is automated demand forecasting?",
        answer: "Automated forecasting using historical sales data, seasonal patterns, and trend analysis typically achieves 85-95% accuracy for established products. New products with no sales history require manual input for initial forecasts until enough data accumulates.",
      },
      {
        question: "Can inventory automation work across multiple sales channels?",
        answer: "Yes, that is one of its primary strengths. Automation syncs stock levels across your website, Amazon, eBay, physical stores, and wholesale channels in real time, preventing overselling and ensuring consistent availability.",
      },
    ],
    annualHireCost: { low: 34320, high: 48600 },
    roiMonths: 1,
  },
  {
    id: "ecommerce-manager",
    title: "E-commerce Manager",
    categorySlug: "ops-admin-automation",
    categoryLabel: "Ops & Admin Automation",
    hire: {
      bullets: [
        "Product updates across channels done one at a time",
        "Order status updates require manual monitoring",
        "Returns processed individually per policy",
        "Pricing mismatches caught only by complaint",
        "Can handle complex customer negotiations",
      ],
      monthlyCostLow: 2600,
      monthlyCostHigh: 3600,
    },
    automate: {
      bullets: [
        "Product data synced across all channels instantly",
        "Order routing and status updates fully automated",
        "Returns processed automatically per your rules",
        "Pricing mismatches and stock-outs flagged in real time",
        "Shipping notifications sent proactively to customers",
        "Scales to new marketplaces without more staff",
      ],
      setupCostLow: 1500,
      setupCostHigh: 3000,
      monthlyCost: 150,
    },
    intro: "E-commerce automation handles product data synchronization, order routing, returns processing, and pricing management across all your sales channels. It eliminates the manual work of keeping listings consistent and orders flowing smoothly. For businesses selling on 2+ channels, automation prevents the pricing errors and stock mismatches that cost revenue. Strategic decisions about product mix, pricing strategy, and channel expansion still benefit from human expertise.",
    verdict: "Automate if you sell across multiple channels and struggle with data consistency, order management, or returns processing. Hire if you are launching a new e-commerce operation, need someone to develop marketplace strategy, or your product catalog requires complex merchandising decisions. Most established e-commerce businesses benefit immediately from operational automation.",
    faq: [
      {
        question: "Which e-commerce platforms integrate with automation tools?",
        answer: "All major platforms are supported: Shopify, WooCommerce, Magento, BigCommerce, and marketplace channels like Amazon, eBay, and Bol.com. Most automation tools connect through native integrations or APIs.",
      },
      {
        question: "Can automation handle marketplace-specific rules and requirements?",
        answer: "Yes. Automation tools map your product data to each marketplace's requirements, handling different category structures, required fields, and listing formats. Updates to one product propagate correctly to all channels with the right formatting.",
      },
    ],
    annualHireCost: { low: 40560, high: 58320 },
    roiMonths: 1,
  },
  {
    id: "hr-manager",
    title: "HR Manager",
    categorySlug: "ops-admin-automation",
    categoryLabel: "Ops & Admin Automation",
    hire: {
      bullets: [
        "Onboarding new hires takes days of manual coordination",
        "Leave tracking managed in spreadsheets or basic tools",
        "Probation reviews missed when calendar gets busy",
        "Document collection involves chasing over email",
        "Handles sensitive employee conversations with empathy",
        "Processes depend on one person's availability",
      ],
      monthlyCostLow: 3000,
      monthlyCostHigh: 4200,
    },
    automate: {
      bullets: [
        "Onboarding checklists trigger automatically on hire",
        "Self-service leave booking with auto-approval rules",
        "Review reminders sent at every probation milestone",
        "Documents collected through a self-service portal",
        "IT accounts and tool access provisioned automatically",
        "Processes run consistently regardless of who's on leave",
      ],
      setupCostLow: 1500,
      setupCostHigh: 3000,
      monthlyCost: 150,
    },
    intro: "HR automation handles the operational backbone of people management: onboarding workflows, leave tracking, document collection, review scheduling, and access provisioning. These process-driven tasks consume 60-70% of an HR manager's time. Automating them ensures nothing falls through the cracks when the team is busy. Sensitive conversations, performance coaching, conflict resolution, and culture building still require a skilled human.",
    verdict: "Automate if your HR bottlenecks are operational: slow onboarding, missed review dates, manual leave tracking, and document chasing. Hire if your organization needs strategic HR leadership, employee relations management, or if you are navigating complex situations like restructuring, rapid growth, or compliance in multiple jurisdictions.",
    faq: [
      {
        question: "Is HR automation compliant with GDPR?",
        answer: "Reputable HR automation platforms are built with GDPR compliance: data minimization, right to erasure, consent management, and data processing agreements are standard features. Always verify that your chosen platform stores data within the EU if that is a requirement.",
      },
      {
        question: "Can HR automation handle different employment types (full-time, contractors, part-time)?",
        answer: "Yes. Modern HR automation supports multiple employment types with different workflows, approval chains, and document requirements for each. Contractor onboarding and offboarding can be fully separate from employee processes.",
      },
    ],
    annualHireCost: { low: 46800, high: 68040 },
    roiMonths: 1,
  },
  {
    id: "outreach-specialist",
    title: "Outreach Specialist",
    categorySlug: "lead-qualification-enrichment",
    categoryLabel: "Lead Qualification & Enrichment",
    hire: {
      bullets: [
        "Sends 50-80 personalised emails per day max",
        "Follow-up sequences drop off under workload pressure",
        "Lead scoring based on intuition, not data",
        "A/B testing done manually if at all",
        "Can adapt messaging based on live conversation",
      ],
      monthlyCostLow: 2200,
      monthlyCostHigh: 3000,
    },
    automate: {
      bullets: [
        "Sends thousands of personalised emails daily",
        "Multi-step sequences run reliably without gaps",
        "Lead scoring based on real engagement data",
        "Continuous A/B testing on messaging and timing",
        "Sales-ready leads handed off automatically",
        "Performance tracked in real-time dashboards",
      ],
      setupCostLow: 1000,
      setupCostHigh: 2200,
      monthlyCost: 150,
    },
    intro: "Outreach automation sends thousands of personalised messages daily with multi-step follow-up sequences that never drop off. It scores leads based on actual engagement data rather than gut feeling, and A/B tests messaging continuously. For businesses that depend on outbound lead generation, automation delivers 10-50x the volume of a single specialist at 5-10% of the cost. Live conversations and relationship-based selling still need a human touch.",
    verdict: "Automate if your outreach is primarily email-based, high-volume, and follows repeatable patterns. Hire if your outreach requires phone calls, in-person networking, or if your target audience is small enough that every interaction needs to be deeply personalised. Most B2B companies automate the initial outreach and route warm leads to human sales reps.",
    faq: [
      {
        question: "Will automated outreach end up in spam folders?",
        answer: "Not if set up correctly. Proper email warm-up, domain authentication (SPF, DKIM, DMARC), sending limits, and personalisation keep deliverability rates high. Automated outreach actually maintains better sending practices than most manual senders because the rules are enforced consistently.",
      },
      {
        question: "How personalised can automated outreach really be?",
        answer: "Modern outreach tools pull data from LinkedIn, company websites, news, and CRM records to personalise each message with specific details about the recipient's role, company, and recent activity. The personalisation goes well beyond inserting a first name.",
      },
    ],
    annualHireCost: { low: 34320, high: 48600 },
    roiMonths: 1,
  },
  {
    id: "project-coordinator",
    title: "Project Manager",
    categorySlug: "ops-admin-automation",
    categoryLabel: "Ops & Admin Automation",
    hire: {
      bullets: [
        "Status updates rely on chasing people for info",
        "Missed deadlines caught late, not in real time",
        "Meeting scheduling involves back-and-forth emails",
        "Reports compiled manually each week",
        "Can navigate team dynamics and resolve blockers",
        "Task follow-ups depend on individual diligence",
      ],
      monthlyCostLow: 2400,
      monthlyCostHigh: 3200,
    },
    automate: {
      bullets: [
        "Task progress tracked automatically across tools",
        "Missed deadlines trigger instant alerts",
        "Meetings scheduled with auto-generated agendas",
        "Status reports pushed to Slack or email on schedule",
        "Overdue tasks get automated reminders",
        "Document versions tracked without manual effort",
      ],
      setupCostLow: 1000,
      setupCostHigh: 2200,
      monthlyCost: 120,
    },
    intro: "Project management automation handles the operational overhead that consumes most of a PM's day: status tracking, deadline monitoring, meeting scheduling, report generation, and task follow-ups. These coordination tasks can run automatically across tools like Jira, Asana, Slack, and Google Calendar. The strategic side, including scope decisions, stakeholder management, team motivation, and blocker resolution, still needs a skilled human. Automation frees your PM to focus on leadership instead of admin.",
    verdict: "Automate if your project management bottleneck is operational: missed deadlines, status chasing, manual reporting, and scheduling overhead. Hire if your projects involve complex stakeholder management, team dynamics that need active facilitation, or if you are managing high-risk projects where judgment calls happen daily. The best setup automates operational tracking and keeps a human PM for leadership and decision-making.",
    faq: [
      {
        question: "What project management tools integrate with automation?",
        answer: "All major PM tools are supported: Jira, Asana, Monday.com, Trello, ClickUp, and Linear. Automation connects these with communication tools (Slack, Teams, email) and document platforms (Google Workspace, Notion) for end-to-end workflow automation.",
      },
      {
        question: "Can automation handle agile sprint management?",
        answer: "Yes. Automation can manage sprint ceremonies (scheduling standups, generating sprint reports), track velocity, flag blockers based on ticket staleness, and send sprint review summaries. The sprint planning and retrospective facilitation still benefit from human leadership.",
      },
    ],
    annualHireCost: { low: 37440, high: 51840 },
    roiMonths: 1,
  },
];
