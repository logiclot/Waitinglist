"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import {
  SingleSelect,
  MultiSelect,
  MultiSelectMax2,
  MultiSelectWithToolNames,
} from "@/components/jobs/questionnaire/QuestionnaireFields";
import { buildBriefData } from "@/components/jobs/questionnaire/buildBriefData";
import * as C from "./constants";
import { DISCOVERY_SCAN_COPY, DISCOVERY_SCAN_BULLETS } from "@/lib/copy/requestCards";

export default function DiscoveryWizardPage() {
  const [step, setStep] = useState(0); // 0 = Intro
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
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
    coreToolNames: {} as Record<string, string>,
    otherCoreTool: "",
    sourceOfTruth: "",
    otherSourceOfTruth: "",
    automationStatus: "",

    // Section D
    humanJudgmentLevel: [] as string[],
    otherHumanJudgmentLevel: "",
    manualTimeDrains: [] as string[],
    otherManualTimeDrain: "",
    errorProneTasks: [] as string[],
    otherErrorProneTask: "",
    delayPoints: [] as string[],
    otherDelayPoint: "",
    operationsVisibility: "",
    otherOperationsVisibility: "",

    // Section E (systemAccess removed - was Q18)
    complianceConstraints: [] as string[],
    otherComplianceConstraint: "",
    environments: [] as string[],
    otherEnvironment: "",
    vendorConstraints: "",
    vendorConstraintDetails: "", // If "Yes"

    // Section F
    implementationTimeline: "",
    otherImplementationTimeline: "",
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
        const coreToolsValid = formData.coreTools.length > 0 &&
          (!formData.coreTools.includes("Other") || !!formData.otherCoreTool) &&
          formData.coreTools.every(t => t === "Other" || !!(formData.coreToolNames[t] || "").trim());
        return coreToolsValid &&
               !!formData.sourceOfTruth &&
               (formData.sourceOfTruth !== "Other" || !!formData.otherSourceOfTruth) &&
               !!formData.automationStatus;
      case 4: // Section D
        return formData.humanJudgmentLevel.length > 0 &&
               formData.manualTimeDrains.length > 0 &&
               (!formData.manualTimeDrains.includes("Other") || !!formData.otherManualTimeDrain) &&
               formData.errorProneTasks.length > 0 &&
               (!formData.errorProneTasks.includes("Other") || !!formData.otherErrorProneTask) &&
               formData.delayPoints.length > 0 &&
               (!formData.delayPoints.includes("Other") || !!formData.otherDelayPoint) &&
               !!formData.operationsVisibility &&
               (formData.operationsVisibility !== "Other" || !!formData.otherOperationsVisibility);
      case 5: // Section E (systemAccess/Q18 removed)
        return formData.complianceConstraints.length > 0 &&
               (!formData.complianceConstraints.includes("Other") || !!formData.otherComplianceConstraint) &&
               formData.environments.length > 0 &&
               (!formData.environments.includes("Other") || !!formData.otherEnvironment) &&
               !!formData.vendorConstraints &&
               (formData.vendorConstraints !== "Yes" || !!formData.vendorConstraintDetails);
      case 6: // Section F
        return !!formData.implementationTimeline &&
               (formData.implementationTimeline !== "Other" || !!formData.otherImplementationTimeline) &&
               formData.successMetrics.length > 0 &&
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

  const handleNext = async () => {
    setError(null);
    if (!validateStep(step)) {
      setError("Please complete all required fields to continue.");
      return;
    }
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
      return;
    }

    // Last step: create the job (pending_payment) then show payment modal
    setError(null);

    const v  = (val: string, other: string) => val === "Other" || val === "Yes" ? other : val;
    const va = (arr: string[], other: string) => arr.map(i => i === "Other" ? other : i).filter(Boolean);

    const briefData = buildBriefData(formData, v, va);
    const payload = new FormData();
    payload.append("title", `Discovery Scan: ${formData.businessModel}`);
    payload.append("goal", JSON.stringify(briefData));

    const result = await createDiscoveryJobPost(payload);

    if (!result.success) {
      setError(result.error || "Something went wrong.");
      toast.error(result.error || "Something went wrong.");
      return;
    }

    setPendingJobId(result.jobId!);
    setShowPaymentModal(true);
  };

  const handleBack = () => {
    setError(null);
    if (step > 0) setStep(step - 1);
  };

  // --- STEPS RENDER ---

  const renderIntro = () => (
    <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 py-8">
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{DISCOVERY_SCAN_COPY.headline.replace("\n", " ")}</h1>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                {DISCOVERY_SCAN_COPY.proposalNote} &middot; {DISCOVERY_SCAN_COPY.price} one-time
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {DISCOVERY_SCAN_COPY.description}
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Left: What you get */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">What you get</p>
            <ul className="space-y-2.5">
              {DISCOVERY_SCAN_BULLETS.map((item) => (
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
              <div className="text-2xl font-bold text-foreground mb-0.5">{DISCOVERY_SCAN_COPY.price}</div>
              <div className="text-xs text-muted-foreground mb-3">One-time posting fee</div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                  {DISCOVERY_SCAN_COPY.footer.replace("First proposals arrive", "First proposals")}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                  Up to 5 qualified submissions
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                  Mutual NDA before any data is shared
                </li>
              </ul>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-600 dark:text-blue-400">
              {DISCOVERY_SCAN_COPY.trustNote}
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20"
            >
              {DISCOVERY_SCAN_COPY.cta} &rarr;
            </button>
            <p className="text-xs text-muted-foreground text-center -mt-1">{DISCOVERY_SCAN_COPY.footer}</p>
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
        helperText="Points where work or information passes from one person, team, or system to another."
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

      <MultiSelectWithToolNames 
        label="11. Which tools are core to your daily operations?" 
        options={C.CORE_TOOLS} 
        selected={formData.coreTools} 
        onToggle={(v) => handleMultiSelect("coreTools", v)}
        toolNames={formData.coreToolNames}
        onToolNameChange={(tool, name) => setFormData(prev => ({ ...prev, coreToolNames: { ...prev.coreToolNames, [tool]: name } }))}
        otherValue={formData.otherCoreTool}
        onOtherChange={(v) => handleChange("otherCoreTool", v)}
        helperText="Specify the exact tool name (e.g. HubSpot, Salesforce) for each selected option."
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

      <MultiSelectMax2 
        label="14. How much human judgment does this process require?" 
        options={C.HUMAN_JUDGMENT_LEVEL} 
        selected={formData.humanJudgmentLevel} 
        onToggle={(v) => handleMultiSelect("humanJudgmentLevel", v)}
        helperText="Select up to 2 options that best describe how decisions are made in this process."
      />

      <MultiSelect 
        label="15. Which activities consume the most manual time each week?" 
        options={C.MANUAL_TIME_DRAINS} 
        selected={formData.manualTimeDrains} 
        onToggle={(v) => handleMultiSelect("manualTimeDrains", v)}
        otherValue={formData.otherManualTimeDrain}
        onOtherChange={(v) => handleChange("otherManualTimeDrain", v)}
      />

      <MultiSelect 
        label="16. Which tasks often lead to mistakes or need redoing?" 
        options={C.ERROR_PRONE_TASKS} 
        selected={formData.errorProneTasks} 
        onToggle={(v) => handleMultiSelect("errorProneTasks", v)}
        otherValue={formData.otherErrorProneTask}
        onOtherChange={(v) => handleChange("otherErrorProneTask", v)}
        helperText="Activities where things go wrong, need correcting, or get done twice."
      />

      <MultiSelect 
        label="17. Where do delays most often occur?" 
        options={C.DELAY_POINTS} 
        selected={formData.delayPoints} 
        onToggle={(v) => handleMultiSelect("delayPoints", v)}
        otherValue={formData.otherDelayPoint}
        onOtherChange={(v) => handleChange("otherDelayPoint", v)}
      />

      <SingleSelect 
        label="18. How visible are your operations right now?" 
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

      <SingleSelect 
        label="22. When do you need to have a solution implemented?" 
        options={C.IMPLEMENTATION_TIMELINE} 
        value={formData.implementationTimeline} 
        onChange={(v) => handleSingleSelect("implementationTimeline", v, "otherImplementationTimeline")}
        otherValue={formData.otherImplementationTimeline}
        onOtherChange={(v) => handleChange("otherImplementationTimeline", v)}
        helperText="This helps experts align proposals with your timeline."
      />

      <MultiSelect 
        label="23. What would success look like in 3–6 months?" 
        options={C.SUCCESS_METRICS} 
        selected={formData.successMetrics} 
        onToggle={(v) => handleMultiSelect("successMetrics", v)}
        otherValue={formData.otherSuccessMetric}
        onOtherChange={(v) => handleChange("otherSuccessMetric", v)}
      />

      <SingleSelect 
        label="24. Which outcome matters most right now?" 
        options={C.PRIMARY_OUTCOME} 
        value={formData.primaryOutcome} 
        onChange={(v) => handleSingleSelect("primaryOutcome", v, "otherPrimaryOutcome")}
        otherValue={formData.otherPrimaryOutcome}
        onOtherChange={(v) => handleChange("otherPrimaryOutcome", v)}
      />

      <SingleSelect 
        label="25. If nothing changes, what happens?" 
        options={C.INACTION_CONSEQUENCE} 
        value={formData.inactionConsequence} 
        onChange={(v) => handleSingleSelect("inactionConsequence", v, "otherInactionConsequence")}
        otherValue={formData.otherInactionConsequence}
        onOtherChange={(v) => handleChange("otherInactionConsequence", v)}
      />

      <MultiSelect 
        label="26. How will you decide if a proposal is “good”?" 
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
          27. Is there anything about your business that would change how solutions should be designed?
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
    <div className="container mx-auto px-4 py-10 max-w-3xl flex flex-col items-center">
      
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

          <div className="bg-secondary/30 p-4 rounded-lg border border-border mt-6">
            <p className="text-xs text-muted-foreground text-center">
              By proceeding, you enter a legally binding <strong>Mutual NDA</strong>. 
              All data and logic shared are protected by LogicLot protocols.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 mt-4 border-t border-border flex justify-between items-center">
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
      {showPaymentModal && pendingJobId && (
        <CheckoutModal
          jobId={pendingJobId}
          type="discovery"
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
