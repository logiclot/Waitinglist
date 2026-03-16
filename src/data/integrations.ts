export interface Integration {
  id: string;
  name: string;
  description: string;
  automationUseCases: string[];
  categorySlug: string;
  categoryLabel: string;
  intro: string;
}

export const INTEGRATIONS: Integration[] = [
  {
    id: "make-com",
    name: "Make (Make.com)",
    description:
      "Make is a visual automation platform that connects apps and APIs through customizable multi-step scenarios with branching logic and data transformations.",
    automationUseCases: [
      "Sync CRM contacts with email marketing lists in real time",
      "Route inbound support tickets to the right team based on content analysis",
      "Generate weekly PDF reports from Google Sheets data and email them to stakeholders",
      "Automate social media posting schedules across multiple platforms",
      "Process incoming invoices and create matching entries in accounting software",
    ],
    categorySlug: "other",
    categoryLabel: "Other",
    intro:
      "Make is one of the most flexible visual automation platforms available. It lets you build multi-step workflows with conditional logic, error handling, and data transformations. Automation experts on LogicLot use Make to build production-grade integrations for businesses across every industry.",
  },
  {
    id: "n8n",
    name: "n8n",
    description:
      "n8n is an open-source, self-hostable workflow automation platform with a visual node editor and support for custom JavaScript and Python code.",
    automationUseCases: [
      "Build self-hosted data pipelines that keep sensitive information on your infrastructure",
      "Create AI-powered document processing workflows using OpenAI or Claude APIs",
      "Automate DevOps tasks like deployment notifications, monitoring alerts, and log aggregation",
      "Sync inventory levels across e-commerce platforms and warehouse management systems",
      "Run scheduled data enrichment jobs that pull from multiple external APIs",
    ],
    categorySlug: "other",
    categoryLabel: "Other",
    intro:
      "n8n gives teams full control over their automation infrastructure. As an open-source platform, it can be self-hosted for maximum data privacy or used as a cloud service. LogicLot experts build n8n workflows for businesses that need flexibility, custom code integration, and ownership of their automation stack.",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description:
      "HubSpot is a CRM and marketing platform that provides tools for contact management, email marketing, sales pipeline tracking, and customer support ticketing.",
    automationUseCases: [
      "Automatically create and update contacts from web form submissions and chat conversations",
      "Trigger personalized email sequences when deals reach specific pipeline stages",
      "Sync HubSpot deal data with invoicing and accounting tools bidirectionally",
      "Route support tickets to agents based on contact properties and ticket category",
      "Enrich new contacts with company data from external sources like Clearbit or Apollo",
    ],
    categorySlug: "sales-crm",
    categoryLabel: "Sales & CRM",
    intro:
      "HubSpot is one of the most widely used CRM platforms for growing businesses. Automation experts on LogicLot integrate HubSpot with the rest of your tech stack, building workflows that eliminate manual data entry, trigger timely follow-ups, and keep your pipeline data accurate across systems.",
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description:
      "Salesforce is an enterprise CRM platform used for sales, service, marketing, and analytics. It offers extensive customization through custom objects, flows, and a large app ecosystem.",
    automationUseCases: [
      "Sync Salesforce opportunities with project management tools when deals close",
      "Automate lead assignment rules based on territory, deal size, and lead score",
      "Push Salesforce reporting data to BI dashboards in Looker or Power BI",
      "Create automated approval workflows for discount requests and contract changes",
      "Integrate Salesforce CPQ with e-signature tools for faster quote-to-close cycles",
    ],
    categorySlug: "sales-crm",
    categoryLabel: "Sales & CRM",
    intro:
      "Salesforce powers sales operations at companies of every size. LogicLot experts build automations that extend Salesforce beyond its native capabilities, connecting it to your full tech stack and eliminating the manual processes that slow down revenue teams.",
  },
  {
    id: "slack",
    name: "Slack",
    description:
      "Slack is a team messaging platform used for internal communication, project coordination, and workflow notifications. Its API supports bots, interactive messages, and app integrations.",
    automationUseCases: [
      "Send automated alerts to channels when CRM deals close, support tickets escalate, or deployments complete",
      "Build interactive approval workflows where managers approve requests directly in Slack",
      "Create Slack bots that answer common questions from a knowledge base using AI",
      "Aggregate daily metrics from multiple tools into a single morning briefing message",
      "Automate team standup collection and summaries with scheduled bot prompts",
    ],
    categorySlug: "other",
    categoryLabel: "Other",
    intro:
      "Slack is where teams spend their working day, making it a natural hub for automation notifications and approvals. LogicLot experts build Slack integrations that bring critical updates, interactive workflows, and AI-powered bots directly into your team's communication flow.",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description:
      "Google Sheets is a cloud spreadsheet tool used by businesses as a lightweight database, reporting layer, and data collection tool. Its API enables programmatic read/write access.",
    automationUseCases: [
      "Automatically populate sheets with new CRM leads, orders, or support tickets as they arrive",
      "Build automated reporting dashboards that pull live data from multiple SaaS tools",
      "Use a Google Sheet as an input form for triggering automation workflows",
      "Sync inventory or pricing data between sheets and e-commerce platforms",
      "Archive processed records from automation pipelines for audit and compliance",
    ],
    categorySlug: "data-analytics",
    categoryLabel: "Data & Analytics",
    intro:
      "Google Sheets is the most common data tool in small and mid-sized businesses. LogicLot experts connect Sheets to your other systems, turning spreadsheets into live dashboards, automation triggers, and lightweight databases without migrating to more complex infrastructure.",
  },
  {
    id: "airtable",
    name: "Airtable",
    description:
      "Airtable is a cloud database platform that combines the simplicity of spreadsheets with the power of relational databases, custom views, and built-in automations.",
    automationUseCases: [
      "Build content calendars that automatically schedule and publish posts when status changes",
      "Create project tracking bases that sync tasks with Jira, Asana, or Monday.com",
      "Automate client onboarding checklists that notify team members at each stage",
      "Use Airtable as a product catalog backend connected to a website via API",
      "Aggregate form responses into structured bases with automatic deduplication and enrichment",
    ],
    categorySlug: "data-analytics",
    categoryLabel: "Data & Analytics",
    intro:
      "Airtable gives teams a flexible way to organize structured data without building a custom database. LogicLot experts automate Airtable workflows, connecting your bases to external systems and building triggers that keep your processes moving without manual intervention.",
  },
  {
    id: "notion",
    name: "Notion",
    description:
      "Notion is an all-in-one workspace for notes, docs, project management, and databases. Its API allows external tools to read and write pages and database records.",
    automationUseCases: [
      "Automatically create Notion pages from meeting transcripts or form submissions",
      "Sync project tasks between Notion databases and developer tools like GitHub or Jira",
      "Build automated knowledge bases that update when documentation changes in other systems",
      "Generate weekly summary pages from data pulled across CRM, support, and analytics tools",
      "Create client portals in Notion that auto-update with project status and deliverables",
    ],
    categorySlug: "other",
    categoryLabel: "Other",
    intro:
      "Notion has become the operating system for many teams, housing docs, projects, and knowledge bases in one place. LogicLot experts build automations that connect Notion to your external tools, automatically populating databases and keeping information synchronized across platforms.",
  },
  {
    id: "openai",
    name: "OpenAI (GPT)",
    description:
      "OpenAI provides large language model APIs (GPT-4, GPT-4o) for text generation, summarization, classification, code generation, and image understanding.",
    automationUseCases: [
      "Classify and route inbound emails or support tickets based on content analysis",
      "Generate first-draft marketing copy, product descriptions, or social media posts",
      "Summarize long documents, meeting transcripts, or research papers automatically",
      "Extract structured data (names, dates, amounts) from unstructured PDFs and emails",
      "Build AI-powered Q&A systems that answer questions from your company knowledge base",
    ],
    categorySlug: "content-creation",
    categoryLabel: "Content Creation",
    intro:
      "OpenAI's GPT models power the intelligence layer in modern automation workflows. LogicLot experts integrate OpenAI APIs into business processes, adding language understanding, content generation, and data extraction capabilities to workflows built on Make, n8n, and other platforms.",
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    description:
      "Anthropic builds Claude, a large language model designed for safety and helpfulness. Claude excels at long-document analysis, careful reasoning, and structured output generation.",
    automationUseCases: [
      "Analyze lengthy contracts and legal documents to extract key terms and flag risks",
      "Process and summarize customer feedback from multiple channels into actionable themes",
      "Generate detailed, well-structured reports from raw data and notes",
      "Build research assistants that read multiple sources and produce synthesis documents",
      "Create automated content review workflows that check for accuracy and brand consistency",
    ],
    categorySlug: "content-creation",
    categoryLabel: "Content Creation",
    intro:
      "Claude by Anthropic handles complex reasoning and long-document tasks that other models struggle with. LogicLot experts integrate Claude into automation pipelines for document analysis, content generation, and decision support, particularly in workflows that require careful, nuanced processing.",
  },
  {
    id: "zapier",
    name: "Zapier",
    description:
      "Zapier is a no-code automation platform connecting 6,000+ apps through trigger-action workflows called Zaps. It is the most widely adopted tool for simple app-to-app integrations.",
    automationUseCases: [
      "Connect form tools (Typeform, Google Forms) to CRM, email, and project management apps",
      "Automate lead capture from multiple sources into a single pipeline with deduplication",
      "Send Slack or email notifications when key events happen across your tool stack",
      "Create multi-step workflows that format, filter, and route data between apps",
      "Sync calendar events with CRM activity logs and follow-up task creation",
    ],
    categorySlug: "other",
    categoryLabel: "Other",
    intro:
      "Zapier is the fastest way to connect apps without code, with support for over 6,000 integrations. LogicLot experts use Zapier for rapid integration projects and combine it with more advanced tools when workflows require complex logic or high-volume processing.",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description:
      "Mailchimp is an email marketing platform for managing subscriber lists, designing campaigns, building automated email sequences, and tracking engagement analytics.",
    automationUseCases: [
      "Automatically add new CRM contacts to targeted Mailchimp audiences based on segment rules",
      "Trigger drip email sequences when contacts take specific actions on your website",
      "Sync unsubscribes and bounces back to your CRM to keep contact data clean",
      "Generate and schedule campaigns from content stored in a CMS or Airtable base",
      "Build post-purchase email flows that request reviews, offer support, or cross-sell",
    ],
    categorySlug: "marketing-automation",
    categoryLabel: "Marketing Automation",
    intro:
      "Mailchimp handles email marketing for millions of businesses. LogicLot experts automate the data flows around Mailchimp, ensuring subscriber lists stay synchronized with your CRM, campaigns trigger at the right moments, and engagement data feeds back into your sales and support processes.",
  },
  {
    id: "stripe",
    name: "Stripe",
    description:
      "Stripe is a payment processing platform that handles online transactions, subscriptions, invoicing, and financial reporting through a developer-friendly API.",
    automationUseCases: [
      "Automatically create invoices and receipts in accounting software when Stripe payments succeed",
      "Sync subscription lifecycle events (created, upgraded, cancelled) with CRM deal stages",
      "Send dunning emails and Slack alerts when subscription payments fail",
      "Generate monthly revenue reports by pulling Stripe data into Google Sheets or a BI tool",
      "Automate customer provisioning and access control based on Stripe subscription status",
    ],
    categorySlug: "finance-operations",
    categoryLabel: "Finance & Operations",
    intro:
      "Stripe processes payments for businesses of every size. LogicLot experts build automations that connect Stripe events to the rest of your operations, keeping your accounting, CRM, access control, and reporting systems in sync with every transaction.",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description:
      "Google Analytics tracks website and app traffic, user behavior, conversions, and attribution. GA4 provides event-based tracking and BigQuery integration for advanced analysis.",
    automationUseCases: [
      "Export GA4 event data to a data warehouse on a scheduled basis for custom reporting",
      "Trigger Slack alerts when traffic drops below a threshold or conversion rates spike",
      "Sync conversion data with ad platforms (Google Ads, Meta) for automated bid optimization",
      "Build automated weekly marketing dashboards that combine GA data with CRM metrics",
      "Create audience segments in GA4 and push them to advertising platforms automatically",
    ],
    categorySlug: "data-analytics",
    categoryLabel: "Data & Analytics",
    intro:
      "Google Analytics is the standard for website and app analytics. LogicLot experts automate the extraction and distribution of GA data, building pipelines that feed analytics into your dashboards, ad platforms, and reporting workflows without manual CSV exports.",
  },
  {
    id: "jira",
    name: "Jira",
    description:
      "Jira is a project management tool designed for software development and IT teams. It tracks issues, sprints, releases, and workflows with extensive customization options.",
    automationUseCases: [
      "Automatically create Jira tickets from customer support conversations in Zendesk or Intercom",
      "Sync Jira sprint progress with Slack standup summaries and management dashboards",
      "Trigger deployment pipelines when Jira issues move to a 'Ready for Release' status",
      "Generate automated release notes from completed Jira tickets at the end of each sprint",
      "Connect Jira with time tracking tools to automate billable hours reporting",
    ],
    categorySlug: "other",
    categoryLabel: "Other",
    intro:
      "Jira is the most widely used project tracker in software and IT teams. LogicLot experts automate the handoffs around Jira, connecting it to support systems, deployment tools, and reporting platforms so your development workflow runs without manual ticket shuffling.",
  },
];
