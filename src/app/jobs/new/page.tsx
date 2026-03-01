"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  ArrowRight, 
  ArrowLeft, 
  Crown, 
  CheckCircle2, 
  Loader2,
  Briefcase,
  Layers,
  AlertTriangle,
  ShieldAlert,
  Target,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { createJobPost } from "@/actions/jobs";
import { CheckoutModal } from "@/components/jobs/discovery/CheckoutModal";
import * as C from "./constants";

// --- HELPER COMPONENTS (Moved outside to prevent re-mounting on render) ---

const SingleSelect = ({ 
  label, 
  options, 
  value, 
  onChange, 
  otherValue, 
  onOtherChange, 
  helperText,
  index
}: { 
  label: string, 
  options: string[], 
  value: string, 
  onChange: (val: string) => void,
  otherValue?: string,
  onOtherChange?: (val: string) => void,
  helperText?: string,
  index?: number
}) => (
  <div className="space-y-3 mb-8 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${(index || 0) * 100}ms` }}>
    <label className="block text-lg font-bold text-foreground">
      {label} <span className="text-primary">*</span>
    </label>
    {helperText && <p className="text-sm text-muted-foreground -mt-2 mb-2">{helperText}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          type="button"
          className={`p-3 rounded-lg border text-left text-sm transition-all ${
            value === opt 
              ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" 
              : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
    {(value === "Other" || value === "Yes" || value === "Other (please specify)") && onOtherChange && (
      <input 
        value={otherValue}
        onChange={(e) => onOtherChange(e.target.value)}
        className="w-full mt-2 bg-background border border-border rounded-md px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
        placeholder="Please specify..."
        autoFocus
      />
    )}
  </div>
);

const MultiSelectWithToolNames = ({ 
  label, 
  options, 
  selected, 
  onToggle, 
  toolNames,
  onToolNameChange,
  otherValue, 
  onOtherChange,
  helperText,
  index 
}: { 
  label: string, 
  options: string[], 
  selected: string[], 
  onToggle: (val: string) => void,
  toolNames: Record<string, string>,
  onToolNameChange: (tool: string, name: string) => void,
  otherValue?: string,
  onOtherChange?: (val: string) => void,
  helperText?: string,
  index?: number
}) => (
  <div className="space-y-3 mb-8 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${(index || 0) * 100}ms` }}>
    <label className="block text-lg font-bold text-foreground">
      {label} <span className="text-primary">*</span>
    </label>
    {helperText && <p className="text-sm text-muted-foreground -mt-2 mb-2">{helperText}</p>}
    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Select all that apply</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map(opt => {
        const isSelected = selected.includes(opt);
        return (
          <div key={opt} className="space-y-1">
            <button
              type="button"
              onClick={() => onToggle(opt)}
              className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
                isSelected 
                  ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" 
                  : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt}
            </button>
            {isSelected && opt !== "Other" && (
              <input 
                value={toolNames[opt] || ""}
                onChange={(e) => onToolNameChange(opt, e.target.value)}
                placeholder="Name of tool"
                className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
              />
            )}
          </div>
        );
      })}
    </div>
    {selected.includes("Other") && onOtherChange && (
      <div className="space-y-1">
        <input 
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          className="w-full bg-background border border-border rounded-md px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
          placeholder="Please specify..."
        />
        <input 
          value={toolNames["Other"] || ""}
          onChange={(e) => onToolNameChange("Other", e.target.value)}
          placeholder="Name of tool"
          className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
        />
      </div>
    )}
  </div>
);

const MultiSelect = ({ 
  label, 
  options, 
  selected, 
  onToggle, 
  otherValue, 
  onOtherChange,
  helperText,
  index 
}: { 
  label: string, 
  options: string[], 
  selected: string[], 
  onToggle: (val: string) => void,
  otherValue?: string,
  onOtherChange?: (val: string) => void,
  helperText?: string,
  index?: number
}) => (
  <div className="space-y-3 mb-8 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${(index || 0) * 100}ms` }}>
    <label className="block text-lg font-bold text-foreground">
      {label} <span className="text-primary">*</span>
    </label>
    {helperText && <p className="text-sm text-muted-foreground -mt-2 mb-2">{helperText}</p>}
    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Select all that apply</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map(opt => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            type="button"
            className={`p-3 rounded-lg border text-left text-sm transition-all ${
              isSelected 
                ? "border-primary bg-primary/5 text-primary ring-1 ring-primary" 
                : "border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
    {selected.includes("Other") && onOtherChange && (
      <input 
        value={otherValue}
        onChange={(e) => onOtherChange(e.target.value)}
        className="w-full mt-2 bg-background border border-border rounded-md px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
        placeholder="Please specify..."
        autoFocus
      />
    )}
  </div>
);

const ShortText = ({
  label,
  value,
  onChange,
  helperText,
  placeholder,
  required = true,
  index
}: {
  label: string,
  value: string,
  onChange: (val: string) => void,
  helperText?: string,
  placeholder?: string,
  required?: boolean,
  index?: number
}) => (
  <div className="space-y-3 mb-8 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${(index || 0) * 100}ms` }}>
    <label className="block text-lg font-bold text-foreground">
      {label} {required && <span className="text-primary">*</span>}
    </label>
    {helperText && <p className="text-sm text-muted-foreground -mt-2 mb-2">{helperText}</p>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-24 bg-background border border-border rounded-xl p-4 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-foreground"
      placeholder={placeholder}
    />
  </div>
);

export default function NewJobPage() {
  const [step, setStep] = useState(0); // 0 = Intro
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Section A
    businessModel: "",
    otherBusinessModel: "",
    primaryProducts: [] as string[],
    otherPrimaryProduct: "",
    customerJourney: "",
    otherCustomerJourney: "",
    problemStatement: "", // ONE SENTENCE
    problemLocation: [] as string[],
    otherProblemLocation: "",
    problemDuration: "",
    otherProblemDuration: "",
    problemTrigger: "",
    otherProblemTrigger: "",
    problemContext: "", // OPTIONAL

    // Section B
    processHandling: "",
    otherProcessHandling: "",
    involvedTools: [] as string[],
    involvedToolNames: {} as Record<string, string>,
    otherInvolvedTool: "",
    breakingPoint: "",
    otherBreakingPoint: "",
    affectedParties: [] as string[],
    otherAffectedParty: "",
    sourceOfTruth: "",
    otherSourceOfTruth: "",
    currentProcessDescription: "", // OPTIONAL

    // Section C
    mainImpact: "",
    otherMainImpact: "",
    unsolvedConsequence: "",
    otherUnsolvedConsequence: "",
    criticality: "",
    otherCriticality: "",
    urgencyDriver: "",
    otherUrgencyDriver: "",
    risksConcerns: "", // OPTIONAL

    // Section D (systemAccess/Q22 removed)
    mandatoryTools: "",
    otherMandatoryTool: "",
    immutableSystems: "",
    otherImmutableSystem: "",
    implementer: "",
    otherImplementer: "",
    boundariesConstraints: "", // OPTIONAL

    // Section E
    successLooksLike: [] as string[],
    otherSuccessLooksLike: "",
    priorityOutcome: "",
    otherPriorityOutcome: "",
    successJudgment: "",
    otherSuccessJudgment: "",
    problemSolvedDefinition: "",
    otherProblemSolvedDefinition: "",
    acceptanceProof: "",
    otherAcceptanceProof: "",
    otherExpectations: "", // OPTIONAL

    // Section F
    finalClarifier: "" // OPTIONAL
  });

  const totalSteps = 7; // Intro (0) + 6 Sections (1-6) + Review (7)

  // Generic Handlers
  const handleSingleSelect = (key: string, value: string, otherKey?: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
      ...(otherKey && value !== "Other" && value !== "Yes" ? { [otherKey]: "" } : {})
    }));
  };

  const handleMultiSelect = (key: string, value: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = (formData as any)[key] as string[];
    const isSelected = current.includes(value);
    setFormData(prev => ({
      ...prev,
      [key]: isSelected 
        ? current.filter(item => item !== value)
        : [...current, value]
    }));
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 0: return true; // Intro
      case 1: // Section A
        return !!formData.businessModel && 
               (formData.businessModel !== "Other" || !!formData.otherBusinessModel) &&
               formData.primaryProducts.length > 0 &&
               (!formData.primaryProducts.includes("Other") || !!formData.otherPrimaryProduct) &&
               !!formData.customerJourney &&
               (formData.customerJourney !== "Other" || !!formData.otherCustomerJourney) &&
               !!formData.problemStatement &&
               formData.problemLocation.length > 0 &&
               (!formData.problemLocation.includes("Other") || !!formData.otherProblemLocation) &&
               !!formData.problemDuration &&
               (formData.problemDuration !== "Other" || !!formData.otherProblemDuration) &&
               !!formData.problemTrigger &&
               (formData.problemTrigger !== "Other" || !!formData.otherProblemTrigger);
      case 2: // Section B
        const involvedToolsValid = formData.involvedTools.length > 0 &&
          (!formData.involvedTools.includes("Other") || !!formData.otherInvolvedTool) &&
          formData.involvedTools.every((t: string) => t === "Other" || !!(formData.involvedToolNames[t] || "").trim());
        return !!formData.processHandling &&
               (formData.processHandling !== "Other" || !!formData.otherProcessHandling) &&
               involvedToolsValid &&
               !!formData.breakingPoint &&
               (formData.breakingPoint !== "Other" || !!formData.otherBreakingPoint) &&
               formData.affectedParties.length > 0 &&
               (!formData.affectedParties.includes("Other") || !!formData.otherAffectedParty) &&
               !!formData.sourceOfTruth &&
               (formData.sourceOfTruth !== "Other" || !!formData.otherSourceOfTruth);
      case 3: // Section C
        return !!formData.mainImpact &&
               (formData.mainImpact !== "Other" || !!formData.otherMainImpact) &&
               !!formData.unsolvedConsequence &&
               (formData.unsolvedConsequence !== "Other" || !!formData.otherUnsolvedConsequence) &&
               !!formData.criticality &&
               (formData.criticality !== "Other" || !!formData.otherCriticality) &&
               !!formData.urgencyDriver &&
               (formData.urgencyDriver !== "Yes" || !!formData.otherUrgencyDriver);
      case 4: // Section D (systemAccess/Q22 removed)
        return !!formData.mandatoryTools &&
               (formData.mandatoryTools !== "Yes" || !!formData.otherMandatoryTool) &&
               !!formData.immutableSystems &&
               (formData.immutableSystems !== "Yes" || !!formData.otherImmutableSystem) &&
               !!formData.implementer &&
               (formData.implementer !== "Other" || !!formData.otherImplementer);
      case 5: // Section E
        return formData.successLooksLike.length > 0 &&
               (!formData.successLooksLike.includes("Other") || !!formData.otherSuccessLooksLike) &&
               !!formData.priorityOutcome &&
               (formData.priorityOutcome !== "Other" || !!formData.otherPriorityOutcome) &&
               !!formData.successJudgment &&
               (formData.successJudgment !== "Other" || !!formData.otherSuccessJudgment) &&
               !!formData.problemSolvedDefinition &&
               (formData.problemSolvedDefinition !== "Other" || !!formData.otherProblemSolvedDefinition) &&
               !!formData.acceptanceProof &&
               (formData.acceptanceProof !== "Other" || !!formData.otherAcceptanceProof);
      case 6: // Section F (Optional)
        return true;
      case 7: // Review
        return true;
      default: return false;
    }
  };

  const handleNext = () => {
    setError(null);
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
        window.scrollTo(0, 0); // Kept on section change as it's useful
      } else {
        // Ready to submit
        handleSubmit();
      }
    } else {
      setError("Please complete all required fields to continue.");
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError(null);
    setPending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Helper: resolve "Other" values
    const v  = (val: string, other: string) => val === "Other" || val === "Yes" ? other : val;
    const va = (arr: string[], other: string) => arr.map(i => i === "Other" ? other : i).filter(Boolean);

    // Serialize as BriefV2 JSON so the expert brief displays the full structured Q&A
    const briefData = {
      version: "2",
      sections: [
        {
          id: "A",
          title: "Business Context & Problem",
          subtitle: "What the business does and the core issue to solve",
          qa: [
            { q: "What best describes your business?",       a: v(formData.businessModel, formData.otherBusinessModel) },
            { q: "What do you primarily sell?",              a: va(formData.primaryProducts, formData.otherPrimaryProduct) },
            { q: "Primary customer journey",                 a: v(formData.customerJourney, formData.otherCustomerJourney) },
            { q: "Problem to solve",                         a: formData.problemStatement },
            { q: "Where does this problem show up?",         a: va(formData.problemLocation, formData.otherProblemLocation) },
            { q: "How long has this problem existed?",       a: v(formData.problemDuration, formData.otherProblemDuration) },
            { q: "What triggers or exposes this problem?",   a: v(formData.problemTrigger, formData.otherProblemTrigger) },
            ...(formData.problemContext ? [{ q: "Additional context", a: formData.problemContext }] : []),
          ],
        },
        {
          id: "B",
          title: "Current Process",
          subtitle: "How it works — or breaks — today",
          qa: [
            { q: "How is this process handled right now?",   a: v(formData.processHandling, formData.otherProcessHandling) },
            { q: "Which tools are involved?",                a: formData.involvedTools.map((t: string) => t === "Other" ? formData.otherInvolvedTool : (formData.involvedToolNames[t] ? `${t} (${formData.involvedToolNames[t]})` : t)).filter(Boolean) },
            { q: "Where does this process slow down?",       a: v(formData.breakingPoint, formData.otherBreakingPoint) },
            { q: "Who is most affected?",                    a: va(formData.affectedParties, formData.otherAffectedParty) },
            { q: "Source of truth for this process",         a: v(formData.sourceOfTruth, formData.otherSourceOfTruth) },
            ...(formData.currentProcessDescription ? [{ q: "Process description", a: formData.currentProcessDescription }] : []),
          ],
        },
        {
          id: "C",
          title: "Impact & Risk",
          subtitle: "Why this matters and what's at stake",
          qa: [
            { q: "Main impact of this problem",              a: v(formData.mainImpact, formData.otherMainImpact) },
            { q: "What happens if not solved?",              a: v(formData.unsolvedConsequence, formData.otherUnsolvedConsequence) },
            { q: "How critical is this to the business?",    a: v(formData.criticality, formData.otherCriticality) },
            { q: "Deadline or urgency driver",               a: formData.urgencyDriver === "Yes" ? `Yes — ${formData.otherUrgencyDriver}` : formData.urgencyDriver },
            ...(formData.risksConcerns ? [{ q: "Risks or concerns", a: formData.risksConcerns }] : []),
          ],
        },
        {
          id: "D",
          title: "Constraints & Boundaries",
          subtitle: "What experts must respect",
          qa: [
            { q: "Tools that must be used",                  a: formData.mandatoryTools === "Yes" ? `Yes — ${formData.otherMandatoryTool}` : formData.mandatoryTools },
            { q: "Systems that must NOT be changed",         a: formData.immutableSystems === "Yes" ? `Yes — ${formData.otherImmutableSystem}` : formData.immutableSystems },
            { q: "Who will implement the solution?",         a: v(formData.implementer, formData.otherImplementer) },
            ...(formData.boundariesConstraints ? [{ q: "Additional boundaries", a: formData.boundariesConstraints }] : []),
          ],
        },
        {
          id: "E",
          title: "Outcome & Success Criteria",
          subtitle: "What done looks like",
          qa: [
            { q: "What does a successful solution look like?",          a: va(formData.successLooksLike, formData.otherSuccessLooksLike) },
            { q: "Which outcome matters most?",                         a: v(formData.priorityOutcome, formData.otherPriorityOutcome) },
            { q: "How will you judge success?",                         a: v(formData.successJudgment, formData.otherSuccessJudgment) },
            { q: 'What would make you say "this solved my problem"?',   a: v(formData.problemSolvedDefinition, formData.otherProblemSolvedDefinition) },
            { q: "Required proof of completion",                        a: v(formData.acceptanceProof, formData.otherAcceptanceProof) },
            ...(formData.otherExpectations ? [{ q: "Additional expectations", a: formData.otherExpectations }] : []),
          ],
        },
        ...(formData.finalClarifier ? [{
          id: "F",
          title: "Final Clarifier",
          subtitle: "Extra context from the business owner",
          qa: [{ q: "Anything else that would help experts?", a: formData.finalClarifier }],
        }] : []),
      ],
    };

    const payload = new FormData();
    payload.append("title", `Custom Project: ${formData.problemStatement.slice(0, 60)}${formData.problemStatement.length > 60 ? "…" : ""}`);
    payload.append("goal", JSON.stringify(briefData));
    payload.append("budgetRange", "Custom Quote Required");
    payload.append("timeline", formData.urgencyDriver === "Yes" ? formData.otherUrgencyDriver || "Urgent" : formData.urgencyDriver || "To be discussed");
    payload.append("category", "Custom Project");
    const toolsWithNames = formData.involvedTools.map((t: string) => t === "Other" ? formData.otherInvolvedTool : (formData.involvedToolNames[t] ? `${t} (${formData.involvedToolNames[t]})` : t)).filter(Boolean);
    payload.append("tools", toolsWithNames.join(", "));

    const result = await createJobPost(null, payload);

    if (result.success && result.jobId) {
      setPendingJobId(result.jobId);
      setPending(false);
      setShowPaymentModal(true);
    } else {
      setPending(false);
      toast.error(result.error || "Something went wrong.", { duration: 4000 });
      setError(result.error || "Something went wrong.");
    }
  };

  // --- SECTIONS RENDER ---

  const renderIntro = () => (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Describe it once. Get it built right.</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Custom Project &middot; &euro;100 one-time &middot; Max 3 tailored proposals
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You know what needs to change. Post your requirement &mdash; Elite experts compete for the job with tailored proposals, not generic advice.
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left: What you get */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">What you get</p>
            <ul className="space-y-2.5">
              {[
                "Your team stops doing manually what should have been automated a long time ago.",
                "The problem you describe is the exact problem that gets solved",
                "You leave with a live, working automation \u2014 not a plan or a prototype",
                "Know your total cost upfront \u2014 implementation and monthly running costs, itemised",
                "Nothing ships without your sign-off \u2014 you stay in control at every step",
                "Every proposal you receive is built for your tools and process.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Pricing + CTA */}
          <div className="flex flex-col gap-4">
            <div className="bg-secondary/40 rounded-xl p-5 border border-border">
              <div className="text-2xl font-bold text-foreground mb-0.5">&euro;100</div>
              <div className="text-xs text-muted-foreground mb-3">One-time posting fee</div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                  Max 3 bids &mdash; less noise, higher intent
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                  75% refund if no proposal meets your criteria
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                  Mutual NDA before any data is shared
                </li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-600 dark:text-blue-400">
              Not sure what to automate yet?{" "}
              <Link href="/jobs/discovery" className="underline font-medium">
                Start with a Discovery Scan instead.
              </Link>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              Post My Custom Project <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-xs text-muted-foreground text-center -mt-1">75% refund if no proposal meets your criteria</p>
          </div>
        </div>

      </div>
    </div>
  );
  const renderSectionA = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Business Context & Problem</h2>
          <p className="text-sm text-muted-foreground">Define the core issue.</p>
        </div>
      </div>

      <SingleSelect label="1. What best describes your business?" options={C.BUSINESS_MODELS} value={formData.businessModel} onChange={(v) => handleSingleSelect("businessModel", v, "otherBusinessModel")} otherValue={formData.otherBusinessModel} onOtherChange={(v) => handleChange("otherBusinessModel", v)} index={0} />
      <MultiSelect label="2. What do you primarily sell?" options={C.PRIMARY_PRODUCTS} selected={formData.primaryProducts} onToggle={(v) => handleMultiSelect("primaryProducts", v)} otherValue={formData.otherPrimaryProduct} onOtherChange={(v) => handleChange("otherPrimaryProduct", v)} index={1} />
      <SingleSelect label="3. What is your primary customer journey?" options={C.CUSTOMER_JOURNEY} value={formData.customerJourney} onChange={(v) => handleSingleSelect("customerJourney", v, "otherCustomerJourney")} otherValue={formData.otherCustomerJourney} onOtherChange={(v) => handleChange("otherCustomerJourney", v)} helperText="This helps experts understand where the problem sits in your flow." index={2} />
      <ShortText label="4. In one sentence, what problem are you trying to solve?" value={formData.problemStatement} onChange={(v) => handleChange("problemStatement", v)} helperText="Describe what is not working today, not how you think it should be fixed." placeholder="e.g. Leads from LinkedIn are not getting into our CRM automatically." index={3} />
      <MultiSelect label="5. Where does this problem show up in your business?" options={C.PROBLEM_LOCATION} selected={formData.problemLocation} onToggle={(v) => handleMultiSelect("problemLocation", v)} otherValue={formData.otherProblemLocation} onOtherChange={(v) => handleChange("otherProblemLocation", v)} index={4} />
      <SingleSelect label="6. How long has this problem existed?" options={C.PROBLEM_DURATION} value={formData.problemDuration} onChange={(v) => handleSingleSelect("problemDuration", v, "otherProblemDuration")} otherValue={formData.otherProblemDuration} onOtherChange={(v) => handleChange("otherProblemDuration", v)} index={5} />
      <SingleSelect label="7. What usually triggers or exposes this problem?" options={C.PROBLEM_TRIGGER} value={formData.problemTrigger} onChange={(v) => handleSingleSelect("problemTrigger", v, "otherProblemTrigger")} otherValue={formData.otherProblemTrigger} onOtherChange={(v) => handleChange("otherProblemTrigger", v)} index={6} />
      <ShortText label="8. Optional — Anything else about this problem that feels important?" value={formData.problemContext} onChange={(v) => handleChange("problemContext", v)} required={false} helperText="Add context that helps experts understand the situation better." placeholder="Context..." index={7} />
    </div>
  );

  const renderSectionB = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Current Process</h2>
          <p className="text-sm text-muted-foreground">How it works (or breaks) today.</p>
        </div>
      </div>

      <SingleSelect label="9. How is this process handled right now?" options={C.PROCESS_HANDLING} value={formData.processHandling} onChange={(v) => handleSingleSelect("processHandling", v, "otherProcessHandling")} otherValue={formData.otherProcessHandling} onOtherChange={(v) => handleChange("otherProcessHandling", v)} index={0} />
      <MultiSelectWithToolNames label="10. Which tools are involved in this process?" options={C.INVOLVED_TOOLS} selected={formData.involvedTools} onToggle={(v) => handleMultiSelect("involvedTools", v)} toolNames={formData.involvedToolNames} onToolNameChange={(tool, name) => setFormData(prev => ({ ...prev, involvedToolNames: { ...prev.involvedToolNames, [tool]: name } }))} otherValue={formData.otherInvolvedTool} onOtherChange={(v) => handleChange("otherInvolvedTool", v)} helperText="Specify the exact tool name (e.g. HubSpot, Salesforce) for each selected option." index={1} />
      <SingleSelect label="11. Where does this process usually slow down or break?" options={C.BREAKING_POINT} value={formData.breakingPoint} onChange={(v) => handleSingleSelect("breakingPoint", v, "otherBreakingPoint")} otherValue={formData.otherBreakingPoint} onOtherChange={(v) => handleChange("otherBreakingPoint", v)} index={2} />
      <MultiSelect label="12. Who is most affected by this problem?" options={C.AFFECTED_PARTIES} selected={formData.affectedParties} onToggle={(v) => handleMultiSelect("affectedParties", v)} otherValue={formData.otherAffectedParty} onOtherChange={(v) => handleChange("otherAffectedParty", v)} index={3} />
      <SingleSelect label="13. What is the current “source of truth” for this process?" options={C.SOURCE_OF_TRUTH} value={formData.sourceOfTruth} onChange={(v) => handleSingleSelect("sourceOfTruth", v, "otherSourceOfTruth")} otherValue={formData.otherSourceOfTruth} onOtherChange={(v) => handleChange("otherSourceOfTruth", v)} helperText="This is where the most reliable data for this workflow lives today." index={4} />
      <ShortText label="14. Optional — Describe the current process in your own words" value={formData.currentProcessDescription} onChange={(v) => handleChange("currentProcessDescription", v)} required={false} helperText="A brief explanation is enough. Bullet points are fine." placeholder="Step 1... Step 2..." index={5} />
    </div>
  );

  const renderSectionC = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Impact & Risk</h2>
          <p className="text-sm text-muted-foreground">Why this matters.</p>
        </div>
      </div>

      <SingleSelect label="15. What is the main impact of this problem?" options={C.MAIN_IMPACT} value={formData.mainImpact} onChange={(v) => handleSingleSelect("mainImpact", v, "otherMainImpact")} otherValue={formData.otherMainImpact} onOtherChange={(v) => handleChange("otherMainImpact", v)} index={0} />
      <SingleSelect label="16. What happens if this problem is not solved?" options={C.UNSOLVED_CONSEQUENCE} value={formData.unsolvedConsequence} onChange={(v) => handleSingleSelect("unsolvedConsequence", v, "otherUnsolvedConsequence")} otherValue={formData.otherUnsolvedConsequence} onOtherChange={(v) => handleChange("otherUnsolvedConsequence", v)} index={1} />
      <SingleSelect label="17. How critical is this problem to the business?" options={C.CRITICALITY} value={formData.criticality} onChange={(v) => handleSingleSelect("criticality", v, "otherCriticality")} otherValue={formData.otherCriticality} onOtherChange={(v) => handleChange("otherCriticality", v)} index={2} />
      <SingleSelect label="18. Is there a deadline or event driving urgency?" options={C.URGENCY_DRIVER} value={formData.urgencyDriver} onChange={(v) => handleSingleSelect("urgencyDriver", v, "otherUrgencyDriver")} otherValue={formData.otherUrgencyDriver} onOtherChange={(v) => handleChange("otherUrgencyDriver", v)} helperText="For example: seasonal peak, funding milestone, hiring freeze, launch date." index={3} />
      <ShortText label="19. Optional — Any risks or concerns experts should be aware of?" value={formData.risksConcerns} onChange={(v) => handleChange("risksConcerns", v)} required={false} helperText="For example: customer impact, internal pressure, deadlines, or dependencies." index={4} />
    </div>
  );

  const renderSectionD = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Constraints & Boundaries</h2>
          <p className="text-sm text-muted-foreground">What experts must respect.</p>
        </div>
      </div>

      <SingleSelect label="20. Are there tools that must be used?" options={C.MANDATORY_TOOLS} value={formData.mandatoryTools} onChange={(v) => handleSingleSelect("mandatoryTools", v, "otherMandatoryTool")} otherValue={formData.otherMandatoryTool} onOtherChange={(v) => handleChange("otherMandatoryTool", v)} index={0} />
      <SingleSelect label="21. Are there tools or systems that must NOT be changed?" options={C.IMMUTABLE_SYSTEMS} value={formData.immutableSystems} onChange={(v) => handleSingleSelect("immutableSystems", v, "otherImmutableSystem")} otherValue={formData.otherImmutableSystem} onOtherChange={(v) => handleChange("otherImmutableSystem", v)} index={1} />
      <SingleSelect label="22. Who will implement the solution?" options={C.IMPLEMENTER} value={formData.implementer} onChange={(v) => handleSingleSelect("implementer", v, "otherImplementer")} otherValue={formData.otherImplementer} onOtherChange={(v) => handleChange("otherImplementer", v)} helperText="This affects how the solution is documented and delivered." index={2} />
      <ShortText label="24. Optional — Any boundaries or constraints we should respect?" value={formData.boundariesConstraints} onChange={(v) => handleChange("boundariesConstraints", v)} required={false} helperText="For example: security policies, internal rules, or things you don’t want touched." index={4} />
    </div>
  );

  const renderSectionE = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Outcome & Success Criteria</h2>
          <p className="text-sm text-muted-foreground">What done looks like.</p>
        </div>
      </div>

      <MultiSelect label="25. What does a successful solution look like for you?" options={C.SUCCESS_LOOKS_LIKE} selected={formData.successLooksLike} onToggle={(v) => handleMultiSelect("successLooksLike", v)} otherValue={formData.otherSuccessLooksLike} onOtherChange={(v) => handleChange("otherSuccessLooksLike", v)} index={0} />
      <SingleSelect label="26. Which outcome matters most?" options={C.PRIORITY_OUTCOME} value={formData.priorityOutcome} onChange={(v) => handleSingleSelect("priorityOutcome", v, "otherPriorityOutcome")} otherValue={formData.otherPriorityOutcome} onOtherChange={(v) => handleChange("otherPriorityOutcome", v)} index={1} />
      <SingleSelect label="27. How will you personally judge if this was successful?" options={C.SUCCESS_JUDGMENT} value={formData.successJudgment} onChange={(v) => handleSingleSelect("successJudgment", v, "otherSuccessJudgment")} otherValue={formData.otherSuccessJudgment} onOtherChange={(v) => handleChange("otherSuccessJudgment", v)} index={2} />
      <SingleSelect label="28. What would make you say “this solved my problem”?" options={C.PROBLEM_SOLVED_DEFINITION} value={formData.problemSolvedDefinition} onChange={(v) => handleSingleSelect("problemSolvedDefinition", v, "otherProblemSolvedDefinition")} otherValue={formData.otherProblemSolvedDefinition} onOtherChange={(v) => handleChange("otherProblemSolvedDefinition", v)} index={3} />
      <SingleSelect label="29. What level of proof do you expect before accepting the solution?" options={C.ACCEPTANCE_PROOF} value={formData.acceptanceProof} onChange={(v) => handleSingleSelect("acceptanceProof", v, "otherAcceptanceProof")} otherValue={formData.otherAcceptanceProof} onOtherChange={(v) => handleChange("otherAcceptanceProof", v)} helperText="This prevents misunderstandings about what “done” means." index={4} />
      <ShortText label="30. Optional — Anything else experts should aim for?" value={formData.otherExpectations} onChange={(v) => handleChange("otherExpectations", v)} required={false} helperText="If there’s a specific expectation or concern, you can mention it here." index={5} />
    </div>
  );

  const renderSectionF = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Final Clarifier</h2>
          <p className="text-sm text-muted-foreground">One last check before submission.</p>
        </div>
      </div>

      <ShortText 
        label="31. Is there anything else that would help experts understand your situation?" 
        value={formData.finalClarifier} 
        onChange={(v) => handleChange("finalClarifier", v)} 
        required={false} 
        helperText="Share anything you think is relevant. Even small details can help experts propose better solutions." 
        index={0}
      />
    </div>
  );

  const renderReview = () => {
    const v  = (val: string, other: string) => (val === "Other" || val === "Yes") && other ? other : val;
    const va = (arr: string[], other: string) => arr.map(i => i === "Other" ? other : i).filter(Boolean);
    const rows: { label: string; value: string | string[] }[] = [
      { label: "Problem",          value: formData.problemStatement },
      { label: "Business model",   value: v(formData.businessModel, formData.otherBusinessModel) },
      { label: "Products / services", value: va(formData.primaryProducts, formData.otherPrimaryProduct) },
      { label: "Current process",  value: v(formData.processHandling, formData.otherProcessHandling) },
      { label: "Tools involved",   value: formData.involvedTools.map((t: string) => t === "Other" ? formData.otherInvolvedTool : (formData.involvedToolNames[t] ? `${t} (${formData.involvedToolNames[t]})` : t)).filter(Boolean) },
      { label: "Main impact",      value: v(formData.mainImpact, formData.otherMainImpact) },
      { label: "Urgency",          value: formData.urgencyDriver === "Yes" ? `Yes — ${formData.otherUrgencyDriver}` : formData.urgencyDriver },
      { label: "Success looks like", value: va(formData.successLooksLike, formData.otherSuccessLooksLike) },
      { label: "Priority outcome", value: v(formData.priorityOutcome, formData.otherPriorityOutcome) },
      ...(formData.finalClarifier ? [{ label: "Final clarifier", value: formData.finalClarifier }] : []),
    ];
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold mb-1">Review your brief</h2>
          <p className="text-sm text-muted-foreground">This is exactly what experts will see. Confirm everything looks correct before paying.</p>
        </div>
        <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-4 px-4 py-3 text-sm">
              <span className="text-muted-foreground w-36 shrink-0 font-medium">{row.label}</span>
              <span className="flex-1 text-foreground">
                {Array.isArray(row.value)
                  ? row.value.length > 0 ? row.value.join(", ") : <span className="text-muted-foreground italic">Not provided</span>
                  : row.value || <span className="text-muted-foreground italic">Not provided</span>}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground text-center pt-2">
          You can go back and edit any answer before paying.
        </p>
      </div>
    );
  };

  return (
    <>
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {step === 0 ? (
        renderIntro()
      ) : (
        <>
          <div className="mb-8">
            <div className="flex justify-between text-xs uppercase tracking-wider text-muted-foreground mb-2">
              <span>Custom Project Wizard</span>
              <span>Step {step} of {totalSteps}</span>
            </div>
            <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out" 
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          <form className="bg-card border border-border rounded-xl p-6 md:p-10 shadow-xl relative min-h-[400px]">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div className="mb-8">
              {step === 1 && renderSectionA()}
              {step === 2 && renderSectionB()}
              {step === 3 && renderSectionC()}
              {step === 4 && renderSectionD()}
              {step === 5 && renderSectionE()}
              {step === 6 && renderSectionF()}
              {step === 7 && renderReview()}
            </div>

            <div className="bg-secondary/30 p-4 rounded-lg border border-border mb-6">
              <p className="text-xs text-muted-foreground text-center">
                By proceeding, you enter a legally binding <strong>Mutual NDA</strong>. 
                All data and logic shared are protected by LogicLot protocols.
              </p>
            </div>

            <div className="flex justify-between border-t border-border pt-6">
              <button 
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              
              <button 
                type="button"
                onClick={handleNext}
                disabled={pending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {step === totalSteps ? (
                  pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : "Confirm & Pay →"
                ) : step === totalSteps - 1 ? (
                  <>Review my brief <ArrowRight className="w-4 h-4" /></>
                ) : (
                  <>Next Step <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>

      {showPaymentModal && pendingJobId && (
        <CheckoutModal
          jobId={pendingJobId}
          type="custom"
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );
}
