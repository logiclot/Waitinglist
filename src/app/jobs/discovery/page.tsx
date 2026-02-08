"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  ArrowLeft, 
  Briefcase,
  Layers,
  AlertTriangle,
  ShieldAlert,
  Target,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { createDiscoveryJobPost } from "@/actions/jobs";
import { CheckoutModal } from "@/components/jobs/discovery/CheckoutModal";
import * as C from "./constants";

export default function DiscoveryWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = Intro
  const [pending, setPending] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State - Mapping to new structure
  // We'll serialize this into the "goal" field for the backend
  const [formData, setFormData] = useState({
    // Section A
    businessModel: "",
    otherBusinessModel: "",
    primaryProducts: [] as string[],
    otherPrimaryProduct: "",
    companySize: "",
    otherCompanySize: "",

    // Section B
    customerChannels: [] as string[],
    otherCustomerChannel: "",
    conversionMechanism: "",
    otherConversionMechanism: "",
    workTriggers: [] as string[],
    otherWorkTrigger: "",
    revenueTracking: "",
    otherRevenueTracking: "",
    revenuePredictability: "",
    scalingImpact: "",
    otherScalingImpact: "",
    handoffPoints: [] as string[],
    otherHandoffPoint: "",

    // Section C
    coreTools: [] as string[],
    otherCoreTool: "",
    sourceOfTruth: "",
    otherSourceOfTruth: "",
    automationStatus: "",

    // Section D
    manualTimeDrains: [] as string[],
    otherManualTimeDrain: "",
    errorProneTasks: [] as string[],
    otherErrorProneTask: "",
    delayPoints: [] as string[],
    otherDelayPoint: "",
    operationsVisibility: "",
    otherOperationsVisibility: "",

    // Section E
    systemAccess: "",
    complianceConstraints: [] as string[],
    otherComplianceConstraint: "",
    environments: [] as string[],
    otherEnvironment: "",
    vendorConstraints: "",
    vendorConstraintDetails: "", // If "Yes"

    // Section F
    successMetrics: [] as string[],
    otherSuccessMetric: "",
    primaryOutcome: "",
    otherPrimaryOutcome: "",
    inactionConsequence: "",
    otherInactionConsequence: "",
    proposalCriteria: [] as string[],
    otherProposalCriteria: "",

    // Section G
    finalClarifier: ""
  });

  const totalSteps = 7; // Intro (0) + 6 Sections (1-6) + Final (7) = 8 actual UI steps

  // Generic Handlers
  const handleSingleSelect = (key: string, value: string, otherKey?: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
      // Clear specific "other" text if main value is not "Other" or "Yes" (for vendor)
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
               !!formData.companySize &&
               (formData.companySize !== "Other" || !!formData.otherCompanySize);
      case 2: // Section B
        return formData.customerChannels.length > 0 &&
               (!formData.customerChannels.includes("Other") || !!formData.otherCustomerChannel) &&
               !!formData.conversionMechanism &&
               (formData.conversionMechanism !== "Other" || !!formData.otherConversionMechanism) &&
               formData.workTriggers.length > 0 &&
               (!formData.workTriggers.includes("Other") || !!formData.otherWorkTrigger) &&
               !!formData.revenueTracking &&
               (formData.revenueTracking !== "Other" || !!formData.otherRevenueTracking) &&
               !!formData.revenuePredictability &&
               !!formData.scalingImpact &&
               (formData.scalingImpact !== "Other" || !!formData.otherScalingImpact) &&
               formData.handoffPoints.length > 0 &&
               (!formData.handoffPoints.includes("Other") || !!formData.otherHandoffPoint);
      case 3: // Section C
        return formData.coreTools.length > 0 &&
               (!formData.coreTools.includes("Other") || !!formData.otherCoreTool) &&
               !!formData.sourceOfTruth &&
               (formData.sourceOfTruth !== "Other" || !!formData.otherSourceOfTruth) &&
               !!formData.automationStatus;
      case 4: // Section D
        return formData.manualTimeDrains.length > 0 &&
               (!formData.manualTimeDrains.includes("Other") || !!formData.otherManualTimeDrain) &&
               formData.errorProneTasks.length > 0 &&
               (!formData.errorProneTasks.includes("Other") || !!formData.otherErrorProneTask) &&
               formData.delayPoints.length > 0 &&
               (!formData.delayPoints.includes("Other") || !!formData.otherDelayPoint) &&
               !!formData.operationsVisibility &&
               (formData.operationsVisibility !== "Other" || !!formData.otherOperationsVisibility);
      case 5: // Section E
        return !!formData.systemAccess &&
               formData.complianceConstraints.length > 0 &&
               (!formData.complianceConstraints.includes("Other") || !!formData.otherComplianceConstraint) &&
               formData.environments.length > 0 &&
               (!formData.environments.includes("Other") || !!formData.otherEnvironment) &&
               !!formData.vendorConstraints &&
               (formData.vendorConstraints !== "Yes" || !!formData.vendorConstraintDetails);
      case 6: // Section F
        return formData.successMetrics.length > 0 &&
               (!formData.successMetrics.includes("Other") || !!formData.otherSuccessMetric) &&
               !!formData.primaryOutcome &&
               (formData.primaryOutcome !== "Other" || !!formData.otherPrimaryOutcome) &&
               !!formData.inactionConsequence &&
               (formData.inactionConsequence !== "Other" || !!formData.otherInactionConsequence) &&
               formData.proposalCriteria.length > 0 &&
               (!formData.proposalCriteria.includes("Other") || !!formData.otherProposalCriteria);
      case 7: // Section G (Optional)
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
        setShowPaymentModal(true);
      }
    } else {
      setError("Please complete all required fields to continue.");
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 0) setStep(step - 1);
  };

  const handlePaymentAndSubmit = async () => {
    setError(null);
    setPending(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Serialize all data into a readable format for the expert
    // We'll store this in the 'goal' field of JobPost since it's a large text block
    const serializedData = `
# DISCOVERY SCAN REPORT

## SECTION A: Business Context
- Model: ${formData.businessModel === "Other" ? formData.otherBusinessModel : formData.businessModel}
- Products: ${formData.primaryProducts.map(p => p === "Other" ? formData.otherPrimaryProduct : p).join(", ")}
- Size: ${formData.companySize === "Other" ? formData.otherCompanySize : formData.companySize}

## SECTION B: Revenue & Operations
- Acquisition: ${formData.customerChannels.map(c => c === "Other" ? formData.otherCustomerChannel : c).join(", ")}
- Conversion: ${formData.conversionMechanism === "Other" ? formData.otherConversionMechanism : formData.conversionMechanism}
- Triggers: ${formData.workTriggers.map(t => t === "Other" ? formData.otherWorkTrigger : t).join(", ")}
- Rev Tracking: ${formData.revenueTracking === "Other" ? formData.otherRevenueTracking : formData.revenueTracking}
- Predictability: ${formData.revenuePredictability}
- Scaling Impact: ${formData.scalingImpact === "Other" ? formData.otherScalingImpact : formData.scalingImpact}
- Handoffs: ${formData.handoffPoints.map(h => h === "Other" ? formData.otherHandoffPoint : h).join(", ")}

## SECTION C: Tools & Stack
- Core Tools: ${formData.coreTools.map(t => t === "Other" ? formData.otherCoreTool : t).join(", ")}
- Source of Truth: ${formData.sourceOfTruth === "Other" ? formData.otherSourceOfTruth : formData.sourceOfTruth}
- Automation Status: ${formData.automationStatus}

## SECTION D: Process Pain
- Time Drains: ${formData.manualTimeDrains.map(t => t === "Other" ? formData.otherManualTimeDrain : t).join(", ")}
- Error Prone: ${formData.errorProneTasks.map(t => t === "Other" ? formData.otherErrorProneTask : t).join(", ")}
- Delays: ${formData.delayPoints.map(d => d === "Other" ? formData.otherDelayPoint : d).join(", ")}
- Visibility: ${formData.operationsVisibility === "Other" ? formData.otherOperationsVisibility : formData.operationsVisibility}

## SECTION E: Risk & Constraints
- Access: ${formData.systemAccess}
- Compliance: ${formData.complianceConstraints.map(c => c === "Other" ? formData.otherComplianceConstraint : c).join(", ")}
- Environments: ${formData.environments.map(e => e === "Other" ? formData.otherEnvironment : e).join(", ")}
- Vendor Constraints: ${formData.vendorConstraints === "Yes" ? `YES - ${formData.vendorConstraintDetails}` : formData.vendorConstraints}

## SECTION F: Outcome Orientation
- Success Metrics: ${formData.successMetrics.map(s => s === "Other" ? formData.otherSuccessMetric : s).join(", ")}
- Top Priority: ${formData.primaryOutcome === "Other" ? formData.otherPrimaryOutcome : formData.primaryOutcome}
- Inaction Risk: ${formData.inactionConsequence === "Other" ? formData.otherInactionConsequence : formData.inactionConsequence}
- Proposal Criteria: ${formData.proposalCriteria.map(p => p === "Other" ? formData.otherProposalCriteria : p).join(", ")}

## SECTION G: Final Notes
${formData.finalClarifier || "None provided."}
    `;

    const payload = new FormData();
    // Map to existing JobPost fields or use "goal" as the dump
    payload.append("title", `Discovery Scan: ${formData.businessModel}`); 
    payload.append("goal", serializedData); 
    payload.append("category", "Discovery Scan"); 
    payload.append("budgetRange", "Not applicable"); 
    payload.append("timeline", "Not applicable");
    // Also save structured data if you have columns, or just the dump for now

    const result = await createDiscoveryJobPost(payload);

    if (result.success) {
      router.push(`/jobs/${result.jobId}`);
    } else {
      setPending(false);
      setShowPaymentModal(false);
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
    helperText 
  }: { 
    label: string, 
    options: string[], 
    value: string, 
    onChange: (val: string) => void,
    otherValue?: string,
    onOtherChange?: (val: string) => void,
    helperText?: string
  }) => (
    <div className="space-y-3 mb-8">
      <label className="block text-lg font-bold text-foreground">
        {label} <span className="text-primary">*</span>
      </label>
      {helperText && <p className="text-sm text-muted-foreground -mt-2 mb-2">{helperText}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
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
      {(value === "Other" || value === "Yes") && onOtherChange && (
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
    helperText 
  }: { 
    label: string, 
    options: string[], 
    selected: string[], 
    onToggle: (val: string) => void,
    otherValue?: string,
    onOtherChange?: (val: string) => void,
    helperText?: string
  }) => (
    <div className="space-y-3 mb-8">
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

  // --- STEPS RENDER ---

  const renderIntro = () => (
    <div className="text-center max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Discovery Scan</h1>
      <p className="text-xl text-muted-foreground mb-8">
        You&apos;ll complete a short diagnostic about how your business operates today. 
        Experts use this to identify automation opportunities and send you concrete proposals.
      </p>
      
      <div className="bg-secondary/20 border border-border rounded-xl p-6 text-left mb-8">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" /> What happens next:
        </h3>
        <ul className="space-y-3">
          <li className="flex gap-3 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
            Scope alignment
          </li>
          <li className="flex gap-3 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
            Live demo & walkthrough
          </li>
          <li className="flex gap-3 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
            Implementation in your environment
          </li>
          <li className="flex gap-3 text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
            Review & approve
          </li>
        </ul>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8 text-sm text-blue-600 dark:text-blue-400">
        <strong>Clarifier:</strong> You don&apos;t need to know what to automate. Describe your business accurately and completely — specialists will do the analysis.
      </div>

      <button 
        onClick={() => setStep(1)}
        className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/20"
      >
        Start Discovery Scan
      </button>
      <p className="text-xs text-muted-foreground mt-3">Takes ~5 minutes.</p>
    </div>
  );

  const renderSectionA = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Business Context</h2>
          <p className="text-sm text-muted-foreground">Basic details about your organization.</p>
        </div>
      </div>

      <SingleSelect 
        label="1. What best describes your business model?" 
        options={C.BUSINESS_MODELS} 
        value={formData.businessModel} 
        onChange={(v) => handleSingleSelect("businessModel", v, "otherBusinessModel")}
        otherValue={formData.otherBusinessModel}
        onOtherChange={(v) => handleChange("otherBusinessModel", v)}
      />

      <MultiSelect 
        label="2. What do you primarily sell?" 
        options={C.PRIMARY_PRODUCTS} 
        selected={formData.primaryProducts} 
        onToggle={(v) => handleMultiSelect("primaryProducts", v)}
        otherValue={formData.otherPrimaryProduct}
        onOtherChange={(v) => handleChange("otherPrimaryProduct", v)}
      />

      <SingleSelect 
        label="3. Approximate company size" 
        options={C.COMPANY_SIZES} 
        value={formData.companySize} 
        onChange={(v) => handleSingleSelect("companySize", v, "otherCompanySize")}
        otherValue={formData.otherCompanySize}
        onOtherChange={(v) => handleChange("otherCompanySize", v)}
      />
    </div>
  );

  const renderSectionB = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
          <ArrowRight className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Revenue & Operations</h2>
          <p className="text-sm text-muted-foreground">How money and work flow through your business.</p>
        </div>
      </div>

      <MultiSelect 
        label="4. How does a typical customer find you?" 
        options={C.CUSTOMER_CHANNELS} 
        selected={formData.customerChannels} 
        onToggle={(v) => handleMultiSelect("customerChannels", v)}
        otherValue={formData.otherCustomerChannel}
        onOtherChange={(v) => handleChange("otherCustomerChannel", v)}
      />

      <SingleSelect 
        label="5. How do customers usually convert?" 
        options={C.CONVERSION_MECHANISMS} 
        value={formData.conversionMechanism} 
        onChange={(v) => handleSingleSelect("conversionMechanism", v, "otherConversionMechanism")}
        otherValue={formData.otherConversionMechanism}
        onOtherChange={(v) => handleChange("otherConversionMechanism", v)}
        helperText="Think about the moment someone becomes a paying customer."
      />

      <MultiSelect 
        label="6. What triggers work internally after a customer converts?" 
        options={C.WORK_TRIGGERS} 
        selected={formData.workTriggers} 
        onToggle={(v) => handleMultiSelect("workTriggers", v)}
        otherValue={formData.otherWorkTrigger}
        onOtherChange={(v) => handleChange("otherWorkTrigger", v)}
      />

      <SingleSelect 
        label="7. How is revenue tracked today?" 
        options={C.REVENUE_TRACKING} 
        value={formData.revenueTracking} 
        onChange={(v) => handleSingleSelect("revenueTracking", v, "otherRevenueTracking")}
        otherValue={formData.otherRevenueTracking}
        onOtherChange={(v) => handleChange("otherRevenueTracking", v)}
      />

      <SingleSelect 
        label="8. How predictable is your revenue?" 
        options={C.REVENUE_PREDICTABILITY} 
        value={formData.revenuePredictability} 
        onChange={(v) => handleSingleSelect("revenuePredictability", v)}
      />

      <SingleSelect 
        label="9. What happens when volume increases?" 
        options={C.SCALING_IMPACT} 
        value={formData.scalingImpact} 
        onChange={(v) => handleSingleSelect("scalingImpact", v, "otherScalingImpact")}
        otherValue={formData.otherScalingImpact}
        onOtherChange={(v) => handleChange("otherScalingImpact", v)}
      />

      <MultiSelect 
        label="10. Where do handoffs between teams or tools usually happen?" 
        options={C.HANDOFF_POINTS} 
        selected={formData.handoffPoints} 
        onToggle={(v) => handleMultiSelect("handoffPoints", v)}
        otherValue={formData.otherHandoffPoint}
        onOtherChange={(v) => handleChange("otherHandoffPoint", v)}
      />
    </div>
  );

  const renderSectionC = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Tools & Stack</h2>
          <p className="text-sm text-muted-foreground">Technical constraints and integration effort.</p>
        </div>
      </div>

      <MultiSelect 
        label="11. Which tools are core to your daily operations?" 
        options={C.CORE_TOOLS} 
        selected={formData.coreTools} 
        onToggle={(v) => handleMultiSelect("coreTools", v)}
        otherValue={formData.otherCoreTool}
        onOtherChange={(v) => handleChange("otherCoreTool", v)}
      />

      <SingleSelect 
        label="12. Where is your “source of truth” today?" 
        options={C.SOURCE_OF_TRUTH} 
        value={formData.sourceOfTruth} 
        onChange={(v) => handleSingleSelect("sourceOfTruth", v, "otherSourceOfTruth")}
        otherValue={formData.otherSourceOfTruth}
        onOtherChange={(v) => handleChange("otherSourceOfTruth", v)}
        helperText="This is where your most reliable business data lives."
      />

      <SingleSelect 
        label="13. Are you already using any automation?" 
        options={C.AUTOMATION_STATUS} 
        value={formData.automationStatus} 
        onChange={(v) => handleSingleSelect("automationStatus", v)}
      />
    </div>
  );

  const renderSectionD = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Process Pain Signals</h2>
          <p className="text-sm text-muted-foreground">Identify where friction exists in your day-to-day.</p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-8 text-sm text-amber-600">
        You don’t need to identify bottlenecks. Just answer based on your day-to-day reality.
      </div>

      <MultiSelect 
        label="14. Which activities consume the most manual time each week?" 
        options={C.MANUAL_TIME_DRAINS} 
        selected={formData.manualTimeDrains} 
        onToggle={(v) => handleMultiSelect("manualTimeDrains", v)}
        otherValue={formData.otherManualTimeDrain}
        onOtherChange={(v) => handleChange("otherManualTimeDrain", v)}
      />

      <MultiSelect 
        label="15. Which tasks are most error-prone today?" 
        options={C.ERROR_PRONE_TASKS} 
        selected={formData.errorProneTasks} 
        onToggle={(v) => handleMultiSelect("errorProneTasks", v)}
        otherValue={formData.otherErrorProneTask}
        onOtherChange={(v) => handleChange("otherErrorProneTask", v)}
      />

      <MultiSelect 
        label="16. Where do delays most often occur?" 
        options={C.DELAY_POINTS} 
        selected={formData.delayPoints} 
        onToggle={(v) => handleMultiSelect("delayPoints", v)}
        otherValue={formData.otherDelayPoint}
        onOtherChange={(v) => handleChange("otherDelayPoint", v)}
      />

      <SingleSelect 
        label="17. How visible are your operations right now?" 
        options={C.OPERATIONS_VISIBILITY} 
        value={formData.operationsVisibility} 
        onChange={(v) => handleSingleSelect("operationsVisibility", v, "otherOperationsVisibility")}
        otherValue={formData.otherOperationsVisibility}
        onOtherChange={(v) => handleChange("otherOperationsVisibility", v)}
      />
    </div>
  );

  const renderSectionE = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Risk, Access & Constraints</h2>
          <p className="text-sm text-muted-foreground">Boundaries for the proposed solution.</p>
        </div>
      </div>

      <SingleSelect 
        label="18. What level of system access are you comfortable with?" 
        options={C.SYSTEM_ACCESS} 
        value={formData.systemAccess} 
        onChange={(v) => handleSingleSelect("systemAccess", v)}
        helperText="This helps experts propose solutions that respect your boundaries."
      />

      <MultiSelect 
        label="19. Are there compliance or regulatory constraints?" 
        options={C.COMPLIANCE_CONSTRAINTS} 
        selected={formData.complianceConstraints} 
        onToggle={(v) => handleMultiSelect("complianceConstraints", v)}
        otherValue={formData.otherComplianceConstraint}
        onOtherChange={(v) => handleChange("otherComplianceConstraint", v)}
      />

      <MultiSelect 
        label="20. What environments do you operate in?" 
        options={C.ENVIRONMENTS} 
        selected={formData.environments} 
        onToggle={(v) => handleMultiSelect("environments", v)}
        otherValue={formData.otherEnvironment}
        onOtherChange={(v) => handleChange("otherEnvironment", v)}
      />

      <SingleSelect 
        label="21. Are there tools or vendors that must NOT be changed?" 
        options={C.VENDOR_CONSTRAINTS} 
        value={formData.vendorConstraints} 
        onChange={(v) => handleSingleSelect("vendorConstraints", v, "vendorConstraintDetails")}
        otherValue={formData.vendorConstraintDetails}
        onOtherChange={(v) => handleChange("vendorConstraintDetails", v)}
      />
    </div>
  );

  const renderSectionF = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Outcome Orientation</h2>
          <p className="text-sm text-muted-foreground">What success looks like for you.</p>
        </div>
      </div>

      <MultiSelect 
        label="22. What would success look like in 3–6 months?" 
        options={C.SUCCESS_METRICS} 
        selected={formData.successMetrics} 
        onToggle={(v) => handleMultiSelect("successMetrics", v)}
        otherValue={formData.otherSuccessMetric}
        onOtherChange={(v) => handleChange("otherSuccessMetric", v)}
      />

      <SingleSelect 
        label="23. Which outcome matters most right now?" 
        options={C.PRIMARY_OUTCOME} 
        value={formData.primaryOutcome} 
        onChange={(v) => handleSingleSelect("primaryOutcome", v, "otherPrimaryOutcome")}
        otherValue={formData.otherPrimaryOutcome}
        onOtherChange={(v) => handleChange("otherPrimaryOutcome", v)}
      />

      <SingleSelect 
        label="24. If nothing changes, what happens?" 
        options={C.INACTION_CONSEQUENCE} 
        value={formData.inactionConsequence} 
        onChange={(v) => handleSingleSelect("inactionConsequence", v, "otherInactionConsequence")}
        otherValue={formData.otherInactionConsequence}
        onOtherChange={(v) => handleChange("otherInactionConsequence", v)}
      />

      <MultiSelect 
        label="25. How will you decide if a proposal is “good”?" 
        options={C.PROPOSAL_CRITERIA} 
        selected={formData.proposalCriteria} 
        onToggle={(v) => handleMultiSelect("proposalCriteria", v)}
        otherValue={formData.otherProposalCriteria}
        onOtherChange={(v) => handleChange("otherProposalCriteria", v)}
      />
    </div>
  );

  const renderSectionG = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Final Clarifier</h2>
          <p className="text-sm text-muted-foreground">One last check before submission.</p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-lg font-bold text-foreground">
          26. Is there anything about your business that would change how solutions should be designed?
        </label>
        <p className="text-sm text-muted-foreground -mt-2">
          Only include details that affect daily operations, scale, or risk.
        </p>
        <textarea
          value={formData.finalClarifier}
          onChange={(e) => handleChange("finalClarifier", e.target.value)}
          className="w-full h-40 bg-background border border-border rounded-xl p-4 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-foreground"
          placeholder="e.g. We have a strict policy against storing customer data in 3rd party tools..."
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 flex flex-col items-center">
      
      {/* Progress (Only show if started) */}
      {step > 0 && (
        <div className="w-full max-w-2xl mb-8">
          <div className="flex justify-between text-xs uppercase tracking-wider text-muted-foreground mb-2">
            <span>Discovery Scan</span>
            <span>Step {step} of {totalSteps}</span>
          </div>
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {step === 0 ? (
        renderIntro()
      ) : (
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 md:p-10 shadow-xl relative min-h-[400px] flex flex-col">
          
          {/* Error Message */}
          {error && (
            <div className="absolute top-4 left-0 w-full px-10 z-10">
               <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-md text-sm text-center font-medium">
                 {error}
               </div>
            </div>
          )}

          <div className="flex-grow pt-4">
            {step === 1 && renderSectionA()}
            {step === 2 && renderSectionB()}
            {step === 3 && renderSectionC()}
            {step === 4 && renderSectionD()}
            {step === 5 && renderSectionE()}
            {step === 6 && renderSectionF()}
            {step === 7 && renderSectionG()}
          </div>

          {/* Footer Actions */}
          <div className="pt-8 mt-4 border-t border-border flex justify-between items-center">
            <button 
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            <button 
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              {step === totalSteps ? "Finish & Post" : "Next Step"}
              {step < totalSteps && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showPaymentModal && (
        <CheckoutModal 
          onClose={() => setShowPaymentModal(false)}
          onSubmit={handlePaymentAndSubmit}
          pending={pending}
        />
      )}
    </div>
  );
}
