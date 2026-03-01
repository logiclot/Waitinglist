"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import type { WizardState } from "@/components/solutions/SolutionWizard";

// ── Constants (mirrored from SolutionWizard to avoid circular import) ─────────

const COMMON_TOOLS = [
  "Make", "n8n", "Zapier", "OpenAI", "HubSpot", "Salesforce",
  "Airtable", "Notion", "Google Sheets", "Slack", "Discord",
  "Shopify", "Stripe", "Xero", "QuickBooks", "Python",
];

const CATEGORIES = [
  "Marketing Automation", "Sales & CRM", "Customer Support",
  "Data & Analytics", "Finance & Operations", "Content Creation",
  "HR & Recruiting", "Other",
];

// ── n8n node-type → COMMON_TOOL name ─────────────────────────────────────────

const N8N_NODE_MAP: Record<string, string> = {
  "n8n-nodes-base.slack":               "Slack",
  "n8n-nodes-base.hubspot":             "HubSpot",
  "n8n-nodes-base.googlesheets":        "Google Sheets",
  "n8n-nodes-base.airtable":            "Airtable",
  "n8n-nodes-base.notion":              "Notion",
  "n8n-nodes-base.discord":             "Discord",
  "n8n-nodes-base.shopify":             "Shopify",
  "n8n-nodes-base.stripe":              "Stripe",
  "n8n-nodes-base.xero":                "Xero",
  "n8n-nodes-base.quickbooks":          "QuickBooks",
  "n8n-nodes-base.python":              "Python",
  "n8n-nodes-base.salesforce":          "Salesforce",
  "@n8n/n8n-nodes-langchain.openai":    "OpenAI",
  "n8n-nodes-base.zapier":              "Zapier",
  "n8n-nodes-base.make":                "Make",
};

// ── Credential key → readable label ──────────────────────────────────────────

const CREDENTIAL_LABEL_MAP: Record<string, string> = {
  slackapi:               "Slack API key",
  hubspotapi:             "HubSpot API key",
  openaiapi:              "OpenAI API key",
  googlesheetsapi:        "Google Sheets OAuth",
  googlesheetsOAuth2Api:  "Google Sheets OAuth",
  airtableapi:            "Airtable API key",
  notionapi:              "Notion API key",
  discordapi:             "Discord API key",
  shopifyapi:             "Shopify API key",
  stripeapi:              "Stripe API key",
  xeroapi:                "Xero API key",
  quickbooksapi:          "QuickBooks API key",
  salesforceapi:          "Salesforce API key",
  salesforceoauth2api:    "Salesforce OAuth",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchTool(raw: string): string | null {
  if (N8N_NODE_MAP[raw]) return N8N_NODE_MAP[raw];
  const lower = raw.toLowerCase();
  for (const tool of COMMON_TOOLS) {
    if (lower.includes(tool.toLowerCase())) return tool;
  }
  return null;
}

function suggestCategory(tags: string[]): string {
  const joined = tags.join(" ").toLowerCase();
  if (/marketing|email|campaign/.test(joined))      return "Marketing Automation";
  if (/sales|crm|lead/.test(joined))                return "Sales & CRM";
  if (/support|ticket|helpdesk/.test(joined))       return "Customer Support";
  if (/data|analytics|report/.test(joined))         return "Data & Analytics";
  if (/finance|invoice|payment/.test(joined))       return "Finance & Operations";
  if (/content|social|blog/.test(joined))           return "Content Creation";
  if (/hr|recruit|hiring/.test(joined))             return "HR & Recruiting";
  return "Other";
}

function credentialKeyToLabel(key: string): string {
  const lower = key.toLowerCase();
  return (
    CREDENTIAL_LABEL_MAP[lower] ??
    CREDENTIAL_LABEL_MAP[key] ??
    key.replace(/([A-Z])/g, " $1").replace(/api$/i, "API key").trim()
  );
}

// ── Core parser ───────────────────────────────────────────────────────────────

interface ParsedWorkflow {
  title: string;
  tools: string[];
  tags: string[];
  credentials: string[];
}

function parseWorkflowJson(json: unknown): ParsedWorkflow {
  const result: ParsedWorkflow = { title: "", tools: [], tags: [], credentials: [] };
  if (typeof json !== "object" || json === null) return result;

  const obj = json as Record<string, unknown>;

  result.title =
    (typeof obj.name === "string"          ? obj.name          : "") ||
    (typeof obj.title === "string"         ? obj.title         : "") ||
    (typeof obj.workflow_name === "string" ? obj.workflow_name : "");

  const toolSet = new Set<string>();
  const credSet = new Set<string>();

  // n8n format: nodes[] with type and credentials
  if (Array.isArray(obj.nodes)) {
    for (const node of obj.nodes as Record<string, unknown>[]) {
      if (typeof node.type === "string") {
        const mapped = matchTool(node.type);
        if (mapped) toolSet.add(mapped);
      }
      if (typeof node.credentials === "object" && node.credentials !== null) {
        for (const key of Object.keys(node.credentials as object)) {
          credSet.add(credentialKeyToLabel(key));
        }
      }
    }
    // n8n top-level credentials
    if (typeof obj.credentials === "object" && obj.credentials !== null) {
      for (const key of Object.keys(obj.credentials as object)) {
        credSet.add(credentialKeyToLabel(key));
      }
    }
    // n8n tags
    if (Array.isArray(obj.tags)) {
      for (const tag of obj.tags) {
        if (typeof tag === "string") result.tags.push(tag);
        else if (typeof (tag as Record<string, unknown>).name === "string")
          result.tags.push((tag as Record<string, unknown>).name as string);
      }
    }
  }

  // Make/Integromat format: metadata.apps[]
  if (
    typeof obj.metadata === "object" &&
    obj.metadata !== null &&
    Array.isArray((obj.metadata as Record<string, unknown>).apps)
  ) {
    for (const app of (obj.metadata as Record<string, unknown[]>).apps) {
      if (typeof app === "string") {
        const mapped = matchTool(app);
        if (mapped) toolSet.add(mapped);
      }
    }
  }

  // Zapier format: steps[] with app_id / app_name
  if (Array.isArray(obj.steps)) {
    for (const step of obj.steps as Record<string, unknown>[]) {
      const raw =
        (typeof step.app_id   === "string" ? step.app_id   : "") ||
        (typeof step.app_name === "string" ? step.app_name : "") ||
        (typeof step.app      === "string" ? step.app      : "");
      if (raw) {
        const mapped = matchTool(raw);
        if (mapped) toolSet.add(mapped);
      }
    }
  }

  result.tools       = Array.from(toolSet);
  result.credentials = Array.from(credSet);
  return result;
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ImportableWizardData = Partial<
  Pick<WizardState, "title" | "integrations" | "category" | "requiredInputs" | "short_summary">
>;

interface JsonImportButtonProps {
  onImport: (data: ImportableWizardData, populatedFields: string[]) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function JsonImportButton({ onImport }: JsonImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result;
        if (typeof raw !== "string") return;

        const json: unknown = JSON.parse(raw);
        const parsed = parseWorkflowJson(json);

        const data: ImportableWizardData = {};
        const populated: string[] = [];

        if (parsed.title) {
          data.title = parsed.title;
          populated.push("Title");
        }

        const validTools = parsed.tools.filter((t) => COMMON_TOOLS.includes(t));
        if (validTools.length > 0) {
          data.integrations = validTools;
          populated.push("Tools used");
        }

        const suggested = suggestCategory(parsed.tags);
        if (suggested && suggested !== "Other" && CATEGORIES.includes(suggested)) {
          data.category = suggested;
          populated.push("Category");
        }

        if (parsed.credentials.length > 0) {
          data.requiredInputs = parsed.credentials;
          populated.push("Required access");
        }

        onImport(data, populated);
      } catch {
        alert("Could not parse the file. Make sure it is a valid workflow JSON export.");
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    e.target.value = "";
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/50 bg-background text-sm font-bold text-foreground transition-all hover:shadow-sm"
      >
        <Upload className="w-4 h-4" />
        Import from JSON
      </button>
      <p className="text-xs text-muted-foreground mt-1">
        Export your workflow as JSON from n8n, Make, or Zapier and import it here.
      </p>
    </div>
  );
}
