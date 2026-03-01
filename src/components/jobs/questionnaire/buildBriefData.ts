/**
 * Shared brief-data builder for Discovery Scan questionnaire.
 * Used by both the public discovery page and the admin fill page.
 */

export function buildBriefData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: any,
  v: (val: string, other: string) => string,
  va: (arr: string[], other: string) => string[]
) {
  return {
    version: "2",
    sections: [
      {
        id: "A",
        title: "Business Context",
        subtitle: "Basic details about your organization",
        qa: [
          { q: "What best describes your business model?", a: v(formData.businessModel, formData.otherBusinessModel) },
          { q: "What do you primarily sell?", a: va(formData.primaryProducts, formData.otherPrimaryProduct) },
          { q: "Approximate company size", a: v(formData.companySize, formData.otherCompanySize) },
        ],
      },
      {
        id: "B",
        title: "Revenue & Operations",
        subtitle: "How money and work flow through your business",
        qa: [
          { q: "How does a typical customer find you?", a: va(formData.customerChannels, formData.otherCustomerChannel) },
          { q: "How do customers usually convert?", a: v(formData.conversionMechanism, formData.otherConversionMechanism) },
          { q: "What triggers work internally after a customer converts?", a: va(formData.workTriggers, formData.otherWorkTrigger) },
          { q: "How is revenue tracked today?", a: v(formData.revenueTracking, formData.otherRevenueTracking) },
          { q: "How predictable is your revenue?", a: formData.revenuePredictability },
          { q: "What happens when volume increases?", a: v(formData.scalingImpact, formData.otherScalingImpact) },
          { q: "Where do handoffs between teams or tools usually happen?", a: va(formData.handoffPoints, formData.otherHandoffPoint) },
        ],
      },
      {
        id: "C",
        title: "Tools & Stack",
        subtitle: "Technical constraints and integration effort",
        qa: [
          {
            q: "Which tools are core to your daily operations?",
            a: formData.coreTools
              .map((t: string) =>
                t === "Other"
                  ? formData.otherCoreTool
                  : formData.coreToolNames[t]
                    ? `${t} (${formData.coreToolNames[t]})`
                    : t
              )
              .filter(Boolean),
          },
          { q: 'Where is your "source of truth" today?', a: v(formData.sourceOfTruth, formData.otherSourceOfTruth) },
          { q: "Are you already using any automation?", a: formData.automationStatus },
        ],
      },
      {
        id: "D",
        title: "Process Pain Signals",
        subtitle: "Where friction exists in your day-to-day",
        highlight: true,
        qa: [
          { q: "How much human judgment does this process require?", a: va(formData.humanJudgmentLevel, formData.otherHumanJudgmentLevel) },
          { q: "Which activities consume the most manual time each week?", a: va(formData.manualTimeDrains, formData.otherManualTimeDrain) },
          { q: "Which tasks often lead to mistakes or need redoing?", a: va(formData.errorProneTasks, formData.otherErrorProneTask) },
          { q: "Where do delays most often occur?", a: va(formData.delayPoints, formData.otherDelayPoint) },
          { q: "How visible are your operations right now?", a: v(formData.operationsVisibility, formData.otherOperationsVisibility) },
        ],
      },
      {
        id: "E",
        title: "Risk, Access & Constraints",
        subtitle: "Boundaries for the proposed solution",
        qa: [
          { q: "Are there compliance or regulatory constraints?", a: va(formData.complianceConstraints, formData.otherComplianceConstraint) },
          { q: "What environments do you operate in?", a: va(formData.environments, formData.otherEnvironment) },
          {
            q: "Are there tools or vendors that must NOT be changed?",
            a:
              formData.vendorConstraints === "Yes"
                ? `Yes — ${formData.vendorConstraintDetails}`
                : formData.vendorConstraints,
          },
        ],
      },
      {
        id: "F",
        title: "Outcome Orientation",
        subtitle: "What success looks like for you",
        highlight: true,
        qa: [
          { q: "When do you need to have a solution implemented?", a: v(formData.implementationTimeline, formData.otherImplementationTimeline) },
          { q: "What would success look like in 3\u20136 months?", a: va(formData.successMetrics, formData.otherSuccessMetric) },
          { q: "Which outcome matters most right now?", a: v(formData.primaryOutcome, formData.otherPrimaryOutcome) },
          { q: "If nothing changes, what happens?", a: v(formData.inactionConsequence, formData.otherInactionConsequence) },
          { q: 'How will you decide if a proposal is "good"?', a: va(formData.proposalCriteria, formData.otherProposalCriteria) },
        ],
      },
      ...(formData.finalClarifier
        ? [
            {
              id: "G",
              title: "In Their Own Words",
              subtitle: "Final clarifier from the business",
              qa: [
                {
                  q: "Is there anything about your business that would change how solutions should be designed?",
                  a: formData.finalClarifier,
                },
              ],
            },
          ]
        : []),
    ],
  };
}

/** Default empty form state for the Discovery Scan questionnaire. */
export function getDefaultDiscoveryFormData() {
  return {
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

    // Section E
    complianceConstraints: [] as string[],
    otherComplianceConstraint: "",
    environments: [] as string[],
    otherEnvironment: "",
    vendorConstraints: "",
    vendorConstraintDetails: "",

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
    finalClarifier: "",
  };
}

export type DiscoveryFormData = ReturnType<typeof getDefaultDiscoveryFormData>;
