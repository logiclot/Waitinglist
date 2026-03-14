import type { LucideIcon } from "lucide-react";
import {
  Megaphone,
  Briefcase,
  Headphones,
  BarChart3,
  Calculator,
  PenTool,
  UserPlus,
  Layers,
} from "lucide-react";

/** Master category list — single source of truth, imported by SolutionWizard */
export const CATEGORIES = [
  "Marketing Automation",
  "Sales & CRM",
  "Customer Support",
  "Data & Analytics",
  "Finance & Operations",
  "Content Creation",
  "HR & Recruiting",
  "Other",
] as const;

export type CategoryName = typeof CATEGORIES[number];

export interface CategoryColor {
  /** Icon and text color, e.g. "text-amber-600" */
  text: string;
  /** Light background, e.g. "bg-amber-50" */
  bg: string;
  /** Subtle border, e.g. "border-amber-200" */
  border: string;
  /** Slightly stronger bg for icon container, e.g. "bg-amber-100" */
  iconBg: string;
}

export interface CategoryDef {
  id: string;
  name: CategoryName;
  slug: string;
  description: string;
  icon: LucideIcon;
  color: CategoryColor;
}

export const CATEGORY_DEFINITIONS: CategoryDef[] = [
  {
    id: "marketing",
    name: "Marketing Automation",
    slug: "marketing-automation",
    description: "Scale content, campaigns, and social workflows.",
    icon: Megaphone,
    color: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", iconBg: "bg-amber-100" },
  },
  {
    id: "sales-crm",
    name: "Sales & CRM",
    slug: "sales-crm",
    description: "Streamline outreach, follow-ups, and deal flow.",
    icon: Briefcase,
    color: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-100" },
  },
  {
    id: "customer-support",
    name: "Customer Support",
    slug: "customer-support",
    description: "Automate ticket routing, responses, and CS workflows.",
    icon: Headphones,
    color: { text: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", iconBg: "bg-violet-100" },
  },
  {
    id: "data-analytics",
    name: "Data & Analytics",
    slug: "data-analytics",
    description: "Automate reporting, dashboards, and data pipelines.",
    icon: BarChart3,
    color: { text: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", iconBg: "bg-teal-100" },
  },
  {
    id: "finance-ops",
    name: "Finance & Operations",
    slug: "finance-operations",
    description: "Automate billing, expenses, and reconciliation.",
    icon: Calculator,
    color: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", iconBg: "bg-emerald-100" },
  },
  {
    id: "content",
    name: "Content Creation",
    slug: "content-creation",
    description: "Automate content generation, editing, and publishing.",
    icon: PenTool,
    color: { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", iconBg: "bg-rose-100" },
  },
  {
    id: "hr",
    name: "HR & Recruiting",
    slug: "hr-recruiting",
    description: "Streamline hiring, onboarding, and HR workflows.",
    icon: UserPlus,
    color: { text: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", iconBg: "bg-indigo-100" },
  },
  {
    id: "other",
    name: "Other",
    slug: "other",
    description: "Other automation solutions.",
    icon: Layers,
    color: { text: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", iconBg: "bg-slate-100" },
  },
];

export function getCategoryBySlug(slug: string): CategoryDef | undefined {
  return CATEGORY_DEFINITIONS.find(c => c.slug === slug);
}

/** Lookup category config by display name (the value stored on Solution.category) */
export function getCategoryByName(name: string): CategoryDef | undefined {
  return CATEGORY_DEFINITIONS.find(c => c.name === name);
}
