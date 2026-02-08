"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSolutionDraft, updateSolutionDraft, publishSolution } from "@/actions/solutions";
import { SolutionPreview, SolutionFormData } from "./SolutionPreview";
import { 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Upload, 
  AlertCircle,
  Plus,
  Trash2,
  DollarSign,
  ShieldCheck,
  Lock,
  Copy
} from "lucide-react";

// --- Constants ---
const CATEGORIES = [
  "Marketing Automation",
  "Sales & CRM",
  "Customer Support",
  "Data & Analytics",
  "Finance & Operations",
  "Content Creation",
  "HR & Recruiting",
  "Other"
];

const COMMON_TOOLS = [
  "Make.com", "n8n", "Zapier", "OpenAI", "HubSpot", "Salesforce", 
  "Airtable", "Notion", "Google Sheets", "Slack", "Discord", 
  "Shopify", "Stripe", "Xero", "QuickBooks"
];

// --- Types ---
export interface WizardState extends SolutionFormData {
  // Extended fields for wizard
  id?: string; // If draft created
  longDescription: string;
  complexity: string;
  
  included: string[];
  excluded: string; // stored as text, split by newline if needed
  
  accessRequired: string;
  requiredInputs: string[];
  requiredInputsText: string; // helper for input
  questions: string[]; // helper for input
  
  maintenancePrice?: number;
  maintenanceDescription?: string;
  
  outline: string[]; // Up to 3 lines
  
  proofEnabled: boolean;
  proofType?: string;
  proofContent?: string;
  
  paybackPeriod?: string;

  lastStep: number;
}

const INITIAL_STATE: WizardState = {
  title: "",
  category: "",
  integrations: [],
  short_summary: "",
  longDescription: "",
  complexity: "Standard",
  
  included: ["Fully configured automation workflow", "Video walkthrough & documentation"],
  excluded: "",
  
  accessRequired: "",
  requiredInputs: [],
  requiredInputsText: "",
  questions: [],
  
  delivery_days: 7,
  support_days: 30,
  paybackPeriod: "",
  
  implementation_price: 0,
  monthly_cost_min: 0,
  monthly_cost_max: 0,
  outcome: "",
  
  outline: ["", "", ""], // 3 slots
  
  proofEnabled: false,
  lastStep: 1
};

interface SolutionWizardProps {
  initialData?: Partial<WizardState>;
  isLocked?: boolean;
  lockReason?: string;
}

export function SolutionWizard({ initialData, isLocked, lockReason }: SolutionWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Determine start step: URL param > initialData.lastStep > 1
  const startStep = searchParams.get("step") 
    ? parseInt(searchParams.get("step")!) 
    : (initialData?.lastStep || 1);

  useEffect(() => {
    window.scrollTo(0,0);
  }, [step]);
  
  const [formData, setFormData] = useState<WizardState>({ 
    ...INITIAL_STATE, 
    ...initialData,
    // Ensure outline has 3 slots
    outline: initialData?.outline && initialData.outline.length > 0 
      ? [...initialData.outline, "", "", ""].slice(0, 3) 
      : ["", "", ""]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Helpers
  const handleChange = (field: keyof WizardState, value: any) => {
    if (isLocked) return; // Prevent edits if locked
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIntegrationToggle = (tool: string) => {
    if (isLocked) return;
    const current = formData.integrations;
    if (current.includes(tool)) {
      handleChange("integrations", current.filter(t => t !== tool));
    } else {
      handleChange("integrations", [...current, tool]);
    }
  };

  const handleOutlineChange = (index: number, value: string) => {
    if (isLocked) return;
    const newOutline = [...formData.outline];
    newOutline[index] = value;
    handleChange("outline", newOutline);
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
        value.forEach(v => payload.append(key, v));
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
        if (res.error) throw new Error(res.error);
        currentId = res.solutionId;
        handleChange("id", currentId);
      }

      if (currentId) {
        // Update with full data
        const updateData: any = {
          title: formData.title,
          category: formData.category,
          shortSummary: formData.short_summary,
          longDescription: formData.longDescription,
          complexity: formData.complexity,
          integrations: formData.integrations,
          included: formData.included,
          excluded: formData.excluded.split("\n").filter(x => x.trim()),
          accessRequired: formData.accessRequired,
          requiredInputs: formData.requiredInputs,
          
          implementationPriceCents: (formData.implementation_price || 0) * 100,
          monthlyCostMinCents: (formData.monthly_cost_min || 0) * 100,
          monthlyCostMaxCents: (formData.monthly_cost_max || 0) * 100,
          
          deliveryDays: formData.delivery_days,
          supportDays: formData.support_days,
          outcome: formData.outcome,
          
          outline: formData.outline.filter(l => l.trim()),
          lastStep: currentStepToSave,
          
          proofType: formData.proofEnabled ? formData.proofType : null,
          proofContent: formData.proofEnabled ? formData.proofContent : null,
          
          paybackPeriod: formData.paybackPeriod || null,
        };
        
        if (formData.requiredInputsText) {
           updateData.requiredInputs = formData.requiredInputsText.split("\n").filter((x: string) => x.trim());
        }

        const res = await updateSolutionDraft(currentId, updateData);
        if (res.error) throw new Error(res.error);
      }
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to save draft");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.category && formData.integrations.length > 0 && formData.longDescription;
      case 2:
        return formData.included.length >= 3;
      case 3:
        return formData.accessRequired && formData.requiredInputsText; // simplified check
      case 4:
        return formData.delivery_days > 0 && formData.support_days > 0 && formData.paybackPeriod;
      case 5:
        return formData.implementation_price > 0;
      case 6:
        return !formData.proofEnabled || (formData.proofType && formData.proofContent);
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (validateStep(step)) {
      const nextStep = step + 1;
      setStep(nextStep);
      window.scrollTo(0,0);
      // Auto-save on next
      await handleSaveDraft(nextStep);
    } else {
      setError("Please fill all required fields marked with *");
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
    
    if (res.success) {
      router.push("/expert/my-solutions?tab=published");
    } else {
      setError(res.error || "Failed to publish");
    }
  };

  // --- Step Renders ---
  
  // 1. Basics
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Solution Title <span className="text-red-500">*</span></label>
        <input 
          value={formData.title} 
          onChange={e => handleChange("title", e.target.value)} 
          disabled={isLocked}
          className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="e.g. Automated Lead Qualification System"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
        <select 
          value={formData.category} 
          onChange={e => handleChange("category", e.target.value)} 
          disabled={isLocked}
          className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select Category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tools Used <span className="text-red-500">*</span></label>
        <div className="flex flex-wrap gap-2">
          {COMMON_TOOLS.map(tool => (
            <button 
              key={tool}
              type="button"
              disabled={isLocked}
              onClick={() => handleIntegrationToggle(tool)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                formData.integrations.includes(tool)
                  ? "bg-primary/10 border-primary text-primary font-medium"
                  : "bg-background border-border text-muted-foreground hover:border-foreground"
              } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between">
          <label className="block text-sm font-medium mb-1">One-Liner (Subtitle)</label>
          <span className="text-xs text-muted-foreground">{formData.short_summary?.length || 0}/120</span>
        </div>
        <input 
          value={formData.short_summary} 
          onChange={e => handleChange("short_summary", e.target.value)} 
          disabled={isLocked}
          className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Short impact statement (e.g. 'Save 10 hours a week on data entry')"
          maxLength={120}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Outcome Line (Displayed on card)</label>
        <input 
          value={formData.outcome} 
          onChange={e => handleChange("outcome", e.target.value)} 
          disabled={isLocked}
          className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="e.g. Reduces manual lead handling by 90%."
          maxLength={60}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Outline Lines (Up to 3 highlights)</label>
        <div className="space-y-3">
          {[0, 1, 2].map(idx => (
            <div key={idx} className="flex gap-2 items-center">
              <span className="text-xs font-bold text-muted-foreground w-4">{idx + 1}.</span>
              <div className="flex-1 relative">
                <input
                  value={formData.outline[idx] || ""}
                  onChange={e => handleOutlineChange(idx, e.target.value)}
                  disabled={isLocked}
                  maxLength={60}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm pr-12 disabled:opacity-50"
                  placeholder={`Highlight ${idx + 1} (optional)`}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                  {(formData.outline[idx] || "").length}/60
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between">
          <label className="block text-sm font-medium mb-1">Detailed Description <span className="text-red-500">*</span></label>
          <span className="text-xs text-muted-foreground">{formData.longDescription?.length || 0}/10000</span>
        </div>
        <textarea 
          value={formData.longDescription} 
          onChange={e => handleChange("longDescription", e.target.value)} 
          disabled={isLocked}
          className="w-full h-40 bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="Describe the problem, what’s included, and the outcome."
          maxLength={10000}
        />
      </div>
    </div>
  );

  // 2. Deliverables
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Included Deliverables (Min 3) <span className="text-red-500">*</span></label>
        <div className="space-y-2 mb-4">
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
                className="flex-1 bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button 
                onClick={() => handleChange("included", formData.included.filter((_, i) => i !== idx))}
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
          className="text-sm text-primary font-medium flex items-center gap-1 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Not Included</label>
        <textarea 
          value={formData.excluded} 
          onChange={e => handleChange("excluded", e.target.value)} 
          disabled={isLocked}
          className="w-full h-24 bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="List items explicitly excluded (one per line)..."
        />
      </div>
    </div>
  );

  // 3. Business Requirements
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Access Required <span className="text-red-500">*</span></label>
        <div className="space-y-3">
          {[
            "Full admin access required",
            "Standard user access is sufficient",
            "No platform access needed (API/export only)"
          ].map(opt => (
            <label key={opt} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-secondary/50">
              <input 
                type="radio" 
                name="access" 
                value={opt}
                checked={formData.accessRequired === opt}
                onChange={e => handleChange("accessRequired", e.target.value)}
                disabled={isLocked}
                className="text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className={`text-sm ${isLocked ? "opacity-50" : ""}`}>{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Required Inputs <span className="text-red-500">*</span></label>
        <textarea 
          value={formData.requiredInputsText} 
          onChange={e => handleChange("requiredInputsText", e.target.value)} 
          disabled={isLocked}
          className="w-full h-24 bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="e.g. Access to Google Analytics, List of competitors, Brand guidelines..."
        />
        <p className="text-xs text-muted-foreground mt-1">What must the client provide?</p>
      </div>
    </div>
  );

  // 4. Delivery & Support
  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Delivery Time (Days) <span className="text-red-500">*</span></label>
          <input 
            type="number"
            value={formData.delivery_days} 
            onChange={e => handleChange("delivery_days", parseInt(e.target.value))} 
            disabled={isLocked}
            className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            min={1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Support Period (Days) <span className="text-red-500">*</span></label>
          <select 
            value={formData.support_days} 
            onChange={e => handleChange("support_days", parseInt(e.target.value))} 
            disabled={isLocked}
            className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {[7, 14, 30, 60].map(d => <option key={d} value={d}>{d} Days</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Expected ROI Timeframe <span className="text-red-500">*</span></label>
        <select
          value={formData.paybackPeriod || ""}
          onChange={e => handleChange("paybackPeriod", e.target.value)}
          disabled={isLocked}
          className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">Select Timeframe</option>
          <option value="lt_1m">Less than 1 month</option>
          <option value="1_3m">1–3 months</option>
          <option value="long_term">Long-term efficiency</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          When should the buyer expect to break even on this investment?
        </p>
      </div>

      <div className="bg-secondary/30 p-4 rounded-lg border border-border flex gap-3">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-foreground">NDA Included by Default</h4>
          <p className="text-xs text-muted-foreground">Platform policy protects both parties. Files and chats are confidential.</p>
        </div>
      </div>
    </div>
  );

  // 5. Pricing
  const renderStep5 = () => {
    const platformFee = Math.round((formData.implementation_price || 0) * 0.15);
    const earnings = (formData.implementation_price || 0) - platformFee;

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">List Price ($) <span className="text-red-500">*</span></label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="number"
              value={formData.implementation_price || ""} 
              onChange={e => handleChange("implementation_price", parseInt(e.target.value))} 
              disabled={isLocked}
              className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0.00"
              min={0}
            />
          </div>
        </div>

        {/* Expert Commission Breakdown */}
        {formData.implementation_price > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">List Price (Client pays):</span>
              <span className="font-medium">${formData.implementation_price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee (15%):</span>
              <span className="text-red-400">-${platformFee}</span>
            </div>
            <div className="border-t border-blue-500/20 pt-2 flex justify-between font-bold text-foreground">
              <span>Your Earnings:</span>
              <span className="text-green-500">${earnings}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              * Platform fee is hidden from clients. They only see the List Price.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Est. Monthly Tool Cost (Min $)</label>
            <input 
              type="number"
              value={formData.monthly_cost_min || ""} 
              onChange={e => handleChange("monthly_cost_min", parseInt(e.target.value))} 
              disabled={isLocked}
              className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Est. Monthly Tool Cost (Max $)</label>
            <input 
              type="number"
              value={formData.monthly_cost_max || ""} 
              onChange={e => handleChange("monthly_cost_max", parseInt(e.target.value))} 
              disabled={isLocked}
              className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    );
  };

  // 6. Proof
  const renderStep6 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Add Proof (Optional)</label>
        <button 
          onClick={() => handleChange("proofEnabled", !formData.proofEnabled)}
          disabled={isLocked}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.proofEnabled ? 'bg-primary' : 'bg-secondary'} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.proofEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {formData.proofEnabled && (
        <div className="animate-in fade-in slide-in-from-top-2 border border-border p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Proof Type <span className="text-red-500">*</span></label>
            <select 
              value={formData.proofType || ""} 
              onChange={e => handleChange("proofType", e.target.value)}
              disabled={isLocked}
              className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Type</option>
              <option value="screenshot">Anonymized Screenshot</option>
              <option value="case_study">Short Case Study</option>
              <option value="diagram">Workflow Diagram</option>
              <option value="result">Result Metric</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content / URL <span className="text-red-500">*</span></label>
            <input 
              value={formData.proofContent || ""} 
              onChange={e => handleChange("proofContent", e.target.value)} 
              disabled={isLocked}
              className="w-full bg-background border border-border rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Link or description..."
            />
          </div>
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
                  onClick={() => alert("Duplicate logic would go here")} // Placeholder
                  className="text-xs font-bold bg-white border border-amber-300 px-3 py-1.5 rounded-md hover:bg-amber-50 flex items-center gap-1"
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
            <span>Step {step} of 6</span>
            <span>
              {step === 1 && "Basics"}
              {step === 2 && "Deliverables"}
              {step === 3 && "Requirements"}
              {step === 4 && "Delivery & Trust"}
              {step === 5 && "Pricing"}
              {step === 6 && "Proof"}
            </span>
          </div>
          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step/6)*100}%` }} />
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
          {step === 6 && renderStep6()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}
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
            
            {step < 6 ? (
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
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  {loading ? "Publishing..." : "Publish Solution"} <Upload className="w-4 h-4" />
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
