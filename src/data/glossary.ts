export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  explanation: string;
  relatedTerms: string[];
  categorySlug?: string;
  categoryLabel?: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: "workflow-automation",
    term: "Workflow Automation",
    definition:
      "Workflow automation uses software to execute a sequence of tasks automatically based on predefined rules and triggers. It replaces manual handoffs between people and systems.",
    explanation:
      "A workflow is any repeatable sequence of steps that moves work from start to finish. Workflow automation maps those steps into a tool like Make, n8n, or Zapier so they run without human intervention. Triggers can be time-based (e.g. every Monday at 9 AM) or event-based (e.g. a new form submission). Common examples include automatically routing support tickets, syncing CRM records, or generating invoices after a deal closes. The result is faster execution, fewer errors, and freed-up staff time.",
    relatedTerms: [
      "business-process-automation",
      "no-code",
      "api-integration",
      "zapier",
    ],
    categorySlug: "other",
    categoryLabel: "Other",
  },
  {
    id: "business-process-automation",
    term: "Business Process Automation",
    definition:
      "Business process automation (BPA) applies technology to entire end-to-end business processes, not just individual tasks. It covers everything from document approvals to multi-department handoffs.",
    explanation:
      "BPA goes further than single-task automation by orchestrating cross-functional processes that span teams and tools. For example, an employee onboarding process might involve HR creating an account, IT provisioning software access, and finance adding the person to payroll, all triggered from one form. BPA platforms map these dependencies, handle exceptions, and provide audit trails. Successful BPA projects typically start with process mapping to identify bottlenecks before building any automations.",
    relatedTerms: [
      "workflow-automation",
      "robotic-process-automation",
      "etl",
      "sla",
    ],
  },
  {
    id: "ai-automation",
    term: "AI Automation",
    definition:
      "AI automation combines artificial intelligence models with workflow automation to handle tasks that require judgment, language understanding, or pattern recognition. It extends what traditional rule-based automation can do.",
    explanation:
      "Traditional automation follows fixed if/then rules. AI automation adds a layer of intelligence, allowing systems to classify emails, summarize documents, score leads, or extract data from unstructured sources. Large language models (like GPT-4 or Claude) are commonly integrated into automation pipelines via API calls. For example, an AI automation might read inbound support emails, categorize them by urgency, draft a response, and route the ticket to the right team. The AI handles the interpretation while the automation handles the routing and execution.",
    relatedTerms: [
      "ai-agent",
      "chatbot",
      "lead-scoring",
      "data-enrichment",
    ],
  },
  {
    id: "robotic-process-automation",
    term: "Robotic Process Automation",
    definition:
      "Robotic Process Automation (RPA) uses software bots to mimic human actions inside applications, such as clicking buttons, copying data between screens, and filling forms. It is most useful for automating legacy systems that lack APIs.",
    explanation:
      "RPA bots interact with user interfaces the same way a person would. This makes RPA valuable for automating processes in older enterprise software that was not built for system-to-system integration. Common RPA platforms include UiPath, Automation Anywhere, and Blue Prism. RPA works best for high-volume, rule-based tasks like invoice processing or data entry. However, RPA bots are brittle - they break when the UI changes. Many organizations are migrating from RPA to API-based automation where possible for better reliability.",
    relatedTerms: [
      "business-process-automation",
      "workflow-automation",
      "api-integration",
    ],
  },
  {
    id: "n8n",
    term: "n8n",
    definition:
      "n8n is an open-source workflow automation platform that lets users connect apps and build automations using a visual node-based editor. It can be self-hosted or used as a cloud service.",
    explanation:
      "n8n provides a drag-and-drop canvas where each node represents an action (e.g. fetch data from an API, transform JSON, send an email). Users connect nodes to build workflows that run on triggers or schedules. Because n8n is open-source and self-hostable, it appeals to teams that need full control over their data and infrastructure. It supports 400+ integrations and allows custom code nodes in JavaScript or Python for advanced logic. n8n is commonly used by automation agencies and freelancers building solutions for clients.",
    relatedTerms: ["make-com", "zapier", "workflow-automation", "api-integration"],
    categorySlug: "other",
    categoryLabel: "Other",
  },
  {
    id: "make-com",
    term: "Make (Make.com)",
    definition:
      "Make (formerly Integromat) is a visual automation platform that connects apps and services through customizable scenarios. It is known for its granular control over data transformations and branching logic.",
    explanation:
      "Make uses a scenario-based model where users design automations as flowcharts. Each module in a scenario performs one operation - watching for new data, transforming it, or sending it to another app. Make supports advanced features like iterators, aggregators, error handlers, and routers that let users build complex multi-branch automations. It offers 1,500+ app integrations and is popular among automation consultants because of its flexibility. Make charges based on the number of operations (steps) executed per month.",
    relatedTerms: ["n8n", "zapier", "workflow-automation", "webhook"],
    categorySlug: "other",
    categoryLabel: "Other",
  },
  {
    id: "zapier",
    term: "Zapier",
    definition:
      "Zapier is a cloud-based automation platform that connects over 6,000 apps using simple trigger-action workflows called Zaps. It is designed for non-technical users who need quick integrations.",
    explanation:
      "Zapier popularized the concept of connecting apps without code. Each Zap consists of a trigger (an event in one app) and one or more actions (operations in other apps). For example, a Zap might watch for new Typeform submissions and automatically create a HubSpot contact and send a Slack notification. Zapier offers paths (conditional logic), filters, formatters, and multi-step Zaps for more complex workflows. It is the most widely adopted automation tool for small businesses but can become expensive at high volumes due to per-task pricing.",
    relatedTerms: ["make-com", "n8n", "workflow-automation", "no-code"],
    categorySlug: "other",
    categoryLabel: "Other",
  },
  {
    id: "escrow-payment",
    term: "Escrow Payment",
    definition:
      "An escrow payment is a financial arrangement where a trusted third party holds funds until both the buyer and seller fulfill their agreed obligations. It protects both sides of a transaction.",
    explanation:
      "In the context of automation marketplaces and freelance platforms, escrow means the client deposits funds before work begins, but the expert does not receive the money until the deliverables are approved. If there is a dispute, the platform mediates and decides how to distribute the held funds. LogicLot uses escrow for all project payments - funds are held securely and released to the expert only after the client approves the work or after a cooling-off period following delivery.",
    relatedTerms: ["milestone-payment", "discovery-scan", "custom-project"],
  },
  {
    id: "milestone-payment",
    term: "Milestone Payment",
    definition:
      "A milestone payment structure breaks a project into defined phases, with a portion of the total budget released after each phase is completed and approved. It reduces risk for both buyers and sellers.",
    explanation:
      "Instead of paying everything upfront or after delivery, milestone payments create checkpoints. A typical 3-milestone project might release 30% after requirements are finalized, 40% after the core build is delivered, and 30% after testing and deployment. This gives the buyer visibility into progress and gives the expert predictable cash flow. On LogicLot, experts define milestones when scoping a project, and funds for each milestone are held in escrow until the client approves that phase.",
    relatedTerms: ["escrow-payment", "custom-project", "sla"],
  },
  {
    id: "discovery-scan",
    term: "Discovery Scan",
    definition:
      "A Discovery Scan is a structured assessment where a business describes its current workflows and pain points, and a vetted automation expert analyzes the situation and recommends specific automation opportunities.",
    explanation:
      "On LogicLot, a Discovery Scan is the entry point for businesses that know they want to automate but are not sure where to start. The business fills out a brief describing their processes, tools, and goals. Qualified experts then review the brief and submit proposals with specific recommendations. The Discovery Scan is designed to answer the question: where should we automate first, and what ROI can we expect? It bridges the gap between knowing automation exists and knowing which automations to build.",
    relatedTerms: [
      "custom-project",
      "roi",
      "business-process-automation",
      "escrow-payment",
    ],
  },
  {
    id: "custom-project",
    term: "Custom Project",
    definition:
      "A Custom Project on LogicLot is a defined automation build where a business posts detailed requirements and experts submit proposals with timelines, pricing, and milestone breakdowns.",
    explanation:
      "Custom Projects are for businesses that already know what they need automated. The business creates a detailed project brief specifying the tools involved, the desired outcome, and their budget range. Experts on the platform then submit competitive proposals. Once a proposal is accepted, the project moves into milestone-based execution with escrow-protected payments. Custom Projects can range from simple single-tool integrations to complex multi-system automation pipelines.",
    relatedTerms: [
      "discovery-scan",
      "milestone-payment",
      "escrow-payment",
      "workflow-automation",
    ],
  },
  {
    id: "crm-automation",
    term: "CRM Automation",
    definition:
      "CRM automation uses software to automate repetitive tasks inside customer relationship management systems, such as lead assignment, follow-up emails, pipeline updates, and activity logging.",
    explanation:
      "Sales teams spend significant time on data entry and administrative tasks inside their CRM. CRM automation eliminates this by automatically creating contacts from form submissions, assigning leads based on territory or score, sending follow-up sequences, and updating deal stages based on activity. Popular CRMs like HubSpot and Salesforce have built-in automation features, but external tools like Make or n8n can extend CRM automation across other systems in the tech stack.",
    relatedTerms: ["sales-automation", "lead-scoring", "marketing-automation"],
    categorySlug: "sales-crm",
    categoryLabel: "Sales & CRM",
  },
  {
    id: "marketing-automation",
    term: "Marketing Automation",
    definition:
      "Marketing automation uses software to manage and automate marketing tasks like email campaigns, social media posting, lead nurturing, and audience segmentation at scale.",
    explanation:
      "Marketing automation platforms (like Mailchimp, ActiveCampaign, or HubSpot Marketing Hub) let teams set up automated email sequences, score leads based on behavior, segment audiences dynamically, and trigger campaigns based on user actions. Beyond email, marketing automation can include automated social media scheduling, ad retargeting pixel management, and multi-channel campaign orchestration. The goal is to deliver the right message to the right person at the right time without manual effort.",
    relatedTerms: ["crm-automation", "lead-scoring", "sales-automation"],
    categorySlug: "marketing-automation",
    categoryLabel: "Marketing Automation",
  },
  {
    id: "sales-automation",
    term: "Sales Automation",
    definition:
      "Sales automation uses technology to automate parts of the sales process, including outbound prospecting, lead qualification, meeting scheduling, proposal generation, and pipeline management.",
    explanation:
      "Sales reps often spend more time on admin than on selling. Sales automation targets this problem by automating outreach sequences, enriching lead data from multiple sources, scheduling meetings via calendar integrations, and generating proposals from templates. Advanced sales automation uses AI to prioritize leads, suggest next actions, and personalize outreach at scale. The result is more conversations with fewer manual steps.",
    relatedTerms: [
      "crm-automation",
      "lead-scoring",
      "data-enrichment",
      "marketing-automation",
    ],
    categorySlug: "sales-crm",
    categoryLabel: "Sales & CRM",
  },
  {
    id: "api-integration",
    term: "API Integration",
    definition:
      "An API integration connects two or more software applications by using their application programming interfaces (APIs) to exchange data and trigger actions between them automatically.",
    explanation:
      "APIs define how software systems communicate. An API integration uses these interfaces to create a persistent, automated data flow between apps. For example, integrating a payment processor API with an accounting tool ensures every transaction is automatically recorded. API integrations can be built with code or through no-code platforms like Make and n8n, which provide pre-built connectors. REST APIs and webhooks are the most common patterns. A well-built API integration handles authentication, rate limiting, error retries, and data mapping.",
    relatedTerms: ["webhook", "workflow-automation", "no-code", "etl"],
  },
  {
    id: "webhook",
    term: "Webhook",
    definition:
      "A webhook is a mechanism where one application sends real-time data to another application via an HTTP POST request when a specific event occurs. It is a push-based alternative to polling an API.",
    explanation:
      "Instead of repeatedly checking an API for new data (polling), webhooks push data to a URL you specify as soon as an event happens. For example, Stripe can send a webhook to your server every time a payment succeeds. The receiving application then processes that data and takes action. Webhooks are fundamental to modern automation because they enable instant, event-driven workflows. Most automation platforms (Make, n8n, Zapier) can both send and receive webhooks, making them a universal glue between systems.",
    relatedTerms: ["api-integration", "workflow-automation", "make-com", "n8n"],
  },
  {
    id: "no-code",
    term: "No-Code",
    definition:
      "No-code refers to software development platforms that allow users to build applications, automations, and workflows using visual interfaces instead of writing programming code.",
    explanation:
      "No-code platforms democratize software creation by replacing code with drag-and-drop builders, visual logic flows, and pre-built components. In the automation space, tools like Zapier, Make, and Airtable let non-developers build integrations and workflows that previously required a programmer. No-code does not mean no complexity - building reliable, production-grade automations still requires understanding data structures, error handling, and system design. The term is often used alongside low-code, which adds some coding capability for more advanced use cases.",
    relatedTerms: ["low-code", "zapier", "make-com", "workflow-automation"],
  },
  {
    id: "low-code",
    term: "Low-Code",
    definition:
      "Low-code platforms combine visual development tools with the ability to add custom code when needed. They bridge the gap between fully no-code tools and traditional software development.",
    explanation:
      "Low-code platforms provide visual builders for common patterns but allow developers to drop into code for edge cases, custom logic, or complex data transformations. n8n is a good example in the automation space - it offers a visual workflow builder but also supports custom JavaScript and Python nodes. Low-code is popular with technical teams that want to move fast on standard integrations while retaining the flexibility to handle unusual requirements. Retool, Appsmith, and Budibase are examples in the app-building space.",
    relatedTerms: ["no-code", "n8n", "api-integration", "workflow-automation"],
  },
  {
    id: "chatbot",
    term: "Chatbot",
    definition:
      "A chatbot is a software application that simulates conversation with users through text or voice, typically to answer questions, qualify leads, or handle support requests automatically.",
    explanation:
      "Modern chatbots range from simple rule-based bots that follow decision trees to AI-powered assistants that use large language models to understand and generate natural language. In a business context, chatbots commonly handle first-line customer support, qualify inbound leads by asking screening questions, schedule appointments, and provide instant answers from a knowledge base. Chatbots can be deployed on websites, WhatsApp, Slack, or other messaging platforms. The most effective chatbots hand off to a human agent when the conversation exceeds their capabilities.",
    relatedTerms: ["ai-agent", "ai-automation", "crm-automation"],
    categorySlug: "customer-support",
    categoryLabel: "Customer Support",
  },
  {
    id: "ai-agent",
    term: "AI Agent",
    definition:
      "An AI agent is an autonomous software system that uses artificial intelligence to perceive its environment, make decisions, and take actions to achieve a defined goal without continuous human oversight.",
    explanation:
      "Unlike a simple chatbot that responds to prompts, an AI agent can plan multi-step actions, use tools (APIs, databases, browsers), and adjust its approach based on results. For example, an AI sales agent might research a prospect on LinkedIn, draft a personalized email, check the CRM for past interactions, and schedule a follow-up, all autonomously. AI agents are built using large language models combined with tool-calling capabilities and memory. They represent the next evolution of automation, moving from fixed workflows to adaptive, goal-driven systems.",
    relatedTerms: ["ai-automation", "chatbot", "lead-scoring"],
  },
  {
    id: "lead-scoring",
    term: "Lead Scoring",
    definition:
      "Lead scoring assigns numerical values to sales leads based on their attributes and behaviors to rank them by likelihood to convert. It helps sales teams prioritize who to contact first.",
    explanation:
      "A lead scoring model typically combines demographic data (company size, industry, job title) with behavioral signals (website visits, email opens, content downloads, pricing page views). Each signal adds or subtracts points. Leads above a threshold are considered sales-qualified and routed to a rep. AI-powered lead scoring uses machine learning to find patterns in historical conversion data, often outperforming manual scoring rules. Lead scoring is commonly implemented inside CRMs like HubSpot or Salesforce, or through external automation tools that enrich and score leads in real time.",
    relatedTerms: [
      "crm-automation",
      "sales-automation",
      "data-enrichment",
      "ai-automation",
    ],
    categorySlug: "sales-crm",
    categoryLabel: "Sales & CRM",
  },
  {
    id: "data-enrichment",
    term: "Data Enrichment",
    definition:
      "Data enrichment is the process of enhancing existing records with additional information from external sources, such as appending company size, industry, email addresses, or social profiles to a CRM contact.",
    explanation:
      "Raw lead data is often incomplete. A form submission might capture only a name and email. Data enrichment tools (like Clearbit, Apollo, or ZoomInfo) automatically look up that email and append the person's job title, company, revenue, tech stack, LinkedIn profile, and more. This enriched data feeds into lead scoring, segmentation, and personalization. Automated data enrichment workflows typically trigger when a new contact is created and run enrichment API calls in sequence, mapping results back into the CRM or database.",
    relatedTerms: ["lead-scoring", "crm-automation", "etl", "api-integration"],
    categorySlug: "data-analytics",
    categoryLabel: "Data & Analytics",
  },
  {
    id: "sla",
    term: "SLA (Service Level Agreement)",
    definition:
      "A Service Level Agreement is a formal commitment between a service provider and a client that defines measurable performance standards, such as response times, uptime guarantees, and resolution deadlines.",
    explanation:
      "SLAs set expectations for service quality. In automation, SLAs might specify that a workflow must process data within 5 minutes of receiving it, or that an automated support system must respond within 30 seconds. SLAs typically include what happens when targets are missed (penalties, credits, escalation procedures). For automation projects on marketplaces, SLAs can cover implementation timelines, revision rounds, and post-delivery support periods. Clear SLAs protect both the buyer and the expert.",
    relatedTerms: [
      "business-process-automation",
      "milestone-payment",
      "custom-project",
    ],
  },
  {
    id: "roi",
    term: "ROI (Return on Investment)",
    definition:
      "ROI measures the financial return of an investment relative to its cost, expressed as a percentage. For automation projects, it compares the cost of building and running the automation against the labor and error costs it eliminates.",
    explanation:
      "Calculating automation ROI involves measuring time saved (hours per week multiplied by hourly labor cost), errors eliminated (cost of manual mistakes), and revenue gained (faster lead response, more capacity). A typical formula is: ROI = ((Value of time saved + errors prevented - automation cost) / automation cost) x 100. Many businesses see ROI within 2-3 months on well-scoped automation projects. LogicLot's Discovery Scan helps businesses identify their highest-ROI automation opportunities before committing to a full build.",
    relatedTerms: [
      "discovery-scan",
      "business-process-automation",
      "workflow-automation",
    ],
  },
  {
    id: "etl",
    term: "ETL (Extract, Transform, Load)",
    definition:
      "ETL is a data integration process that extracts data from source systems, transforms it into a consistent format, and loads it into a destination system like a data warehouse or analytics platform.",
    explanation:
      "ETL pipelines are the backbone of data operations. The extract phase pulls raw data from APIs, databases, files, or SaaS tools. The transform phase cleans, normalizes, deduplicates, and restructures that data. The load phase writes the processed data to a target system. Modern ELT (Extract, Load, Transform) reverses the last two steps by loading raw data first and transforming it inside the warehouse using tools like dbt. Automation platforms like n8n and Make can handle ETL for small to mid-scale data flows, while dedicated tools like Fivetran or Airbyte handle larger volumes.",
    relatedTerms: [
      "data-enrichment",
      "api-integration",
      "workflow-automation",
    ],
    categorySlug: "data-analytics",
    categoryLabel: "Data & Analytics",
  },
];
