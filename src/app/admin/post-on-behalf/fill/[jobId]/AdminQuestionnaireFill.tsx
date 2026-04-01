"use client";

import { useState, useCallback } from "react";
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
  Copy,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { adminUpdateJobGoal } from "@/actions/admin";
import {
  SingleSelect,
  MultiSelect,
  MultiSelectMax2,
  MultiSelectWithToolNames,
} from "@/components/jobs/questionnaire/QuestionnaireFields";
import {
  buildBriefData,
  getDefaultDiscoveryFormData,
  type DiscoveryFormData,
} from "@/components/jobs/questionnaire/buildBriefData";
import * as C from "@/app/(home)/jobs/discovery/constants";

interface JobData {
  id: string;
  title: string;
  goal: string | null;
  category: string;
  status: string;
  tools: string[];
  budgetRange: string | null;
  paidAt: Date | null;
  createdAt: Date;
  buyer: {
    email: string;
    businessProfile: {
      firstName: string;
      lastName: string;
      companyName: string | null;
    } | null;
  };
}

interface Props {
  job: JobData;
  paymentUrl: string | null;
  isSimulated: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_payment: {
    label: "Pending Payment",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  open: { label: "Open", color: "text-green-700 bg-green-50 border-green-200" },
  awarded: {
    label: "Awarded",
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  closed: {
    label: "Closed",
    color: "text-muted-foreground bg-secondary border-border",
  },
};

/** Try to restore formData from a previously saved goal JSON. */
function restoreFormData(goalJson: string | null): DiscoveryFormData | null {
  if (!goalJson) return null;
  try {
    const parsed = JSON.parse(goalJson);
    // Check if it looks like a raw formData dump (has __formData key)
    if (parsed.__formData) return parsed.__formData as DiscoveryFormData;
    // Otherwise it's the briefData format — can't reverse-engineer formData from it easily
    return null;
  } catch {
    return null;
  }
}

export function AdminQuestionnaireFill({
  job,
  paymentUrl,
  isSimulated,
}: Props) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Restore formData from existing goal if possible
  const restoredData = restoreFormData(job.goal);
  const [formData, setFormData] = useState<DiscoveryFormData>(
    restoredData ?? getDefaultDiscoveryFormData(),
  );

  const totalSteps = 7;
  const bp = job.buyer.businessProfile;
  const businessName =
    bp?.companyName ||
    (bp ? `${bp.firstName} ${bp.lastName}` : job.buyer.email);
  const statusInfo = STATUS_LABELS[job.status] ?? {
    label: job.status,
    color: "text-muted-foreground bg-secondary border-border",
  };

  // Generic Handlers
  const handleSingleSelect = (
    key: string,
    value: string,
    otherKey?: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
      ...(otherKey && value !== "Other" && value !== "Yes"
        ? { [otherKey]: "" }
        : {}),
    }));
  };

  const handleMultiSelect = (key: string, value: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = (formData as any)[key] as string[];
    const isSelected = current.includes(value);
    setFormData((prev) => ({
      ...prev,
      [key]: isSelected
        ? current.filter((item) => item !== value)
        : [...current, value],
    }));
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Auto-save on step change
  const saveGoal = useCallback(
    async (data: DiscoveryFormData) => {
      setSaving(true);
      try {
        const v = (val: string, other: string) =>
          val === "Other" || val === "Yes" ? other : val;
        const va = (arr: string[], other: string) =>
          arr.map((i) => (i === "Other" ? other : i)).filter(Boolean);

        const briefData = buildBriefData(data, v, va);
        // Store both: the formatted briefData + raw formData for restore
        const goalJson = JSON.stringify({ ...briefData, __formData: data });
        const result = await adminUpdateJobGoal(job.id, goalJson);
        if ("error" in result) {
          toast.error(result.error);
        }
      } catch {
        toast.error("Failed to save questionnaire.");
      } finally {
        setSaving(false);
      }
    },
    [job.id],
  );

  const handleNext = async () => {
    if (step < totalSteps) {
      // Save current progress
      await saveGoal(formData);
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      // Final save on last step
      await saveGoal(formData);
      toast.success(
        "Questionnaire complete! Share the payment link with the business.",
      );
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast.success("Payment link copied!");
  }

  // ─── Section Renderers ──────────────────────────────────────────────────────

  const renderSectionA = () => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300">
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
          <Briefcase className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Business Context</h2>
          <p className="text-sm text-muted-foreground">
            Basic details about the organization.
          </p>
        </div>
      </div>

      <SingleSelect
        label="1. What best describes the business model?"
        options={C.BUSINESS_MODELS}
        value={formData.businessModel}
        onChange={(v) =>
          handleSingleSelect("businessModel", v, "otherBusinessModel")
        }
        otherValue={formData.otherBusinessModel}
        onOtherChange={(v) => handleChange("otherBusinessModel", v)}
      />
      <MultiSelect
        label="2. What do they primarily sell?"
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
        onChange={(v) =>
          handleSingleSelect("companySize", v, "otherCompanySize")
        }
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
          <p className="text-sm text-muted-foreground">
            How money and work flow through the business.
          </p>
        </div>
      </div>

      <MultiSelect
        label="4. How does a typical customer find them?"
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
        onChange={(v) =>
          handleSingleSelect(
            "conversionMechanism",
            v,
            "otherConversionMechanism",
          )
        }
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
        onChange={(v) =>
          handleSingleSelect("revenueTracking", v, "otherRevenueTracking")
        }
        otherValue={formData.otherRevenueTracking}
        onOtherChange={(v) => handleChange("otherRevenueTracking", v)}
      />
      <SingleSelect
        label="8. How predictable is the revenue?"
        options={C.REVENUE_PREDICTABILITY}
        value={formData.revenuePredictability}
        onChange={(v) => handleSingleSelect("revenuePredictability", v)}
      />
      <SingleSelect
        label="9. What happens when volume increases?"
        options={C.SCALING_IMPACT}
        value={formData.scalingImpact}
        onChange={(v) =>
          handleSingleSelect("scalingImpact", v, "otherScalingImpact")
        }
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
          <p className="text-sm text-muted-foreground">
            Technical constraints and integration effort.
          </p>
        </div>
      </div>

      <MultiSelectWithToolNames
        label="11. Which tools are core to daily operations?"
        options={C.CORE_TOOLS}
        selected={formData.coreTools}
        onToggle={(v) => handleMultiSelect("coreTools", v)}
        toolNames={formData.coreToolNames}
        onToolNameChange={(tool, name) =>
          setFormData((prev) => ({
            ...prev,
            coreToolNames: { ...prev.coreToolNames, [tool]: name },
          }))
        }
        otherValue={formData.otherCoreTool}
        onOtherChange={(v) => handleChange("otherCoreTool", v)}
        helperText="Specify the exact tool name (e.g. HubSpot, Salesforce) for each selected option."
      />
      <SingleSelect
        label='12. Where is the "source of truth" today?'
        options={C.SOURCE_OF_TRUTH}
        value={formData.sourceOfTruth}
        onChange={(v) =>
          handleSingleSelect("sourceOfTruth", v, "otherSourceOfTruth")
        }
        otherValue={formData.otherSourceOfTruth}
        onOtherChange={(v) => handleChange("otherSourceOfTruth", v)}
        helperText="This is where the most reliable business data lives."
      />
      <SingleSelect
        label="13. Are they already using any automation?"
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
          <p className="text-sm text-muted-foreground">
            Where friction exists in day-to-day.
          </p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-8 text-sm text-amber-600">
        Ask the client to describe their day-to-day. They don&apos;t need to
        identify bottlenecks.
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
        label="18. How visible are operations right now?"
        options={C.OPERATIONS_VISIBILITY}
        value={formData.operationsVisibility}
        onChange={(v) =>
          handleSingleSelect(
            "operationsVisibility",
            v,
            "otherOperationsVisibility",
          )
        }
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
          <p className="text-sm text-muted-foreground">
            Boundaries for the proposed solution.
          </p>
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
        label="20. What environments do they operate in?"
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
        onChange={(v) =>
          handleSingleSelect("vendorConstraints", v, "vendorConstraintDetails")
        }
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
          <p className="text-sm text-muted-foreground">
            What success looks like.
          </p>
        </div>
      </div>

      <SingleSelect
        label="22. When do they need a solution implemented?"
        options={C.IMPLEMENTATION_TIMELINE}
        value={formData.implementationTimeline}
        onChange={(v) =>
          handleSingleSelect(
            "implementationTimeline",
            v,
            "otherImplementationTimeline",
          )
        }
        otherValue={formData.otherImplementationTimeline}
        onOtherChange={(v) => handleChange("otherImplementationTimeline", v)}
        helperText="This helps experts align proposals with the timeline."
      />
      <MultiSelect
        label="23. What would success look like in 3\u20136 months?"
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
        onChange={(v) =>
          handleSingleSelect("primaryOutcome", v, "otherPrimaryOutcome")
        }
        otherValue={formData.otherPrimaryOutcome}
        onOtherChange={(v) => handleChange("otherPrimaryOutcome", v)}
      />
      <SingleSelect
        label="25. If nothing changes, what happens?"
        options={C.INACTION_CONSEQUENCE}
        value={formData.inactionConsequence}
        onChange={(v) =>
          handleSingleSelect(
            "inactionConsequence",
            v,
            "otherInactionConsequence",
          )
        }
        otherValue={formData.otherInactionConsequence}
        onOtherChange={(v) => handleChange("otherInactionConsequence", v)}
      />
      <MultiSelect
        label='26. How will they decide if a proposal is "good"?'
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
          <p className="text-sm text-muted-foreground">
            One last check before finishing.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-lg font-bold text-foreground">
          27. Is there anything about this business that would change how
          solutions should be designed?
        </label>
        <p className="text-sm text-muted-foreground -mt-2">
          Only include details that affect daily operations, scale, or risk.
        </p>
        <textarea
          value={formData.finalClarifier}
          onChange={(e) => handleChange("finalClarifier", e.target.value)}
          className="w-full h-40 bg-background border border-border rounded-xl p-4 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-foreground"
          placeholder="e.g. They have a strict policy against storing customer data in 3rd party tools..."
        />
      </div>

      {/* Completion message */}
      <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-center gap-2 text-green-700 mb-3">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-bold">Questionnaire complete</span>
        </div>
        <p className="text-sm text-green-700 mb-4">
          Share the payment link with the business. Once they pay, the job goes
          live automatically and experts will be notified.
        </p>

        {paymentUrl && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-green-800">Payment Link:</p>
            {isSimulated && (
              <p className="text-[10px] text-amber-600">
                ⚠ Dev placeholder — Stripe not configured.
              </p>
            )}
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={paymentUrl}
                className="flex-1 bg-white border border-green-200 rounded-lg px-3 py-2 text-xs font-mono text-foreground truncate"
              />
              <button
                onClick={() => handleCopy(paymentUrl)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border border-green-200 bg-white hover:bg-green-50 transition-colors text-sm font-bold text-foreground"
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-2 rounded-lg border border-green-200 bg-white hover:bg-green-50 transition-colors text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* ── Header Bar ────────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <a
              href="/admin/post-on-behalf"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-2 inline-block"
            >
              &larr; Back to Post on Behalf
            </a>
            <h1 className="text-xl font-bold text-foreground">{job.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {businessName} &middot; {job.buyer.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded border text-xs font-bold ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {job.category}
            </span>
          </div>
        </div>

        {/* Payment link quick-access */}
        {paymentUrl && (
          <div className="mt-4 pt-4 border-t border-border">
            {isSimulated && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200 mb-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-700">
                  Dev placeholder — Stripe not configured.
                </p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground shrink-0">
                Payment Link:
              </span>
              <input
                readOnly
                value={paymentUrl}
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs font-mono text-foreground truncate"
              />
              <button
                onClick={() => handleCopy(paymentUrl)}
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-secondary transition-colors text-xs font-bold text-foreground"
              >
                {copied ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Progress Bar ──────────────────────────────────────────────────── */}
      <div className="w-full">
        <div className="flex justify-between text-xs uppercase tracking-wider text-muted-foreground mb-2">
          <span>Questionnaire</span>
          <span className="flex items-center gap-2">
            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
            Step {step + 1} of {totalSteps + 1}
          </span>
        </div>
        <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / (totalSteps + 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Questionnaire Card ────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-10 shadow-xl relative min-h-[400px] flex flex-col">
        <div className="flex-grow">
          {step === 0 && renderSectionA()}
          {step === 1 && renderSectionB()}
          {step === 2 && renderSectionC()}
          {step === 3 && renderSectionD()}
          {step === 4 && renderSectionE()}
          {step === 5 && renderSectionF()}
          {step === 6 && renderSectionG()}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-4 border-t border-border flex justify-between items-center">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <button
            onClick={handleNext}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {step === totalSteps ? "Save & Finish" : "Next Step"}
            {step < totalSteps && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
