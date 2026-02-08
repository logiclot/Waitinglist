"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  ArrowLeft, 
  Crown, 
  CheckCircle2, 
  Search, 
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
import * as C from "./constants";

export default function NewJobPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = Intro
  const [pending, setPending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

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

    // Section D
    mandatoryTools: "",
    otherMandatoryTool: "",
    immutableSystems: "",
    otherImmutableSystem: "",
    systemAccess: "",
    otherSystemAccess: "",
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

  const totalSteps = 6; // Intro (0) + 6 Sections (1-6)

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
        return !!formData.processHandling &&
               (formData.processHandling !== "Other" || !!formData.otherProcessHandling) &&
               formData.involvedTools.length > 0 &&
               (!formData.involvedTools.includes("Other") || !!formData.otherInvolvedTool) &&
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
      case 4: // Section D
        return !!formData.mandatoryTools &&
               (formData.mandatoryTools !== "Yes" || !!formData.otherMandatoryTool) &&
               !!formData.immutableSystems &&
               (formData.immutableSystems !== "Yes" || !!formData.otherImmutableSystem) &&
               !!formData.systemAccess &&
               (formData.systemAccess !== "Other" || !!formData.otherSystemAccess) &&
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
      default: return false;
    }
  };

  const handleNext = () => {
    setError(null);
    if (validateStep(step)) {
      if (step < totalSteps) {
        setStep(step + 1);
        window.scrollTo(0, 0);
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
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Serialize data
    const serializedData = `
# CUSTOM PROJECT WIZARD REPORT

## SECTION A: Business Context & Problem
- Model: ${formData.businessModel === "Other" ? formData.otherBusinessModel : formData.businessModel}
- Products: ${formData.primaryProducts.map(p => p === "Other" ? formData.otherPrimaryProduct : p).join(", ")}
- Customer Journey: ${formData.customerJourney === "Other" ? formData.otherCustomerJourney : formData.customerJourney}
- PROBLEM STATEMENT: "${formData.problemStatement}"
- Location: ${formData.problemLocation.map(l => l === "Other" ? formData.otherProblemLocation : l).join(", ")}
- Duration: ${formData.problemDuration === "Other" ? formData.otherProblemDuration : formData.problemDuration}
- Trigger: ${formData.problemTrigger === "Other" ? formData.otherProblemTrigger : formData.problemTrigger}
- Context: ${formData.problemContext || "None provided"}

## SECTION B: Current Process
- Handling: ${formData.processHandling === "Other" ? formData.otherProcessHandling : formData.processHandling}
- Tools: ${formData.involvedTools.map(t => t === "Other" ? formData.otherInvolvedTool : t).join(", ")}
- Breaking Point: ${formData.breakingPoint === "Other" ? formData.otherBreakingPoint : formData.breakingPoint}
- Affected: ${formData.affectedParties.map(a => a === "Other" ? formData.otherAffectedParty : a).join(", ")}
- Source of Truth: ${formData.sourceOfTruth === "Other" ? formData.otherSourceOfTruth : formData.sourceOfTruth}
- Description: ${formData.currentProcessDescription || "None provided"}

## SECTION C: Impact & Risk
- Main Impact: ${formData.mainImpact === "Other" ? formData.otherMainImpact : formData.mainImpact}
- Consequence: ${formData.unsolvedConsequence === "Other" ? formData.otherUnsolvedConsequence : formData.unsolvedConsequence}
- Criticality: ${formData.criticality === "Other" ? formData.otherCriticality : formData.criticality}
- Urgency: ${formData.urgencyDriver === "Yes" ? `YES - ${formData.otherUrgencyDriver}` : formData.urgencyDriver}
- Risks: ${formData.risksConcerns || "None provided"}

## SECTION D: Constraints
- Mandatory Tools: ${formData.mandatoryTools === "Yes" ? `YES - ${formData.otherMandatoryTool}` : formData.mandatoryTools}
- Immutable Systems: ${formData.immutableSystems === "Yes" ? `YES - ${formData.otherImmutableSystem}` : formData.immutableSystems}
- Access: ${formData.systemAccess === "Other" ? formData.otherSystemAccess : formData.systemAccess}
- Implementer: ${formData.implementer === "Other" ? formData.otherImplementer : formData.implementer}
- Boundaries: ${formData.boundariesConstraints || "None provided"}

## SECTION E: Success Criteria
- Success Looks Like: ${formData.successLooksLike.map(s => s === "Other" ? formData.otherSuccessLooksLike : s).join(", ")}
- Top Priority: ${formData.priorityOutcome === "Other" ? formData.otherPriorityOutcome : formData.priorityOutcome}
- Success Judgment: ${formData.successJudgment === "Other" ? formData.otherSuccessJudgment : formData.successJudgment}
- "Solved" Definition: ${formData.problemSolvedDefinition === "Other" ? formData.otherProblemSolvedDefinition : formData.problemSolvedDefinition}
- Proof Required: ${formData.acceptanceProof === "Other" ? formData.otherAcceptanceProof : formData.acceptanceProof}
- Other Expectations: ${formData.otherExpectations || "None provided"}

## SECTION F: Final Clarifier
${formData.finalClarifier || "None provided."}
    `;

    const payload = new FormData();
    payload.append("title", `Custom Project: ${formData.businessModel}`); // Or maybe prompt for a title? Sticking to generated for consistency/ease
    payload.append("goal", serializedData);
    // Since we don't have budget/timeline in the wizard explicitly as drop-downs in the new spec, 
    // we set defaults or extract if we added them. The spec didn't ask for them explicitly in questions 
    // but the DB requires them. We can infer or set placeholders.
    // Actually, "Implementation Budget Range" and "Timeline" were in the OLD form. 
    // The new wizard asks about constraints/urgency but not a strict budget dropdown.
    // We will set them to "To be discussed" or similar if the DB allows, or map reasonably.
    // Checking schema... JobPost requires budgetRange and timeline strings.
    payload.append("budgetRange", "Custom Quote Required");
    payload.append("timeline", "See Urgency Section");
    payload.append("category", "Custom Project");
    payload.append("tools", formData.involvedTools.join(", "));

    const result = await createJobPost(payload);

    if (result.success) {
      router.push(`/jobs/${result.jobId}`);
    } else {
      setPending(false);
      setError(result.error || "Something went wrong.");
    }
  };

  // --- RENDER HELPERS ---

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

  // --- SECTIONS RENDER ---

  const renderIntro = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
             <Crown className="h-8 w-8 text-primary" /> Custom Project Request
          </h1>
          <p className="text-muted-foreground text-center text-lg max-w-xl mx-auto mb-8">
            Describe one specific problem using our guided diagnostic wizard. Elite experts will respond with tailored bids.
          </p>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8 text-sm text-blue-700 dark:text-blue-400">
            <strong>Clarification:</strong> This is for focused problems where you already know what isn’t working. 
            If you’re unsure what to automate, <Link href="/jobs/discovery" className="underline hover:text-blue-600 font-medium">start with a Discovery Scan instead.</Link>
          </div>

          <h3 className="font-bold text-lg mb-4">What happens next:</h3>
          <ul className="space-y-3 mb-8">
            <li className="flex gap-3 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              Scope alignment
            </li>
            <li className="flex gap-3 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              Live demo & walkthrough
            </li>
            <li className="flex gap-3 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              Implementation in your environment
            </li>
            <li className="flex gap-3 text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              Review & approve
            </li>
          </ul>

          <div className="flex flex-col items-center gap-4 bg-secondary/30 p-6 rounded-xl border border-border mb-8">
             <div className="text-center">
                <div className="text-2xl font-bold text-foreground">€100 one-time posting fee</div>
                <div className="text-sm text-muted-foreground">75% refund if unresolved</div>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setStep(1)}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 w-full sm:w-auto"
            >
              Start Custom Project Wizard <ArrowRight className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-3 font-medium">
            Concrete proposals, not generic advice.
          </p>
        </div>

        {/* Secondary: Search (moved below) */}
        <div className="border-t border-border pt-8 mt-8">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-4">Or search for something ready-made:</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input
                type="text"
                placeholder="e.g. HubSpot to Slack sync"
                className="flex-grow bg-background border border-border rounded-md px-3 py-2 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Link
                href={`/solutions?q=${searchQuery}`}
                className="px-4 py-2 border border-border bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-md font-medium transition-colors flex items-center justify-center gap-2 text-sm whitespace-nowrap"
              >
                <Search className="h-4 w-4" /> Browse Solutions
              </Link>
            </div>
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
      <MultiSelect label="10. Which tools are involved in this process?" options={C.INVOLVED_TOOLS} selected={formData.involvedTools} onToggle={(v) => handleMultiSelect("involvedTools", v)} otherValue={formData.otherInvolvedTool} onOtherChange={(v) => handleChange("otherInvolvedTool", v)} index={1} />
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
      <SingleSelect label="22. What level of system access is acceptable?" options={C.SYSTEM_ACCESS} value={formData.systemAccess} onChange={(v) => handleSingleSelect("systemAccess", v, "otherSystemAccess")} otherValue={formData.otherSystemAccess} onOtherChange={(v) => handleChange("otherSystemAccess", v)} index={2} />
      <SingleSelect label="23. Who will implement the solution?" options={C.IMPLEMENTER} value={formData.implementer} onChange={(v) => handleSingleSelect("implementer", v, "otherImplementer")} otherValue={formData.otherImplementer} onOtherChange={(v) => handleChange("otherImplementer", v)} helperText="This affects how the solution is documented and delivered." index={3} />
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

  return (
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
                  pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : "Submit Request"
                ) : (
                  <>Next Step <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
