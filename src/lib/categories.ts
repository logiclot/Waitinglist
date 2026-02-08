export const CATEGORIES = [
  "Sales Automations",
  "Lead Qualification & Enrichment",
  "CRM Automation",
  "Support & Ticketing",
  "Finance & Invoicing",
  "Marketing Automation",
  "SEO Automation",
  "Ops & Admin Automation",
] as const;

export type CategoryName = typeof CATEGORIES[number];

export interface CategoryDef {
  id: string;
  name: CategoryName;
  slug: string;
  description: string;
}

export const CATEGORY_DEFINITIONS: CategoryDef[] = [
  { 
    id: "sales", 
    name: "Sales Automations", 
    slug: "sales-automations", 
    description: "Streamline outreach, follow-ups, and deal flow." 
  },
  { 
    id: "lead-qual", 
    name: "Lead Qualification & Enrichment", 
    slug: "lead-qualification-enrichment", 
    description: "Automatically score, enrich, and route leads." 
  },
  { 
    id: "crm", 
    name: "CRM Automation", 
    slug: "crm-automation", 
    description: "Keep your CRM clean, synced, and up-to-date." 
  },
  { 
    id: "support", 
    name: "Support & Ticketing", 
    slug: "support-ticketing", 
    description: "Automate ticket routing, responses, and CS workflows." 
  },
  { 
    id: "finance", 
    name: "Finance & Invoicing", 
    slug: "finance-invoicing", 
    description: "Automate billing, expenses, and reconciliation." 
  },
  { 
    id: "marketing", 
    name: "Marketing Automation", 
    slug: "marketing-automation", 
    description: "Scale content, campaigns, and social workflows." 
  },
  { 
    id: "seo", 
    name: "SEO Automation", 
    slug: "seo-automation", 
    description: "Automate keyword research, reporting, and optimization." 
  },
  { 
    id: "ops", 
    name: "Ops & Admin Automation", 
    slug: "ops-admin-automation", 
    description: "Streamline internal operations, onboarding, and reporting." 
  },
];

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
  return CATEGORY_DEFINITIONS.find(c => c.slug === slug);
}
