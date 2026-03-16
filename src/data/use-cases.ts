export interface UseCase {
  id: string;
  title: string;
  categorySlug: string;
  categoryLabel: string;
  problem: string;
  solution: string;
  benefits: string[];
  tools: string[];
  estimatedSavings: string;
  setupTime: string;
  faq: { question: string; answer: string }[];
  intro: string;
}

export const USE_CASES: UseCase[] = [
  {
    id: "invoice-processing",
    title: "Invoice Processing Automation",
    categorySlug: "finance-operations",
    categoryLabel: "Finance & Operations",
    problem:
      "Manual invoice processing eats 10-15 hours per week for a typical accounts payable team. Data entry errors cause duplicate payments, missed discounts, and reconciliation headaches that compound over time. Staff spend more time copying numbers between systems than doing actual financial analysis.",
    solution:
      "Automated invoice processing extracts data from PDFs, emails, and scanned documents using OCR and AI. It matches invoices to purchase orders, flags discrepancies, routes approvals based on amount thresholds, and posts entries directly to your accounting software.",
    benefits: [
      "Cut invoice processing time by 80%, from 15 minutes to under 3 minutes per invoice",
      "Eliminate data entry errors that cause duplicate or incorrect payments",
      "Capture early-payment discounts automatically by processing invoices same-day",
      "Free your AP team to focus on vendor negotiations and cash flow forecasting",
      "Maintain a complete audit trail with every invoice logged and timestamped",
    ],
    tools: ["Make", "Parseur", "QuickBooks", "Xero", "Google Sheets", "Slack"],
    estimatedSavings: "10-15 hours per week",
    setupTime: "5-10 days",
    faq: [
      {
        question: "What invoice formats are supported?",
        answer:
          "Most automations handle PDF, email body text, scanned images (via OCR), and structured formats like XML or EDI. The specific formats depend on the tools used in the build.",
      },
      {
        question: "Does this integrate with my existing accounting software?",
        answer:
          "Yes. Common integrations include QuickBooks, Xero, FreshBooks, and Sage. The automation pushes extracted data directly into your GL via API.",
      },
      {
        question: "How accurate is the data extraction?",
        answer:
          "Modern OCR plus AI extraction typically achieves 95-99% accuracy on structured invoices. A human review step can be added for invoices that fall below confidence thresholds.",
      },
    ],
    intro:
      "Invoice processing automation eliminates manual data entry by extracting invoice data from PDFs and emails, matching it to purchase orders, and posting entries to your accounting system. Businesses using this automation typically reduce processing time by 80% and virtually eliminate data entry errors.",
  },
  {
    id: "lead-qualification",
    title: "Lead Qualification Automation",
    categorySlug: "sales-crm",
    categoryLabel: "Sales & CRM",
    problem:
      "Sales reps waste 30-40% of their time on leads that will never convert. Without consistent qualification criteria, good leads sit untouched while reps chase low-probability prospects. This leads to longer sales cycles and missed revenue targets.",
    solution:
      "Automated lead qualification scores and enriches every inbound lead in real time. It pulls firmographic data, checks against your ICP criteria, assigns a score, and routes qualified leads to the right rep instantly, while nurturing the rest with targeted sequences.",
    benefits: [
      "Respond to qualified leads within minutes instead of hours",
      "Increase sales team productivity by eliminating manual research on each prospect",
      "Apply consistent scoring criteria across every lead, removing subjective judgment",
      "Enrich lead records automatically with company size, industry, tech stack, and funding data",
      "Route leads to the right rep based on territory, deal size, or product interest",
    ],
    tools: ["Make", "n8n", "Clay", "Clearbit", "HubSpot", "Salesforce", "Slack"],
    estimatedSavings: "15-25 hours per week across the sales team",
    setupTime: "5-7 days",
    faq: [
      {
        question: "What data sources are used for enrichment?",
        answer:
          "Common sources include Clearbit, Clay, Apollo, LinkedIn, and Crunchbase. The specific sources depend on what matters most for your ICP, such as company size, funding stage, or technology stack.",
      },
      {
        question: "Can the scoring model be customized?",
        answer:
          "Yes. Scoring criteria are fully configurable based on your ICP. Typical factors include company size, industry, job title, engagement signals, and technology usage.",
      },
      {
        question: "How does this handle leads that do not qualify?",
        answer:
          "Non-qualifying leads are automatically placed into nurture sequences with relevant content. If their score changes over time (e.g., the company grows or raises funding), they are re-evaluated.",
      },
    ],
    intro:
      "Lead qualification automation scores, enriches, and routes every inbound lead in real time using firmographic data and your ideal customer profile criteria. Sales teams using automated qualification typically respond to high-value leads within minutes and see a 20-35% increase in conversion rates.",
  },
  {
    id: "customer-onboarding",
    title: "Customer Onboarding Automation",
    categorySlug: "customer-support",
    categoryLabel: "Customer Support",
    problem:
      "Manual customer onboarding is slow, inconsistent, and error-prone. New customers wait days for account setup while support teams copy data between systems, send welcome emails by hand, and forget follow-up steps. This leads to poor first impressions and higher early churn.",
    solution:
      "Automated onboarding triggers a structured sequence the moment a customer signs up or pays. It provisions accounts, sends personalized welcome emails, schedules check-in calls, assigns CSM owners, and tracks completion of each onboarding step in your CRM.",
    benefits: [
      "Reduce time-to-value from days to hours with instant account provisioning",
      "Deliver a consistent onboarding experience for every customer, regardless of team capacity",
      "Track onboarding progress per customer and flag accounts that stall",
      "Personalize communications based on plan type, company size, or use case",
      "Reduce early churn by ensuring customers complete critical activation steps",
    ],
    tools: ["Make", "n8n", "HubSpot", "Intercom", "Slack", "Google Sheets", "Calendly"],
    estimatedSavings: "8-12 hours per week",
    setupTime: "5-10 days",
    faq: [
      {
        question: "Can this handle different onboarding flows for different plans?",
        answer:
          "Yes. The automation uses conditional logic to branch the onboarding sequence based on plan tier, company size, use case, or any other attribute captured at signup.",
      },
      {
        question: "How are onboarding tasks tracked?",
        answer:
          "Each onboarding step is logged in your CRM or project management tool. Dashboards show completion rates, time-to-complete, and accounts that need manual intervention.",
      },
      {
        question: "Does it integrate with product analytics?",
        answer:
          "Yes. Common integrations include Mixpanel, Amplitude, and Segment. The automation can trigger actions based on in-app behavior, such as sending a help article when a user has not completed a key step.",
      },
    ],
    intro:
      "Customer onboarding automation provisions accounts, sends personalized welcome sequences, schedules check-in calls, and tracks activation milestones automatically. Businesses that automate onboarding typically cut time-to-value by 60% and reduce early-stage churn by 15-25%.",
  },
  {
    id: "email-outreach",
    title: "Email Outreach Automation",
    categorySlug: "sales-crm",
    categoryLabel: "Sales & CRM",
    problem:
      "Sales reps spend 5-8 hours per week writing, personalizing, and following up on outreach emails. Manually tracking who opened, replied, or needs a follow-up is unreliable. Outreach volume is limited by headcount, and messaging quality varies across the team.",
    solution:
      "Automated email outreach builds personalized sequences using prospect data, sends multi-step campaigns on a schedule, tracks engagement signals (opens, clicks, replies), and triggers follow-ups or CRM updates based on recipient behavior.",
    benefits: [
      "Scale outreach volume 5-10x without adding headcount",
      "Personalize each email using prospect-specific data like company name, role, and recent activity",
      "Follow up consistently, every prospect gets the right number of touches at the right intervals",
      "Track open rates, reply rates, and meeting bookings per sequence",
      "Sync all activity back to your CRM automatically",
    ],
    tools: ["Make", "Instantly", "Lemlist", "Apollo", "HubSpot", "Google Sheets"],
    estimatedSavings: "5-8 hours per rep per week",
    setupTime: "3-5 days",
    faq: [
      {
        question: "Does this handle email deliverability?",
        answer:
          "The automation follows best practices for deliverability, including domain warming, send limits, and bounce handling. Tools like Instantly and Lemlist have built-in deliverability features.",
      },
      {
        question: "Can sequences adjust based on recipient behavior?",
        answer:
          "Yes. Sequences branch based on opens, clicks, and replies. For example, a prospect who opens but does not reply might receive a different follow-up than one who never opened the email.",
      },
      {
        question: "How does personalization work at scale?",
        answer:
          "The automation pulls data from your CRM and enrichment tools to populate merge fields like company name, role, industry, and recent company news. AI can also generate custom opening lines.",
      },
    ],
    intro:
      "Email outreach automation builds and sends personalized multi-step email sequences, tracks engagement signals, and triggers follow-ups based on recipient behavior. Sales teams using automated outreach typically increase response rates by 25-40% while saving 5-8 hours per rep per week.",
  },
  {
    id: "social-media-posting",
    title: "Social Media Scheduling Automation",
    categorySlug: "marketing-automation",
    categoryLabel: "Marketing Automation",
    problem:
      "Marketing teams spend 6-10 hours per week manually posting to multiple social platforms. Content calendars live in spreadsheets, approvals happen over email, and posts frequently go out late or get forgotten entirely. Cross-platform analytics require logging into each network separately.",
    solution:
      "Automated social media scheduling pulls approved content from your content calendar, formats it per platform (character limits, image sizes, hashtags), and publishes on a preset schedule. It collects engagement metrics into a single dashboard and alerts the team when posts hit performance thresholds.",
    benefits: [
      "Publish to LinkedIn, X, Instagram, and Facebook from a single workflow",
      "Maintain a consistent posting cadence without daily manual effort",
      "Automatically resize images and adjust copy length per platform",
      "Aggregate engagement metrics into one reporting dashboard",
      "Free 6-10 hours per week for content strategy and creative work",
    ],
    tools: ["Make", "Buffer", "Hootsuite", "Airtable", "Canva", "Google Sheets"],
    estimatedSavings: "6-10 hours per week",
    setupTime: "3-5 days",
    faq: [
      {
        question: "Which social platforms are supported?",
        answer:
          "Most automations support LinkedIn, X (Twitter), Instagram, Facebook, and Pinterest. Platform support depends on the scheduling tool used and API availability.",
      },
      {
        question: "Can content be auto-generated?",
        answer:
          "Yes. AI tools like ChatGPT or Claude can generate draft posts based on blog articles, product updates, or prompts. A human review step is recommended before publishing.",
      },
      {
        question: "Does it handle approval workflows?",
        answer:
          "Yes. Content can be routed for approval via Slack or email before being queued for publishing. Only approved posts enter the scheduling pipeline.",
      },
    ],
    intro:
      "Social media scheduling automation pulls content from your calendar, formats it for each platform, and publishes on schedule across LinkedIn, X, Instagram, and Facebook. Marketing teams using this automation reclaim 6-10 hours per week and maintain a consistent posting cadence without manual effort.",
  },
  {
    id: "employee-onboarding",
    title: "Employee Onboarding Automation",
    categorySlug: "hr-recruiting",
    categoryLabel: "HR & Recruiting",
    problem:
      "HR teams spend 8-15 hours per new hire on onboarding tasks: creating accounts, ordering equipment, sending policy documents, scheduling orientation, and chasing signatures. When steps are missed, new employees start without tools they need, delaying productivity by days or weeks.",
    solution:
      "Automated employee onboarding triggers a structured checklist the moment an offer is accepted. It provisions email and tool accounts, sends document signing requests, schedules orientation meetings, notifies managers, and tracks completion of every step in a centralized dashboard.",
    benefits: [
      "Cut onboarding admin time from 8-15 hours to under 1 hour per new hire",
      "Ensure every new employee has accounts, equipment, and documents on day one",
      "Standardize the onboarding experience across departments and locations",
      "Track completion rates and flag stalled onboarding tasks automatically",
      "Reduce new-hire time-to-productivity by 30-50%",
    ],
    tools: ["Make", "n8n", "BambooHR", "Google Workspace", "Slack", "DocuSign", "Notion"],
    estimatedSavings: "8-15 hours per new hire",
    setupTime: "7-14 days",
    faq: [
      {
        question: "Can this integrate with our HRIS?",
        answer:
          "Yes. Common integrations include BambooHR, Gusto, Workday, and Personio. The automation triggers from new hire records created in your HRIS.",
      },
      {
        question: "Does it handle different onboarding for different departments?",
        answer:
          "Yes. The workflow branches based on department, role, location, or seniority level. Engineering hires might get GitHub and AWS access, while marketing hires get HubSpot and Canva.",
      },
      {
        question: "How are IT provisioning requests handled?",
        answer:
          "The automation creates tickets in your IT system (Jira, ServiceNow, etc.) for account creation and equipment ordering, then tracks their completion and notifies the hiring manager.",
      },
    ],
    intro:
      "Employee onboarding automation provisions accounts, sends documents for signature, schedules orientation, and tracks every onboarding step from offer acceptance to day one. HR teams using this automation save 8-15 hours per new hire and ensure no critical setup steps are missed.",
  },
  {
    id: "crm-data-cleanup",
    title: "CRM Data Cleanup Automation",
    categorySlug: "sales-crm",
    categoryLabel: "Sales & CRM",
    problem:
      "CRM databases degrade at 25-30% per year through duplicate records, outdated contact info, missing fields, and inconsistent formatting. Dirty data causes reps to call wrong numbers, send emails to dead addresses, and waste time on leads that no longer exist. Reporting becomes unreliable.",
    solution:
      "Automated CRM cleanup runs on a schedule to deduplicate records, standardize formatting (phone numbers, addresses, job titles), enrich missing fields from external data sources, flag bounced emails, and merge duplicate contacts. It also enforces data quality rules on new records entering the system.",
    benefits: [
      "Reduce duplicate records by 90% with automated detection and merging",
      "Keep contact data current by enriching records weekly with external sources",
      "Standardize field formatting for consistent reporting and segmentation",
      "Flag and quarantine records with bounced emails or invalid phone numbers",
      "Enforce data quality rules at the point of entry, preventing new dirty data",
    ],
    tools: ["Make", "n8n", "HubSpot", "Salesforce", "Clearbit", "NeverBounce", "Google Sheets"],
    estimatedSavings: "60% reduction in bad data, 5-8 hours per week in manual cleanup",
    setupTime: "5-7 days",
    faq: [
      {
        question: "How are duplicate records handled?",
        answer:
          "The automation matches records on email, phone, company name, and domain. Matches are scored by confidence level. High-confidence duplicates are merged automatically; medium-confidence matches are flagged for human review.",
      },
      {
        question: "Will this delete any records?",
        answer:
          "No records are deleted by default. Duplicates are merged (keeping the most complete record), and invalid records are flagged or quarantined. You control the rules for what happens to each category.",
      },
      {
        question: "How often does the cleanup run?",
        answer:
          "Most teams run full cleanup weekly and real-time validation on every new record. The schedule is fully configurable.",
      },
    ],
    intro:
      "CRM data cleanup automation deduplicates records, standardizes formatting, enriches missing fields, and flags invalid contact information on a recurring schedule. Sales teams with clean CRM data see 15-25% higher email deliverability and spend 5-8 fewer hours per week on manual data maintenance.",
  },
  {
    id: "support-ticket-routing",
    title: "Support Ticket Routing Automation",
    categorySlug: "customer-support",
    categoryLabel: "Customer Support",
    problem:
      "Manual ticket routing relies on support agents reading each ticket and assigning it to the right team or specialist. This adds 5-15 minutes of delay per ticket, causes misroutes that require re-assignment, and creates uneven workload distribution across agents.",
    solution:
      "Automated ticket routing analyzes incoming tickets using keyword matching, AI classification, or rule-based logic. It categorizes the issue type, assigns priority, routes to the correct team or agent based on skill and availability, and sends the customer an acknowledgment with expected response time.",
    benefits: [
      "Route tickets to the right agent in under 30 seconds instead of 5-15 minutes",
      "Reduce misrouted tickets by 80% with consistent classification logic",
      "Balance workload across agents automatically based on capacity and skill",
      "Prioritize urgent issues (outages, billing errors) for immediate attention",
      "Send customers instant acknowledgment with accurate response time estimates",
    ],
    tools: ["Make", "n8n", "Zendesk", "Freshdesk", "Intercom", "Slack", "OpenAI API"],
    estimatedSavings: "15-25 hours per week for support teams",
    setupTime: "3-7 days",
    faq: [
      {
        question: "How does the automation classify ticket types?",
        answer:
          "Classification uses a combination of keyword rules, customer metadata (plan, region), and optionally AI analysis via OpenAI or Claude. You define the categories and the automation learns from historical ticket data.",
      },
      {
        question: "Can it handle tickets from multiple channels?",
        answer:
          "Yes. The automation ingests tickets from email, chat, web forms, and social media. All channels feed into the same routing logic.",
      },
      {
        question: "What happens if a ticket cannot be classified?",
        answer:
          "Unclassified tickets are routed to a general triage queue and flagged for manual review. Over time, these cases are used to improve the classification rules.",
      },
    ],
    intro:
      "Support ticket routing automation classifies incoming tickets by type and urgency, assigns them to the right agent based on skill and availability, and acknowledges customers instantly. Support teams using automated routing reduce average response time by 60% and cut misrouted tickets by 80%.",
  },
  {
    id: "reporting-dashboards",
    title: "Automated Reporting and Dashboards",
    categorySlug: "data-analytics",
    categoryLabel: "Data & Analytics",
    problem:
      "Building weekly or monthly reports manually takes 4-8 hours per cycle. Analysts pull data from multiple sources, paste it into spreadsheets, format charts, and email PDFs. By the time reports are delivered, the data is already stale. Mistakes in copy-paste are common and hard to catch.",
    solution:
      "Automated reporting pulls data from your tools (CRM, ad platforms, databases, spreadsheets) on a schedule, transforms and aggregates it, populates dashboards or slide decks, and distributes them via email or Slack. Dashboards refresh automatically so stakeholders always see current numbers.",
    benefits: [
      "Eliminate 4-8 hours per reporting cycle spent on manual data pulling and formatting",
      "Deliver reports on time every time with scheduled automation",
      "Ensure data accuracy by removing manual copy-paste steps",
      "Give stakeholders real-time access to dashboards instead of stale PDFs",
      "Consolidate data from 5-10 sources into a single view",
    ],
    tools: ["Make", "n8n", "Google Sheets", "Looker Studio", "Airtable", "Slack", "BigQuery"],
    estimatedSavings: "4-8 hours per reporting cycle",
    setupTime: "5-10 days",
    faq: [
      {
        question: "What data sources can be connected?",
        answer:
          "Most SaaS tools with APIs can be connected: CRMs (HubSpot, Salesforce), ad platforms (Google Ads, Meta Ads), databases (PostgreSQL, BigQuery), spreadsheets, and payment systems (Stripe).",
      },
      {
        question: "Can reports be customized for different audiences?",
        answer:
          "Yes. The automation can generate different views for executives, team leads, and individual contributors. Each audience sees the metrics relevant to their role.",
      },
      {
        question: "How often do dashboards update?",
        answer:
          "Update frequency is configurable: real-time, hourly, daily, or weekly. Most teams use daily refreshes for operational dashboards and weekly for executive summaries.",
      },
    ],
    intro:
      "Automated reporting pulls data from your CRM, ad platforms, databases, and spreadsheets on a schedule, transforms it, and delivers formatted dashboards or reports via email and Slack. Teams using automated reporting save 4-8 hours per cycle and always work with current data.",
  },
  {
    id: "appointment-scheduling",
    title: "Appointment Scheduling Automation",
    categorySlug: "sales-crm",
    categoryLabel: "Sales & CRM",
    problem:
      "Scheduling meetings involves 3-5 back-and-forth emails per appointment. Admin staff spend 5-10 hours per week coordinating calendars, handling reschedules, and sending reminders. No-show rates are high because reminders are inconsistent or sent too late.",
    solution:
      "Automated scheduling lets prospects and clients book directly into available calendar slots. The system sends confirmation emails, calendar invites, SMS/email reminders at configured intervals, handles reschedules, and updates your CRM with meeting details automatically.",
    benefits: [
      "Eliminate scheduling back-and-forth entirely with self-service booking",
      "Reduce no-show rates by 30-50% with automated multi-channel reminders",
      "Sync booked appointments to your CRM and team calendars automatically",
      "Handle timezone detection and conversion without manual effort",
      "Free 5-10 hours per week of admin time spent on scheduling coordination",
    ],
    tools: ["Calendly", "Cal.com", "Make", "Google Calendar", "HubSpot", "Slack", "Twilio"],
    estimatedSavings: "5-10 hours per week",
    setupTime: "2-4 days",
    faq: [
      {
        question: "Can it handle different meeting types?",
        answer:
          "Yes. You can configure different booking pages for discovery calls, demos, onboarding sessions, and support calls, each with different durations, attendees, and availability windows.",
      },
      {
        question: "How are reminders sent?",
        answer:
          "Reminders go out via email and optionally SMS at intervals you define, typically 24 hours and 1 hour before the meeting. Custom reminder messages can include preparation instructions or agendas.",
      },
      {
        question: "Does it handle group scheduling?",
        answer:
          "Yes. Round-robin assignment distributes meetings across team members based on availability. Collective scheduling finds times when multiple team members are free.",
      },
    ],
    intro:
      "Appointment scheduling automation enables self-service booking, sends multi-channel reminders, handles reschedules, and syncs all meeting data to your CRM and calendars. Businesses using automated scheduling eliminate back-and-forth emails and reduce no-show rates by 30-50%.",
  },
  {
    id: "inventory-alerts",
    title: "Inventory Alert Automation",
    categorySlug: "finance-operations",
    categoryLabel: "Finance & Operations",
    problem:
      "Stockouts cost businesses 4-8% of annual revenue. Manual inventory checks are infrequent and reactive. By the time someone notices low stock, it is often too late to reorder without expedited shipping costs. Overstock ties up capital in slow-moving products.",
    solution:
      "Automated inventory alerts monitor stock levels in real time and trigger notifications when quantities drop below configurable thresholds. The system can generate purchase orders automatically, forecast demand based on historical sales velocity, and alert teams to overstock situations.",
    benefits: [
      "Prevent stockouts with real-time low-stock alerts before critical thresholds are hit",
      "Reduce overstock by flagging slow-moving inventory for markdowns or returns",
      "Generate purchase orders automatically when reorder points are reached",
      "Track stock levels across multiple warehouses or locations in one view",
      "Save on expedited shipping by reordering before emergency levels",
    ],
    tools: ["Make", "n8n", "Shopify", "Airtable", "Google Sheets", "Slack", "QuickBooks"],
    estimatedSavings: "3-5 hours per week, 4-8% revenue protected from stockouts",
    setupTime: "3-7 days",
    faq: [
      {
        question: "What inventory systems does this connect to?",
        answer:
          "Common integrations include Shopify, WooCommerce, Amazon Seller Central, NetSuite, and TradeGecko. Any system with an API or CSV export can be connected.",
      },
      {
        question: "Can thresholds be set per product?",
        answer:
          "Yes. Each product or SKU can have its own reorder point, safety stock level, and alert threshold. These values can be calculated automatically based on historical sales velocity.",
      },
      {
        question: "Does it support multiple warehouses?",
        answer:
          "Yes. The automation can track stock across multiple locations and generate location-specific alerts and reorder recommendations.",
      },
    ],
    intro:
      "Inventory alert automation monitors stock levels in real time, sends notifications when quantities hit reorder points, and can generate purchase orders automatically. Businesses using inventory alerts prevent stockouts that cost 4-8% of annual revenue and reduce overstock by flagging slow-moving items.",
  },
  {
    id: "review-collection",
    title: "Review Collection Automation",
    categorySlug: "marketing-automation",
    categoryLabel: "Marketing Automation",
    problem:
      "Most satisfied customers never leave reviews unless asked. Manually emailing review requests is time-consuming and inconsistent. Negative reviews go unaddressed because the team lacks a monitoring system. Businesses miss out on social proof that drives 10-15% of purchase decisions.",
    solution:
      "Automated review collection sends personalized review requests at the right moment (post-purchase, post-delivery, or after a support resolution). It monitors new reviews across Google, G2, Trustpilot, and other platforms, alerts the team to negative reviews for fast response, and aggregates review data for reporting.",
    benefits: [
      "Increase review volume by 3-5x with timely, automated requests",
      "Send requests at the optimal moment, when customer satisfaction is highest",
      "Monitor reviews across all platforms in a single dashboard",
      "Get instant alerts on negative reviews so the team can respond within hours",
      "Track review metrics (volume, average rating, response rate) over time",
    ],
    tools: ["Make", "n8n", "Trustpilot", "Google Business", "HubSpot", "Slack", "Airtable"],
    estimatedSavings: "3-5 hours per week, 3-5x increase in review volume",
    setupTime: "3-5 days",
    faq: [
      {
        question: "When is the best time to ask for a review?",
        answer:
          "The best timing depends on your business. For e-commerce, 3-7 days after delivery works well. For services, 1-2 days after project completion. The automation lets you test different intervals.",
      },
      {
        question: "Can it filter out unhappy customers?",
        answer:
          "Yes. A common pattern is to send a satisfaction check first. Customers who rate their experience highly are directed to leave a public review. Those who rate lower are routed to an internal feedback form.",
      },
      {
        question: "Which review platforms are supported?",
        answer:
          "Google Business, Trustpilot, G2, Capterra, Yelp, and App Store/Play Store are commonly supported. Platform availability depends on API access.",
      },
    ],
    intro:
      "Review collection automation sends personalized review requests at the optimal moment after purchase or service delivery, monitors reviews across platforms, and alerts your team to negative feedback. Businesses using automated review collection see a 3-5x increase in review volume and faster response to negative reviews.",
  },
  {
    id: "contract-generation",
    title: "Contract Generation Automation",
    categorySlug: "finance-operations",
    categoryLabel: "Finance & Operations",
    problem:
      "Creating contracts manually takes 30-60 minutes per document. Legal and sales teams copy templates, fill in client details, adjust terms, route for internal approval, and then wait for signatures. Version control issues cause teams to send outdated terms. Deals stall while contracts sit in someone's inbox.",
    solution:
      "Automated contract generation pulls client and deal data from your CRM, populates a contract template with the correct terms and pricing, routes it through internal approval chains, and sends it for e-signature. Signed contracts are automatically filed and linked back to the CRM record.",
    benefits: [
      "Generate contracts in under 2 minutes instead of 30-60 minutes",
      "Eliminate version control errors by always pulling from the latest template",
      "Speed up deal close by routing approvals and signatures in parallel",
      "Maintain a centralized, searchable archive of all executed contracts",
      "Track contract status in real time, from draft to fully executed",
    ],
    tools: ["Make", "PandaDoc", "DocuSign", "HubSpot", "Salesforce", "Google Docs", "Slack"],
    estimatedSavings: "5-10 hours per week for sales/legal teams",
    setupTime: "5-10 days",
    faq: [
      {
        question: "Can it handle different contract types?",
        answer:
          "Yes. You can create templates for NDAs, MSAs, SOWs, order forms, and any other document type. The automation selects the correct template based on deal type or product.",
      },
      {
        question: "How are custom terms handled?",
        answer:
          "Standard terms auto-populate. Non-standard terms trigger an approval workflow that routes the contract to legal for review before it goes out for signature.",
      },
      {
        question: "Where are signed contracts stored?",
        answer:
          "Signed contracts are automatically filed in your document management system (Google Drive, SharePoint, etc.) and linked to the corresponding CRM record and deal.",
      },
    ],
    intro:
      "Contract generation automation pulls deal data from your CRM, populates templates with correct terms and pricing, routes approvals, and sends documents for e-signature. Sales and legal teams using this automation reduce contract creation time from 30-60 minutes to under 2 minutes per document.",
  },
  {
    id: "seo-monitoring",
    title: "SEO Monitoring Automation",
    categorySlug: "marketing-automation",
    categoryLabel: "Marketing Automation",
    problem:
      "SEO teams check rankings, backlinks, and site health manually across multiple tools. This takes 3-6 hours per week and still misses issues until the next check. Ranking drops, broken pages, and lost backlinks go unnoticed for days, costing organic traffic and revenue.",
    solution:
      "Automated SEO monitoring tracks keyword rankings, crawl errors, backlink changes, and Core Web Vitals on a schedule. It sends alerts when rankings drop significantly, new backlinks appear or disappear, pages return errors, or page speed degrades. All data is consolidated into a single dashboard.",
    benefits: [
      "Detect ranking drops within hours instead of days or weeks",
      "Monitor hundreds of keywords across multiple search engines automatically",
      "Get instant alerts on crawl errors, broken pages, and indexing issues",
      "Track backlink gains and losses without manual checking",
      "Consolidate data from Ahrefs, Search Console, and PageSpeed into one view",
    ],
    tools: ["Make", "n8n", "Ahrefs", "Google Search Console", "Screaming Frog", "Slack", "Google Sheets"],
    estimatedSavings: "3-6 hours per week",
    setupTime: "3-5 days",
    faq: [
      {
        question: "How often are rankings checked?",
        answer:
          "Check frequency is configurable. Most teams use daily checks for priority keywords and weekly checks for the broader keyword set. Alerts trigger only on significant movements (e.g., drops of 5+ positions).",
      },
      {
        question: "Can it monitor competitor rankings?",
        answer:
          "Yes. The automation can track competitor rankings for your target keywords and alert you when competitors gain or lose positions relative to your site.",
      },
      {
        question: "Does it generate reports automatically?",
        answer:
          "Yes. Weekly or monthly SEO reports are generated and delivered via email or Slack. Reports include ranking changes, traffic trends, backlink activity, and technical issues.",
      },
    ],
    intro:
      "SEO monitoring automation tracks keyword rankings, crawl errors, backlink changes, and page speed on a recurring schedule and sends alerts when issues are detected. SEO teams using automated monitoring detect ranking drops within hours and save 3-6 hours per week on manual checks.",
  },
  {
    id: "sales-pipeline",
    title: "Sales Pipeline Automation",
    categorySlug: "sales-crm",
    categoryLabel: "Sales & CRM",
    problem:
      "Sales reps spend 20-30% of their time on CRM updates, deal stage tracking, and follow-up reminders instead of selling. Deals stagnate in pipeline stages because no one notices them. Forecasts are unreliable because reps update deal stages inconsistently.",
    solution:
      "Automated pipeline management moves deals through stages based on defined triggers (email replied, meeting booked, proposal sent), sends reps reminders for stale deals, updates deal fields automatically from email and calendar data, and generates accurate forecasts from real activity data.",
    benefits: [
      "Reclaim 20-30% of rep time currently spent on manual CRM updates",
      "Prevent deals from stalling with automatic reminders on inactive opportunities",
      "Move deals through stages automatically based on real activities, not manual updates",
      "Improve forecast accuracy by basing projections on actual pipeline movement",
      "Surface at-risk deals before they are lost with stagnation alerts",
    ],
    tools: ["Make", "n8n", "HubSpot", "Salesforce", "Pipedrive", "Slack", "Google Calendar"],
    estimatedSavings: "10-15 hours per week across the sales team",
    setupTime: "5-10 days",
    faq: [
      {
        question: "What triggers deal stage advancement?",
        answer:
          "Common triggers include email replies, meeting completions, proposal views, contract signatures, and payment events. Each trigger is configurable per pipeline stage.",
      },
      {
        question: "How are stale deals handled?",
        answer:
          "Deals that sit in a stage beyond a configurable time threshold trigger notifications to the assigned rep and optionally their manager. Persistent stagnation can trigger automatic stage regression or deal archival.",
      },
      {
        question: "Does it work with custom pipeline stages?",
        answer:
          "Yes. The automation maps to whatever pipeline stages you have configured in your CRM. Stage names, triggers, and thresholds are all customizable.",
      },
    ],
    intro:
      "Sales pipeline automation moves deals through CRM stages based on real activities, sends stale deal alerts, updates records from email and calendar data, and generates forecasts. Sales teams using pipeline automation reclaim 20-30% of rep time and improve forecast accuracy by reducing manual CRM entry.",
  },
];
