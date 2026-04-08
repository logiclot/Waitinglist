"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createSolutionDraft,
  updateSolutionDraft,
  publishSolution,
} from "@/actions/solutions";
import { getExpertSettings } from "@/actions/expert";
import {
  getExpertEcosystems,
  addSolutionToEcosystem,
} from "@/actions/ecosystems";
import { SolutionPreview, SolutionFormData } from "./SolutionPreview";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronLeft,
  Save,
  Upload,
  AlertCircle,
  Plus,
  Trash2,
  ShieldCheck,
  Lock,
  Copy,
  Wrench,
  Sparkles,
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import Link from "next/link";

// --- Constants ---

const COMMON_TOOLS = [
  "Make",
  "n8n",
  "Zapier",
  "OpenAI",
  "HubSpot",
  "Salesforce",
  "Airtable",
  "Notion",
  "Google Sheets",
  "Slack",
  "Discord",
  "Shopify",
  "Stripe",
  "Xero",
  "QuickBooks",
  "Python",
];

const BUSINESS_GOALS = [
  "Lead generation",
  "Sales automation",
  "Customer support",
  "Finance & invoicing",
  "Operations / internal efficiency",
  "Marketing automation",
  "Reporting & dashboards",
];

const INDUSTRIES = [
  "eCommerce",
  "SaaS",
  "Real estate",
  "Agencies",
  "Professional services",
  "Finance",
  "Healthcare",
];

// --- Types ---
interface Milestone {
  title: string;
  description: string;
  price: number;
  deliveryTime?: string;
}

interface Skill {
  name: string;
  description: string;
}

export interface WizardState extends SolutionFormData {
  // Extended fields for wizard
  id?: string; // If draft created
  longDescription: string;
  complexity: string;

  milestones: Milestone[]; // V3: Dynamic Milestones
  skills: Skill[]; // Discrete capabilities the automation delivers

  included: string[];
  excluded: string; // stored as text, split by newline if needed

  requiredInputs: string[];
  requiredInputsText: string; // helper for input

  outline: string[]; // Up to 3 lines

  // V2: Structure fields
  structureConsistent: string[];
  structureCustom: string[];

  proofEnabled: boolean;
  proofType?: string;
  proofContent?: string;
  proofScreenshotUrl?: string;
  proofCaseStudyText?: string;
  demoVideoUrl?: string;

  paybackPeriod?: string;

  // Demo Pricing
  demoPrice?: number;

  // V2: Business Goals & Industries
  businessGoals: string[];
  industries: string[];

  lastStep: number;
}

const INITIAL_STATE: WizardState = {
  title: "",
  category: "",
  integrations: [],
  short_summary: "",
  longDescription: "",
  complexity: "Standard",

  included: [
    "Fully configured automation workflow",
    "Video walkthrough & documentation",
  ],
  excluded: "",

  requiredInputs: [],
  requiredInputsText: "",

  delivery_days: 7,
  support_days: 30,
  paybackPeriod: "",

  implementation_price: 0,
  monthly_cost_min: 0,
  monthly_cost_max: 0,
  outcome: "",

  demoPrice: 2, // Default 2 EUR

  milestones: [
    {
      title: "Core Logic Engine",
      description: "Setup and configuration of the main automation workflow.",
      price: 0,
    },
    {
      title: "Environment Mapping",
      description:
        "Customizing fields and triggers to match your specific tools.",
      price: 0,
    },
    {
      title: "QA & Handover",
      description: "Testing and final walkthrough session.",
      price: 0,
    },
  ],

  skills: [], // Optional skills list

  outline: ["", "", ""], // 3 slots

  // V2: Initialize arrays to prevent runtime errors
  structureConsistent: [],
  structureCustom: [],
  businessGoals: [],
  industries: [],

  proofEnabled: false,
  proofScreenshotUrl: "",
  proofCaseStudyText: "",
  demoVideoUrl: "",
  lastStep: 1,
};

interface SolutionWizardProps {
  initialData?: Partial<WizardState>;
  isLocked?: boolean;
  lockReason?: string;
}

export function SolutionWizard({
  initialData,
  isLocked,
  lockReason,
}: SolutionWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine start step: URL param > initialData.lastStep > 1
  const startStep = searchParams.get("step")
    ? parseInt(searchParams.get("step")!)
    : initialData?.lastStep || 1;

  const [step, setStep] = useState(startStep);
  const [customToolInput, setCustomToolInput] = useState("");
  const [quickTotal, setQuickTotal] = useState<string>("");
  const { data: stripeStatus, isLoading: isPayoutsLoading } = useQuery({
    queryKey: ["stripe-status"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/status");
      if (!res.ok) return null;
      return res.json() as Promise<{
        isConnected?: boolean;
        isStripeSupported?: boolean;
        hasBankDetails?: boolean;
      }>;
    },
  });

  const stripeConnected = !!stripeStatus?.isConnected;
  const isStripeSupported = stripeStatus?.isStripeSupported !== false;
  const hasBankDetails = !!stripeStatus?.hasBankDetails;
  const { data: expertSettingsData, isLoading: isExpertSettingsLoading } =
    useQuery({
      queryKey: ["expert-settings"],
      queryFn: async () => {
        const res = await getExpertSettings();
        if (!res.success || !res.settings) return null;
        const s = res.settings as {
          platformFeePercentage?: number;
          isFoundingExpert?: boolean;
          tier?: string;
        };
        const fee = s.platformFeePercentage ?? 16;
        let label: string;
        if (s.isFoundingExpert && s.tier === "ELITE")
          label = `${fee}% (Founding Expert · Elite)`;
        else if (s.isFoundingExpert && s.tier === "PROVEN")
          label = `${fee}% (Founding Expert · Proven)`;
        else if (s.isFoundingExpert) label = `${fee}% (Founding Expert)`;
        else if (s.tier === "ELITE") label = `${fee}% (Elite)`;
        else if (s.tier === "PROVEN") label = `${fee}% (Proven)`;
        else label = `${fee}%`;
        return { fee, label };
      },
    });
  const expertFeePercent = expertSettingsData?.fee ?? 16;
  const expertFeeLabel = expertSettingsData?.label ?? "Est. 16%";

  const { data: expertSuites = [], isLoading: isExpertSuitesLoading } =
    useQuery({
      queryKey: ["expert-ecosystems"],
      queryFn: async () => {
        const suites = await getExpertEcosystems();
        return suites.map((s) => ({ id: s.id, title: s.title }));
      },
    });
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Parse existing proofContent back into screenshot/case study fields when loading a draft
  const parsedProof = (() => {
    if (!initialData?.proofContent)
      return { proofScreenshotUrl: "", proofCaseStudyText: "" };
    try {
      const parsed = JSON.parse(initialData.proofContent);
      if (typeof parsed === "object" && parsed !== null) {
        return {
          proofScreenshotUrl: parsed.screenshot || "",
          proofCaseStudyText: parsed.caseStudy || "",
        };
      }
    } catch {
      /* not JSON */
    }
    // Legacy: single string stored as URL or text depending on proofType
    if (initialData.proofType === "screenshot")
      return {
        proofScreenshotUrl: initialData.proofContent,
        proofCaseStudyText: "",
      };
    if (initialData.proofType === "case_study")
      return {
        proofScreenshotUrl: "",
        proofCaseStudyText: initialData.proofContent,
      };
    return { proofScreenshotUrl: "", proofCaseStudyText: "" };
  })();

  const [formData, setFormData] = useState<WizardState>({
    ...INITIAL_STATE,
    ...initialData,
    // Ensure arrays are initialized if loading old drafts
    structureConsistent: initialData?.structureConsistent || [],
    structureCustom: initialData?.structureCustom || [],
    businessGoals: initialData?.businessGoals || [],
    industries: initialData?.industries || [],
    skills: initialData?.skills || [],
    // Ensure outline has 3 slots
    outline:
      initialData?.outline && initialData.outline.length > 0
        ? [...initialData.outline, "", "", ""].slice(0, 3)
        : ["", "", ""],
    // Populate split proof fields from existing proofContent
    proofScreenshotUrl: parsedProof.proofScreenshotUrl,
    proofCaseStudyText: parsedProof.proofCaseStudyText,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helpers
  const handleChange = <K extends keyof WizardState>(
    field: K,
    value: WizardState[K],
  ) => {
    if (isLocked) return; // Prevent edits if locked
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: keyof WizardState, item: string) => {
    if (isLocked) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = (formData[field] as any[]) || [];
    if (current.includes(item)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleChange(field, current.filter((t) => t !== item) as any);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handleChange(field, [...current, item] as any);
    }
  };

  const handleOutlineChange = (index: number, value: string) => {
    if (isLocked) return;
    const newOutline = [...formData.outline];
    newOutline[index] = value;
    handleChange("outline", newOutline);
  };

  const handleStructureChange = (
    type: "consistent" | "custom",
    index: number,
    value: string,
  ) => {
    if (isLocked) return;
    const field =
      type === "consistent" ? "structureConsistent" : "structureCustom";
    const newArray = [...formData[field]];
    newArray[index] = value;
    handleChange(field, newArray);
  };

  // --- Actions ---
  const handleSaveDraft = async (targetStep?: number): Promise<boolean> => {
    if (isLocked) return false;
    setLoading(true);
    setError(null);

    // Update lastStep
    const currentStepToSave = targetStep || step;

    // Prepare Payload
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "outline") {
        // Filter empty strings for submission if needed, but array handling is specific
        value.forEach((v: string) => payload.append(key, v));
      } else if (Array.isArray(value)) {
        value.forEach((v) => payload.append(key, v));
      } else if (value !== undefined && value !== null) {
        payload.append(key, value.toString());
      }
    });

    payload.set("lastStep", currentStepToSave.toString());

    try {
      let currentId = formData.id;

      if (!currentId) {
        // Create new draft first
        const res = await createSolutionDraft(payload);
        if (!res || res.error)
          throw new Error(res?.error || "Failed to create draft");
        currentId = res.solutionId;
        handleChange("id", currentId);
      }

      if (currentId) {
        // Update with full data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
          title: formData.title,
          category: formData.category,
          shortSummary:
            formData.short_summary ||
            formData.longDescription?.slice(0, 120) ||
            "",
          longDescription: formData.longDescription,
          complexity: formData.complexity,
          integrations: formData.integrations,
          included: formData.included,
          excluded: formData.excluded.split("\n").filter((x) => x.trim()),
          requiredInputs: formData.requiredInputs,

          implementationPriceCents:
            formData.milestones.reduce((sum, m) => sum + (m.price || 0), 0) *
            100,
          monthlyCostMinCents: (formData.monthly_cost_min || 0) * 100,
          monthlyCostMaxCents: (formData.monthly_cost_max || 0) * 100,
          demoPriceCents: (formData.demoPrice || 2) * 100,

          milestones: formData.milestones,

          deliveryDays: formData.delivery_days,
          supportDays: formData.support_days,
          outcome: formData.outcome,
          measurableOutcome: formData.outcome, // Sync for V2 validation

          structureConsistent:
            formData.structureConsistent?.filter((x) => x.trim()) || [],
          structureCustom:
            formData.structureCustom?.filter((x) => x.trim()) || [],
          businessGoals: formData.businessGoals?.filter((x) => x.trim()) || [],
          industries: formData.industries?.filter((x) => x.trim()) || [],

          outline: formData.outline.filter((l) => l.trim()),
          skills: formData.skills.filter((s) => s.name.trim()),
          lastStep: currentStepToSave,

          ...(() => {
            if (!formData.proofEnabled)
              return { proofType: null, proofContent: null };
            const hasScreenshot = !!formData.proofScreenshotUrl?.trim();
            const hasCaseStudy = !!formData.proofCaseStudyText?.trim();
            if (hasScreenshot && hasCaseStudy)
              return {
                proofType: "both",
                proofContent: JSON.stringify({
                  screenshot: formData.proofScreenshotUrl!.trim(),
                  caseStudy: formData.proofCaseStudyText!.trim(),
                }),
              };
            if (hasScreenshot)
              return {
                proofType: "screenshot",
                proofContent: formData.proofScreenshotUrl!.trim(),
              };
            if (hasCaseStudy)
              return {
                proofType: "case_study",
                proofContent: formData.proofCaseStudyText!.trim(),
              };
            return { proofType: null, proofContent: null };
          })(),

          paybackPeriod: formData.paybackPeriod || null,
          demoVideoUrl: formData.demoVideoUrl?.trim() || null,
        };

        if (formData.requiredInputsText) {
          updateData.requiredInputs = formData.requiredInputsText
            .split("\n")
            .filter((x: string) => x.trim());
        } else {
          updateData.requiredInputs = [];
        }

        const res = await updateSolutionDraft(currentId, updateData);
        if (!res || res.error)
          throw new Error(res?.error || "Failed to update draft");
      }
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save draft";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return (
          formData.title &&
          formData.category &&
          formData.integrations.length > 0 &&
          formData.businessGoals.length > 0 &&
          formData.longDescription
        );
      case 2:
        return (
          formData.included.filter((i) => i.trim()).length >= 3 &&
          !!formData.requiredInputsText
        );
      case 3:
        return (
          formData.delivery_days > 0 &&
          formData.support_days > 0 &&
          formData.paybackPeriod
        );
      case 4:
        return (
          formData.implementation_price > 0 &&
          (formData.demoPrice === undefined ||
            (formData.demoPrice >= 2 && formData.demoPrice <= 32))
        );
      case 5:
        return (
          !formData.proofEnabled ||
          !!(
            formData.proofScreenshotUrl?.trim() ||
            formData.proofCaseStudyText?.trim()
          )
        );
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (validateStep(step)) {
      const nextStep = step + 1;
      // Auto-save on next
      const saved = await handleSaveDraft(nextStep);
      if (saved) {
        setStep(nextStep);
        window.scrollTo(0, 0);
      }
    } else {
      // Give a more helpful error based on what's actually missing
      if (step === 2 && formData.included.filter((i) => i.trim()).length < 3) {
        setError(
          `Add at least 3 deliverables under "What's included" (currently ${formData.included.filter((i) => i.trim()).length}).`,
        );
      } else if (
        step === 4 &&
        formData.demoPrice !== undefined &&
        (formData.demoPrice < 2 || formData.demoPrice > 32)
      ) {
        setError("Discovery call price must be between €2 and €32.");
      } else {
        setError("Please fill all required fields marked with *");
      }
    }
  };

  const handlePublish = async () => {
    if (isLocked) return;

    // Always save draft first to ensure DB is up to date
    const saved = await handleSaveDraft();
    if (!saved || !formData.id) return; // Stop if save failed

    setLoading(true);
    const res = await publishSolution(formData.id);
    setLoading(false);

    if (!res) {
      toast.error("Something went wrong. Please try again.", {
        duration: 4000,
      });
      setError("Something went wrong. Please try again.");
      return;
    }

    if (res.success) {
      // If the expert selected a suite, add the solution to it
      if (selectedSuiteId && formData.id) {
        await addSolutionToEcosystem(selectedSuiteId, formData.id);
      }
      toast.success("Done! Your automation is now live.");
      if (formData.demoVideoUrl?.trim()) {
        toast.info(
          "Your demo video is pending review. It will appear on your listing automatically once approved.",
          { duration: 8000 },
        );
      }
      router.push("/expert/my-solutions?tab=published");
    } else {
      toast.error(res.error || "Failed to publish", { duration: 4000 });
      setError(res.error || "Failed to publish");
    }
  };

  // --- Step Renders ---

  // 1. Basics
  const renderStep1 = () => {
    const customTools = formData.integrations.filter(
      (t) => !COMMON_TOOLS.includes(t),
    );

    const addCustomTool = () => {
      const val = customToolInput.trim();
      if (val && !formData.integrations.includes(val)) {
        handleChange("integrations", [...formData.integrations, val]);
      }
      setCustomToolInput("");
    };

    return (
      <div className="space-y-7">
        {/* Title + Category */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium mb-1">
              Solution Title <span className="text-red-500">*</span>
            </label>
            <input
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              disabled={isLocked}
              className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g. Automated Lead Qualification System"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              disabled={isLocked}
              className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr className="border-border" />

        {/* Tools Used */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tools used <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_TOOLS.map((tool) => (
              <button
                key={tool}
                type="button"
                disabled={isLocked}
                onClick={() => handleArrayToggle("integrations", tool)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  formData.integrations.includes(tool)
                    ? "bg-primary/10 border-primary text-primary font-medium"
                    : "bg-background border-border text-muted-foreground hover:border-foreground"
                } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {tool}
              </button>
            ))}
            {customTools.map((tool) => (
              <span
                key={tool}
                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border bg-primary/10 border-primary text-primary font-medium"
              >
                {tool}
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() =>
                      handleChange(
                        "integrations",
                        formData.integrations.filter((t) => t !== tool),
                      )
                    }
                    className="ml-0.5 hover:text-red-500"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {!isLocked && (
            <div className="flex gap-2">
              <input
                value={customToolInput}
                onChange={(e) => setCustomToolInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomTool();
                  }
                }}
                className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm"
                placeholder="Other tool name…"
              />
              <button
                type="button"
                onClick={addCustomTool}
                className="px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-secondary transition-colors"
              >
                + Add
              </button>
            </div>
          )}
        </div>

        <hr className="border-border" />

        {/* Who is this for */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Business goals <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleArrayToggle("businessGoals", goal)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    formData.businessGoals.includes(goal)
                      ? "bg-primary/10 border-primary text-primary font-medium"
                      : "bg-background border-border text-muted-foreground hover:border-foreground"
                  } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Best fit industries{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  disabled={isLocked}
                  onClick={() => handleArrayToggle("industries", ind)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    formData.industries.includes(ind)
                      ? "bg-primary/10 border-primary text-primary font-medium"
                      : "bg-background border-border text-muted-foreground hover:border-foreground"
                  } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Key outcomes */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Key outcomes{" "}
            <span className="text-xs font-normal text-muted-foreground">
              — first one shows on the solution card
            </span>
          </label>
          <div className="space-y-2 mt-2">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="text-xs text-muted-foreground w-4 text-right">
                  {idx + 1}.
                </span>
                <div className="flex-1 relative">
                  <input
                    value={formData.outline[idx] || ""}
                    onChange={(e) => {
                      handleOutlineChange(idx, e.target.value);
                      if (idx === 0) handleChange("outcome", e.target.value);
                    }}
                    disabled={isLocked}
                    maxLength={60}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm pr-10 disabled:opacity-50"
                    placeholder={
                      idx === 0
                        ? "e.g. Saves 10h/week on reporting"
                        : idx === 1
                          ? "e.g. Reduces errors by 90%"
                          : "e.g. Fully hands-off after setup"
                    }
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                    {(formData.outline[idx] || "").length}/60
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <label className="text-sm font-medium">
              Detailed description <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-muted-foreground">
              {formData.longDescription?.length || 0}/10000
            </span>
          </div>
          <textarea
            value={formData.longDescription}
            onChange={(e) => handleChange("longDescription", e.target.value)}
            disabled={isLocked}
            className="w-full h-36 bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Describe the problem this solves, what's included, and what the client walks away with."
            maxLength={10000}
          />
        </div>
      </div>
    );
  };

  // 2. Structure & Deliverables
  const renderStep2 = () => (
    <div className="space-y-7">
      {/* Solution Structure */}
      <div>
        <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-muted-foreground" /> Solution
          structure
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Help buyers understand what is fixed and what gets adapted to their
          setup.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
              What stays the same
            </label>
            <div className="space-y-2">
              {[0, 1, 2].map((idx) => (
                <input
                  key={`cons-${idx}`}
                  value={(formData.structureConsistent || [])[idx] || ""}
                  onChange={(e) =>
                    handleStructureChange("consistent", idx, e.target.value)
                  }
                  disabled={isLocked}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm disabled:opacity-50"
                  placeholder={
                    idx === 0
                      ? "e.g. Core automation logic"
                      : idx === 1
                        ? "e.g. Trigger configuration"
                        : "e.g. Error handling rules"
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">
              What gets customised
            </label>
            <div className="space-y-2">
              {[0, 1, 2].map((idx) => (
                <input
                  key={`cust-${idx}`}
                  value={(formData.structureCustom || [])[idx] || ""}
                  onChange={(e) =>
                    handleStructureChange("custom", idx, e.target.value)
                  }
                  disabled={isLocked}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm disabled:opacity-50"
                  placeholder={
                    idx === 0
                      ? "e.g. Connected tools and fields"
                      : idx === 1
                        ? "e.g. Business-specific rules"
                        : "e.g. Data mapping"
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* Skills */}
      <div>
        <h3 className="text-sm font-medium mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-muted-foreground" /> Skills
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          If you trained the AI agent with specific skills, list them here.
          Buyers see these as built-in capabilities they get out of the box.
        </p>

        {formData.skills.length > 0 && (
          <div className="space-y-2 mb-3">
            {formData.skills.map((skill, idx) => (
              <div
                key={idx}
                className="border border-border rounded-lg p-3 bg-card group relative"
              >
                <div className="flex gap-3 items-center mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                  <input
                    value={skill.name}
                    onChange={(e) => {
                      const newSkills = [...formData.skills];
                      newSkills[idx] = {
                        ...newSkills[idx],
                        name: e.target.value,
                      };
                      handleChange("skills", newSkills);
                    }}
                    disabled={isLocked}
                    placeholder="Skill name — e.g. Email Classification"
                    className="flex-1 text-sm font-semibold bg-transparent border-none p-0 focus:ring-0 placeholder:text-muted-foreground/40 disabled:opacity-50"
                  />
                  <button
                    onClick={() =>
                      handleChange(
                        "skills",
                        formData.skills.filter((_, i) => i !== idx),
                      )
                    }
                    disabled={isLocked}
                    className="p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  value={skill.description}
                  onChange={(e) => {
                    const newSkills = [...formData.skills];
                    newSkills[idx] = {
                      ...newSkills[idx],
                      description: e.target.value,
                    };
                    handleChange("skills", newSkills);
                  }}
                  disabled={isLocked}
                  placeholder="Short description — e.g. Routes inbound emails by intent automatically"
                  className="w-full text-xs text-muted-foreground bg-secondary/20 border-none rounded px-2 py-1.5 focus:ring-1 focus:ring-primary/20 ml-6 disabled:opacity-50"
                />
              </div>
            ))}
          </div>
        )}

        {!isLocked && (
          <button
            onClick={() =>
              handleChange("skills", [
                ...formData.skills,
                { name: "", description: "" },
              ])
            }
            className="w-full py-2 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> Add skill
          </button>
        )}
      </div>

      <hr className="border-border" />

      {/* Included Deliverables */}
      <div>
        <label className="block text-sm font-medium mb-1">
          What&apos;s included <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          List at least 3 concrete deliverables the buyer receives.
        </p>
        <div className="space-y-2 mb-3">
          {formData.included.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={item}
                onChange={(e) => {
                  const newIncluded = [...formData.included];
                  newIncluded[idx] = e.target.value;
                  handleChange("included", newIncluded);
                }}
                disabled={isLocked}
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={() =>
                  handleChange(
                    "included",
                    formData.included.filter((_, i) => i !== idx),
                  )
                }
                disabled={isLocked}
                className="p-2 text-muted-foreground hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => handleChange("included", [...formData.included, ""])}
          disabled={isLocked}
          className="text-sm text-foreground font-medium flex items-center gap-1 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Add deliverable
        </button>
        {formData.included.filter((i) => i.trim()).length < 3 && (
          <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {formData.included.filter((i) => i.trim()).length === 0
              ? "Add at least 3 deliverables to continue."
              : `${formData.included.filter((i) => i.trim()).length}/3 deliverables added — add ${3 - formData.included.filter((i) => i.trim()).length} more to continue.`}
          </p>
        )}
      </div>

      {/* Required Inputs */}
      <div>
        <label className="block text-sm font-medium mb-1">
          What the client needs to provide{" "}
          <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-muted-foreground mb-2">
          List access, data, or anything out of scope. Sets expectations before
          they buy and reduces disputes.
        </p>
        <textarea
          value={formData.requiredInputsText}
          onChange={(e) => handleChange("requiredInputsText", e.target.value)}
          disabled={isLocked}
          className="w-full h-28 bg-background border border-border rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="e.g. Admin access to HubSpot, current leads CSV, brand colour codes. Custom integrations outside agreed scope are not included."
        />
      </div>
    </div>
  );

  // 3. Delivery & Support
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Delivery Time (Days) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.delivery_days}
            onChange={(e) =>
              handleChange("delivery_days", parseInt(e.target.value))
            }
            disabled={isLocked}
            className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Support Period (Days) <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.support_days}
            onChange={(e) =>
              handleChange("support_days", parseInt(e.target.value))
            }
            disabled={isLocked}
            className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {[7, 14, 30, 60].map((d) => (
              <option key={d} value={d}>
                {d} Days
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Expected ROI Timeframe <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.paybackPeriod || ""}
          onChange={(e) => handleChange("paybackPeriod", e.target.value)}
          disabled={isLocked}
          className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select Timeframe</option>
          <option value="lt_1m">Less than 1 month</option>
          <option value="1_3m">1–3 months</option>
          <option value="4_6m">4–6 months</option>
          <option value="long_term">Long-term efficiency</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          When should the buyer expect to break even on this investment?
        </p>
      </div>

      <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg">
        <label className="block text-sm font-bold text-purple-900 mb-1">
          Demo Video URL
        </label>
        <p className="text-xs text-purple-700 mb-3">
          Mandatory for &quot;Demo-First&quot; trust. Only YouTube and Loom
          videos are supported on the platform.
        </p>
        <input
          value={formData.demoVideoUrl || ""}
          onChange={(e) => {
            const url = e.target.value;
            handleChange("demoVideoUrl", url);
          }}
          onBlur={(e) => {
            const url = e.target.value.trim();
            if (
              url &&
              !url.match(
                /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|loom\.com)\//,
              )
            ) {
              toast.error(
                "Only YouTube and Loom video URLs are supported. Please add a valid link.",
                { duration: 5000 },
              );
            }
          }}
          disabled={isLocked}
          className="w-full bg-white border border-purple-200 rounded-md px-3 py-2 text-sm focus:border-purple-500 focus:ring-purple-500/20"
          placeholder="https://www.youtube.com/... or https://www.loom.com/..."
        />
      </div>

      <div className="bg-secondary/30 p-4 rounded-lg border border-border flex gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-foreground">
            NDA Included by Default
          </h4>
          <p className="text-xs text-muted-foreground">
            Platform policy protects both parties. Files and chats are
            confidential.
          </p>
        </div>
      </div>
    </div>
  );

  // 4. Pricing (Milestones)
  const renderStep4 = () => {
    const totalPrice = formData.milestones.reduce(
      (sum, m) => sum + (m.price || 0),
      0,
    );
    const platformFee = Math.round(totalPrice * (expertFeePercent / 100));
    const earnings = totalPrice - platformFee;

    const handleMilestoneChange = (
      index: number,
      field: keyof Milestone,
      val: string | number,
    ) => {
      const newMilestones = [...formData.milestones];
      // @ts-expect-error: dynamic field access
      newMilestones[index][field] = val;
      handleChange("milestones", newMilestones);
      const newTotal = newMilestones.reduce(
        (sum, m) => sum + (m.price || 0),
        0,
      );
      handleChange("implementation_price", newTotal);
    };

    const addMilestone = () => {
      handleChange("milestones", [
        ...formData.milestones,
        { title: "", description: "", price: 0 },
      ]);
    };

    const removeMilestone = (index: number) => {
      const newMilestones = formData.milestones.filter((_, i) => i !== index);
      handleChange("milestones", newMilestones);
      handleChange(
        "implementation_price",
        newMilestones.reduce((sum, m) => sum + (m.price || 0), 0),
      );
    };

    const applyQuickTotal = () => {
      const total = parseFloat(quickTotal);
      if (!total || total <= 0 || formData.milestones.length === 0) return;
      const perMilestone =
        Math.round((total / formData.milestones.length) * 100) / 100;
      const updated = formData.milestones.map((m) => ({
        ...m,
        price: perMilestone,
      }));
      handleChange("milestones", updated);
      handleChange("implementation_price", total);
      setQuickTotal("");
    };

    return (
      <div className="space-y-8">
        {/* Section 1: Implementation */}
        <div>
          <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-1">
            1 — Implementation
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Break the project into milestones. The client funds milestone 1 to
            start; each subsequent milestone is funded on approval.
          </p>

          {/* Quick total input */}
          <div className="flex gap-2 mb-4 p-3 bg-secondary/30 rounded-lg border border-border items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Set a total and split evenly across milestones
              </label>
              <input
                type="number"
                value={quickTotal}
                onChange={(e) => setQuickTotal(e.target.value)}
                placeholder="e.g. 1200"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={applyQuickTotal}
              className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Split across {formData.milestones.length} milestones
            </button>
          </div>

          {/* Milestone cards — compact */}
          <div className="space-y-2">
            {formData.milestones.map((milestone, idx) => (
              <div
                key={idx}
                className="border border-border rounded-lg p-3 bg-card group relative"
              >
                <div className="flex gap-3 items-center mb-2">
                  <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">
                    {idx + 1}.
                  </span>
                  <input
                    value={milestone.title}
                    onChange={(e) =>
                      handleMilestoneChange(idx, "title", e.target.value)
                    }
                    placeholder="Milestone title"
                    className="flex-1 text-sm font-semibold bg-transparent border-none p-0 focus:ring-0 placeholder:text-muted-foreground/40"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground">€</span>
                    <input
                      type="number"
                      value={milestone.price || ""}
                      onChange={(e) =>
                        handleMilestoneChange(
                          idx,
                          "price",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      placeholder="0"
                      className="w-20 text-sm font-bold text-right bg-transparent border-b border-border p-0 pb-0.5 focus:ring-0 focus:border-primary"
                    />
                  </div>
                  {formData.milestones.length > 2 && (
                    <button
                      onClick={() => removeMilestone(idx)}
                      className="p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <textarea
                  value={milestone.description}
                  onChange={(e) =>
                    handleMilestoneChange(idx, "description", e.target.value)
                  }
                  placeholder="What gets delivered in this milestone?"
                  className="w-full text-xs text-muted-foreground bg-secondary/20 border-none rounded resize-none h-12 px-2 py-1.5 focus:ring-1 focus:ring-primary/20 ml-8"
                />
              </div>
            ))}
          </div>

          <button
            onClick={addMilestone}
            className="mt-2 w-full py-2 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" /> Add milestone
          </button>

          {/* Earnings summary */}
          {isExpertSettingsLoading ? (
            <div className="mt-4 bg-card border border-border rounded-lg px-4 py-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-between bg-card border border-border rounded-lg px-4 py-3 text-sm">
              <div className="text-muted-foreground">
                Total:{" "}
                <span className="font-bold text-foreground">
                  €{totalPrice.toLocaleString("de-DE")}
                </span>
                <span className="mx-2 opacity-30">·</span>
                Fee {expertFeeLabel}:{" "}
                <span className="font-medium">
                  -€{platformFee.toLocaleString("de-DE")}
                </span>
              </div>
              <div className="font-bold text-foreground">
                You earn:{" "}
                <span className="text-green-600">
                  €{earnings.toLocaleString("de-DE")}
                </span>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {isExpertSettingsLoading ? (
              <span className="inline-block h-3 w-40 bg-muted rounded animate-pulse" />
            ) : expertFeePercent < 16 ? (
              `Your current rate: ${expertFeePercent}% — `
            ) : (
              "Fee drops to 12–14% as you grow. "
            )}
            <a
              href="/pricing"
              target="_blank"
              className="underline hover:text-primary"
            >
              See tiers
            </a>
            .
          </p>
          {totalPrice > 0 && totalPrice < 500 && (
            <p className="text-xs text-muted-foreground/70 mt-2 text-right">
              Solutions priced at €500+ tend to attract more serious buyers and
              convert better on the platform.
            </p>
          )}
        </div>

        <hr className="border-border" />

        {/* Section 2: Monthly running costs */}
        <div>
          <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-1">
            2 — Monthly running cost
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            What will the buyer pay each month to keep this running? Include
            tool subscriptions (Make, n8n, Zapier), API usage (OpenAI tokens,
            etc.), and any ongoing licence fees. This goes directly to the
            buyer&apos;s budget — not to you.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Min (€/month)
              </label>
              <input
                type="number"
                value={formData.monthly_cost_min || ""}
                onChange={(e) =>
                  handleChange("monthly_cost_min", parseInt(e.target.value))
                }
                disabled={isLocked}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground">
                Max (€/month)
              </label>
              <input
                type="number"
                value={formData.monthly_cost_max || ""}
                onChange={(e) =>
                  handleChange("monthly_cost_max", parseInt(e.target.value))
                }
                disabled={isLocked}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <hr className="border-border" />

        {/* Section 3: Discovery call */}
        <div className="rounded-lg border border-border bg-[#1c1c1e] p-4">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-3">
            3 — Discovery call price
          </p>

          <div className="flex gap-3 items-end mb-2">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1 text-white/60">
                Price per call (€){" "}
                <span className="font-normal text-white/40">
                  &mdash; you keep this minus €2 platform fee
                </span>
              </label>
              <input
                type="number"
                value={formData.demoPrice}
                onChange={(e) =>
                  handleChange("demoPrice", parseFloat(e.target.value))
                }
                onBlur={() => {
                  const v = formData.demoPrice;
                  if (v === undefined || isNaN(v) || v < 2)
                    handleChange("demoPrice", 2);
                  else if (v > 32) handleChange("demoPrice", 32);
                }}
                disabled={isLocked}
                min={2}
                max={32}
                className="w-full bg-white/10 border border-white/15 text-white rounded-md px-3 py-2 text-sm placeholder:text-white/30 focus:outline-none disabled:opacity-50"
                placeholder="2"
              />
              <p className="text-[10px] text-white/30 mt-1">
                Min €2 (platform fee) · Max €32
              </p>
            </div>
            <div className="text-right pb-0.5 shrink-0">
              <p className="text-xs text-white/40">You earn</p>
              <p className="text-xl font-bold text-white">
                €
                {Math.max(
                  0,
                  Math.min(32, formData.demoPrice || 0) - 2,
                ).toLocaleString("de-DE")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-md px-3 py-2">
            <p className="text-xs text-white/40">
              Needs a calendar link to go live.
            </p>
            <a
              href="/expert/settings#calendar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-white/70 underline underline-offset-2 hover:text-white transition-colors whitespace-nowrap"
            >
              Connect calendar →
            </a>
          </div>
        </div>
      </div>
    );
  };

  // 5. Proof & Publish Requirements
  const payoutReady = isStripeSupported
    ? stripeConnected === true
    : hasBankDetails;
  const canPublish = payoutReady;

  const renderStep5 = () => (
    <div className="space-y-6">
      {/* ── Required connections ─────────────────────────────────── */}
      <div>
        <label className="text-sm font-medium">Required to publish</label>
        <p className="text-xs text-muted-foreground mt-0.5 mb-3">
          Set up payouts before you can go live.
        </p>

        <div className="space-y-2">
          {/* Payout setup */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {isPayoutsLoading ? (
                <div className="w-2 h-2 rounded-full shrink-0 bg-muted animate-pulse" />
              ) : (
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${payoutReady ? "bg-green-500" : "bg-amber-400"}`}
                />
              )}
              <span className="text-sm text-foreground">
                {isPayoutsLoading
                  ? "Fetching payouts status…"
                  : isStripeSupported
                    ? stripeConnected
                      ? "Stripe connected"
                      : "Connect Stripe to get paid"
                    : hasBankDetails
                      ? "Bank details saved"
                      : "Add bank details to get paid"}
              </span>
            </div>
            {isPayoutsLoading ? null : payoutReady ? (
              <Link
                href="/expert/settings#payouts"
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Manage
              </Link>
            ) : isStripeSupported ? (
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch("/api/stripe/onboard", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ returnTo: window.location.pathname }),
                  });
                  const d = await res.json();
                  if (d.url) window.location.href = d.url;
                }}
                className="text-xs font-semibold px-3 py-1.5 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Connect Stripe &#x2192;
              </button>
            ) : (
              <Link
                href="/expert/settings#payouts"
                className="text-xs font-semibold px-3 py-1.5 bg-foreground text-background rounded-md hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Add Bank Details &#x2192;
              </Link>
            )}
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* ── Proof (optional) ─────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div>
            <label className="text-sm font-medium">Add Proof (Optional)</label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Show potential clients real results. Both fields are optional —
              fill in what you have.
            </p>
          </div>
          <button
            onClick={() => handleChange("proofEnabled", !formData.proofEnabled)}
            disabled={isLocked}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.proofEnabled ? "bg-primary" : "bg-secondary"} ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.proofEnabled ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </div>
      </div>

      {formData.proofEnabled && (
        <div className="animate-in fade-in slide-in-from-top-2 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Anonymized Screenshot
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              A link to a screenshot showing the automation in action. Make sure
              no sensitive client data is visible.
            </p>
            <input
              value={formData.proofScreenshotUrl || ""}
              onChange={(e) =>
                handleChange("proofScreenshotUrl", e.target.value)
              }
              disabled={isLocked}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="https://..."
              type="url"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Short Case Study
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Describe the problem, what you built, and what changed. Keep it
              short — 3 to 5 sentences is enough.
            </p>
            <textarea
              value={formData.proofCaseStudyText || ""}
              onChange={(e) =>
                handleChange("proofCaseStudyText", e.target.value)
              }
              disabled={isLocked}
              rows={4}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g. A 3-person e-commerce team was manually updating stock levels twice a day. We connected their supplier feed to Shopify using a scheduled automation. Stock updates now happen every 30 minutes without anyone touching it."
            />
          </div>
        </div>
      )}

      {/* ── Suite assignment (optional) ──────────────────────────── */}
      <hr className="border-border" />
      <div className="space-y-2">
        <label className="text-sm font-medium">Add to a Suite (Optional)</label>
        <p className="text-xs text-muted-foreground">
          If this solution is part of a larger automation flow, assign it to a
          suite so buyers can discover it in context.
        </p>
        {isExpertSuitesLoading ? (
          <div className="h-9 bg-muted rounded-md animate-pulse" />
        ) : expertSuites.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            You have no suites yet.{" "}
            <a
              href="/expert/ecosystems/new"
              target="_blank"
              className="text-primary underline hover:no-underline"
            >
              Create one first
            </a>
            , then come back here.
          </p>
        ) : (
          <select
            value={selectedSuiteId}
            onChange={(e) => setSelectedSuiteId(e.target.value)}
            disabled={isLocked}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">— No suite —</option>
            {expertSuites.map((suite) => (
              <option key={suite.id} value={suite.id}>
                {suite.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Publish gate warning ─────────────────────────────────── */}
      {!canPublish && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 p-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {isStripeSupported ? "Connect Stripe" : "Add bank details"} above to
          publish your solution.
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: WIZARD */}
      <div className="lg:col-span-7 bg-card border border-border rounded-xl p-6 shadow-sm">
        {/* Lock Banner */}
        {isLocked && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-700 p-4 rounded-lg flex items-start gap-3">
            <Lock className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Editing Locked</h4>
              <p className="text-sm mt-1">{lockReason}</p>
              <div className="mt-3">
                <button
                  disabled
                  className="text-xs font-bold bg-white border border-amber-300 px-3 py-1.5 rounded-md opacity-50 cursor-not-allowed flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Duplicate Solution
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            <span>Step {step} of 5</span>
            <span>
              {step === 1 && "Basics"}
              {step === 2 && "Deliverables"}
              {step === 3 && "Delivery & Trust"}
              {step === 4 && "Pricing"}
              {step === 5 && "Proof"}
            </span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> {step > 1 ? "Back" : "Cancel"}
          </button>

          <div className="flex gap-3">
            {!isLocked && (
              <button
                onClick={() => handleSaveDraft()}
                disabled={loading}
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Draft
              </button>
            )}

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              !isLocked && (
                <button
                  onClick={handlePublish}
                  disabled={loading || !canPublish}
                  title={
                    !canPublish
                      ? "Connect Stripe and Calendar to publish"
                      : undefined
                  }
                  className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Publishing..." : "Publish Solution"}{" "}
                  <Upload className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: PREVIEW */}
      <div className="hidden lg:block lg:col-span-5">
        <SolutionPreview data={formData} />
      </div>
    </div>
  );
}
