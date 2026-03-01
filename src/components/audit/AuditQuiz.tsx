"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Zap,
  AlertCircle,
  BarChart2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

type QuestionSingle = {
  id: string;
  question: string;
  hint?: string;
  type: "single";
  options: { id: string; label: string; sub?: string }[];
};

type QuestionMulti = {
  id: string;
  question: string;
  hint?: string;
  type: "multi";
  options: { id: string; label: string }[];
};

type Question = QuestionSingle | QuestionMulti;

const QUESTIONS: Question[] = [
  {
    id: "teamSize",
    question: "How big is your team?",
    type: "single",
    options: [
      { id: "solo", label: "Just me", sub: "Solo operator" },
      { id: "small", label: "2–10 people", sub: "Small team" },
      { id: "medium", label: "11–50 people", sub: "Growing business" },
      { id: "large", label: "50+ people", sub: "Established company" },
    ],
  },
  {
    id: "tasks",
    question: "Which of these do you still handle manually?",
    hint: "Select all that apply",
    type: "multi",
    options: [
      { id: "invoicing", label: "Invoicing & billing" },
      { id: "sales_followup", label: "Sales follow-up & outreach" },
      { id: "scheduling", label: "Scheduling & appointments" },
      { id: "reporting", label: "Reporting & data entry" },
      { id: "hr_onboarding", label: "HR & employee onboarding" },
      { id: "customer_support", label: "Customer support & queries" },
      { id: "social_media", label: "Social media & content" },
      { id: "inventory", label: "Inventory & order management" },
    ],
  },
  {
    id: "hours",
    question: "How many hours per week does your team spend on these tasks?",
    type: "single",
    options: [
      { id: "low", label: "Less than 5 hours", sub: "Minimal manual load" },
      { id: "medium", label: "5–15 hours", sub: "Moderate admin time" },
      { id: "high", label: "15–30 hours", sub: "Significant time sink" },
      { id: "very_high", label: "More than 30 hours", sub: "Major bottleneck" },
    ],
  },
  {
    id: "dataOrg",
    question: "How is your data currently stored and managed?",
    type: "single",
    options: [
      {
        id: "spreadsheets",
        label: "Mainly spreadsheets and email",
        sub: "No connected business software",
      },
      {
        id: "separate",
        label: "We use tools, but they work separately",
        sub: "Each system lives in its own silo",
      },
      {
        id: "some",
        label: "Some tools are connected",
        sub: "Partial integration in place",
      },
      {
        id: "integrated",
        label: "Fully connected systems",
        sub: "Data flows automatically between tools",
      },
    ],
  },
  {
    id: "frustration",
    question: "What's your biggest frustration right now?",
    type: "single",
    options: [
      {
        id: "cracks",
        label: "Things fall through the cracks",
        sub: "Tasks and follow-ups get missed",
      },
      {
        id: "repetitive",
        label: "Too much repetitive admin work",
        sub: "Manual tasks eating up time",
      },
      {
        id: "visibility",
        label: "Hard to see what's happening",
        sub: "Lack of reporting and oversight",
      },
      {
        id: "scaling",
        label: "Team is stretched as we grow",
        sub: "Growth is creating chaos",
      },
      {
        id: "unsure",
        label: "Not sure where automation fits",
        sub: "Want to explore the options first",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Bottleneck copy (problem + automation outcome)
// ---------------------------------------------------------------------------

const TASK_COPY: Record<
  string,
  { headline: string; detail: string; outcome: string }
> = {
  invoicing: {
    headline: "Invoicing & Billing",
    detail:
      "Your billing cycle likely has 4–6 manual touchpoints per client. Every missed follow-up is revenue delayed or lost.",
    outcome:
      "What changes: invoices go out automatically on trigger, payment reminders chase themselves, reconciliation happens in the background.",
  },
  sales_followup: {
    headline: "Sales Follow-up",
    detail:
      "Leads go cold in 24–48 hours without contact. Manual follow-up means the busier your team gets, the more deals slip through.",
    outcome:
      "What changes: every lead gets a personalised sequence the moment they enter your pipeline, whether your team is in a meeting or off for the weekend.",
  },
  scheduling: {
    headline: "Scheduling & Appointments",
    detail:
      "Back-and-forth booking takes 2–4 hours per week on average. That's 100+ hours a year spent on something that should take zero.",
    outcome:
      "What changes: clients book directly into your calendar, reminders go out automatically, and rescheduling happens without a single email.",
  },
  reporting: {
    headline: "Reporting & Data Entry",
    detail:
      "Manual reporting is slow and error-prone. By the time a report reaches a decision-maker, it's already out of date.",
    outcome:
      "What changes: live dashboards updated in real time, your weekly numbers ready without anyone pulling them together.",
  },
  hr_onboarding: {
    headline: "HR & Onboarding",
    detail:
      "A new hire typically touches 10+ manual steps before their first day. Delays here cost you their early productivity and your credibility as an employer.",
    outcome:
      "What changes: contracts sent, accounts created, training assigned, and day-one check-ins scheduled, all done before they walk through the door.",
  },
  customer_support: {
    headline: "Customer Support",
    detail:
      "Up to 70% of support queries are repetitive. Every one your team handles manually is time taken away from the issues that actually need them.",
    outcome:
      "What changes: common queries answered instantly, tickets routed correctly, your team spending their time only on what genuinely needs a human.",
  },
  social_media: {
    headline: "Social Media & Content",
    detail:
      "Inconsistent posting kills reach. Managing content manually across multiple platforms is unsustainable for most small teams.",
    outcome:
      "What changes: content approved once and distributed on schedule across every channel, no one logging into five different platforms every day.",
  },
  inventory: {
    headline: "Inventory & Orders",
    detail:
      "Manual inventory tracking leads to stockouts, overselling, and customer complaints that rarely come back.",
    outcome:
      "What changes: stock levels monitored around the clock, reorders triggered automatically, overselling prevented across every channel at once.",
  },
};

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

type Answers = {
  teamSize: string;
  tasks: string[];
  hours: string;
  dataOrg: string;
  frustration: string;
};

function computeResults(answers: Answers) {
  // Team size → scale factor
  const teamScoreMap: Record<string, number> = {
    solo: 15,
    small: 38,
    medium: 65,
    large: 85,
  };
  const teamScore = teamScoreMap[answers.teamSize] ?? 40;

  // Hours → urgency / cost weight
  const hoursScoreMap: Record<string, number> = {
    low: 15,
    medium: 40,
    high: 70,
    very_high: 90,
  };
  const hoursScore = hoursScoreMap[answers.hours] ?? 40;

  // Manual tasks count → process load
  const taskScore = Math.min(answers.tasks.length * 11, 95);

  // Data organisation → technical readiness
  const techScoreMap: Record<string, number> = {
    spreadsheets: 20,
    separate: 45,
    some: 65,
    integrated: 85,
  };
  const technicalReadiness = techScoreMap[answers.dataOrg] ?? 35;

  // Three sub-scores (0–100)
  const roiPotential = Math.round((teamScore + hoursScore) / 2);
  const processBottleneck = Math.round((taskScore + hoursScore) / 2);

  // Overall weighted score
  const overall = Math.round(
    roiPotential * 0.4 + processBottleneck * 0.35 + technicalReadiness * 0.25
  );

  // Financial estimate (monthly)
  // Hours question asks about team total, so no team multiplier needed
  const hoursMonthMap: Record<string, number> = {
    low: 13,
    medium: 43,
    high: 95,
    very_high: 172,
  };
  const hoursMonth = hoursMonthMap[answers.hours] ?? 43;
  const financialEstimate = Math.round((hoursMonth * 35) / 100) * 100;
  const recoveryLow = Math.round((financialEstimate * 0.6) / 100) * 100;
  const recoveryHigh = Math.round((financialEstimate * 0.8) / 100) * 100;

  // Industry benchmark by team size
  const benchmarkMap: Record<string, number> = {
    solo: 48,
    small: 54,
    medium: 61,
    large: 68,
  };
  const benchmark = benchmarkMap[answers.teamSize] ?? 55;

  // Score label + honest explanation based on actual score
  let scoreLabel: string;
  let scoreExplanation: string;
  if (overall >= 65) {
    scoreLabel = "Strong Case for Automation";
    scoreExplanation =
      "Based on what you described, there are multiple areas in your business where automation would have a measurable, near-term impact. The ROI case is clear.";
  } else if (overall >= 45) {
    scoreLabel = "Selective Opportunity";
    scoreExplanation =
      "There are specific areas worth addressing, but automation is not a blanket solution for your situation. Two or three targeted fixes are likely more valuable than a broad implementation.";
  } else if (overall >= 25) {
    scoreLabel = "Limited Immediate Fit";
    scoreExplanation =
      "Based on your answers, most of your workload involves judgment, relationships, or complexity that automation does not handle well yet. There may be one or two tasks at the edges worth looking at, but it should not be a priority right now.";
  } else {
    scoreLabel = "Not the Right Moment";
    scoreExplanation =
      "Honestly, automation is probably not where your attention should go right now. Your work appears to rely heavily on human judgment and interaction. Focus on building your processes first, and revisit this when the manual, repeatable work starts to pile up.";
  }

  // Top 3 bottlenecks from selected tasks
  const bottlenecks = answers.tasks
    .slice(0, 3)
    .map((t) => TASK_COPY[t])
    .filter(Boolean);

  // Readiness barrier
  let barrier: { label: string; message: string } | null = null;
  if (overall >= 25) {
    if (technicalReadiness < 40) {
      barrier = {
        label: "You're building it all by hand",
        message:
          "Every week, someone on your team is doing work that a $50/month tool handles automatically. Your competitors who have already set this up are spending that time on things that actually move the needle. One properly implemented solution can pay for itself within the first month, no developer required.",
      };
    } else if (technicalReadiness < 65) {
      barrier = {
        label: "Your tools are working at 30% capacity",
        message:
          "You're paying for software that's only doing part of its job. Every day your systems sit disconnected, data gets lost, tasks get missed, and your team manually bridges gaps that should be invisible. That is not a software problem, it's a configuration problem. And it's solvable in days, not months.",
      };
    } else {
      barrier = {
        label: "You're set up to automate but not yet doing it",
        message:
          "You have the tools. Businesses with the same stack but a connected workflow are processing in minutes what takes your team hours. Everything is already in place, it just needs to be wired together. The longer you wait, the more ground you hand to whoever moves first.",
      };
    }
  }

  return {
    overall,
    scoreLabel,
    scoreExplanation,
    roiPotential,
    processBottleneck,
    technicalReadiness,
    financialEstimate,
    recoveryLow,
    recoveryHigh,
    benchmark,
    bottlenecks,
    barrier,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuditQuiz({ newTab = false }: { newTab?: boolean } = {}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({
    tasks: [],
  });
  const [showResults, setShowResults] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [subScoresVisible, setSubScoresVisible] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // On the /audit page, read answers from URL params and jump straight to results
  useEffect(() => {
    if (newTab) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const encoded = params.get("a");
      if (encoded) {
        const decoded = JSON.parse(atob(encoded)) as Partial<Answers>;
        setAnswers(decoded);
        setShowResults(true);
      }
    } catch {
      // malformed param — ignore, show quiz normally
    }
  }, [newTab]);

  const currentQuestion = QUESTIONS[step];

  function advance(newAnswers: Partial<Answers>) {
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 200);
    } else if (newTab) {
      // Open results in a new tab, then reset the homepage quiz
      const encoded = btoa(JSON.stringify(newAnswers));
      window.open(`/audit?a=${encoded}`, "_blank");
      setTimeout(() => {
        setStep(0);
        setAnswers({ tasks: [] });
      }, 300);
    } else {
      setTimeout(() => {
        setShowResults(true);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }, 200);
    }
  }

  function handleSingleSelect(questionId: string, optionId: string) {
    setAnswers({ ...answers, [questionId]: optionId });
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  function handleMultiToggle(optionId: string) {
    const current = (answers.tasks ?? []) as string[];
    const updated = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    setAnswers({ ...answers, tasks: updated });
  }

  function handleNext() {
    advance(answers);
  }

  // Animate score counter
  useEffect(() => {
    if (!showResults) return;
    const r = computeResults(answers as Answers);
    let current = 0;
    const target = r.overall;
    const interval = setInterval(() => {
      current += 2;
      if (current >= target) {
        current = target;
        clearInterval(interval);
        setTimeout(() => setSubScoresVisible(true), 200);
      }
      setAnimatedScore(current);
    }, 18);
    return () => clearInterval(interval);
  }, [showResults, answers]);

  const results = showResults ? computeResults(answers as Answers) : null;
  const multiSelected = (answers.tasks ?? []) as string[];

  return (
    <div>
      {/* ------------------------------------------------------------------ */}
      {/* Quiz card                                                           */}
      {/* ------------------------------------------------------------------ */}
      {!showResults && (
        <div className="bg-white border border-border rounded-2xl shadow-sm p-8 md:p-10">
          {/* Progress bar */}
          <div className="flex items-center gap-1.5 mb-8">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i < step
                    ? "bg-primary"
                    : i === step
                    ? "bg-primary/50"
                    : "bg-border"
                }`}
              />
            ))}
          </div>

          {/* Step label + question */}
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-3">
            Step {step + 1} of {QUESTIONS.length}
          </p>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {currentQuestion.question}
          </h2>
          {currentQuestion.hint && (
            <p className="text-sm text-muted-foreground mb-6">
              {currentQuestion.hint}
            </p>
          )}

          {/* Options */}
          <div className="mt-6">
            {currentQuestion.type === "single" ? (
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((opt) => {
                  const isSelected =
                    answers[currentQuestion.id as keyof Answers] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() =>
                        handleSingleSelect(currentQuestion.id, opt.id)
                      }
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/40 hover:bg-secondary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`font-medium text-sm ${
                              isSelected ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {opt.label}
                          </p>
                          {opt.sub && (
                            <p
                              className={`text-xs mt-0.5 ${
                                isSelected
                                  ? "text-primary/70"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {opt.sub}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}

                {/* Single-select action row */}
                <div className="flex gap-3 mt-4">
                  {step > 0 && (
                    <button
                      onClick={goBack}
                      className="px-5 py-3.5 rounded-xl border border-border bg-background hover:bg-secondary/30 transition-colors font-medium text-sm text-muted-foreground"
                    >
                      ← Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={!answers[currentQuestion.id as keyof Answers]}
                    className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {step === QUESTIONS.length - 1 ? "See My Results" : "Continue"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = multiSelected.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleMultiToggle(opt.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:border-primary/40 hover:bg-secondary/30"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-border"
                          }`}
                        >
                          {isSelected && (
                            <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                              <path
                                d="M2 6L5 9L10 3"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Multi-select action row */}
                <div className="flex gap-3">
                  {step > 0 && (
                    <button
                      onClick={goBack}
                      className="px-5 py-3.5 rounded-xl border border-border bg-background hover:bg-secondary/30 transition-colors font-medium text-sm text-muted-foreground"
                    >
                      ← Back
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                  >
                    {step === QUESTIONS.length - 1 ? "See My Results" : "Continue"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Results                                                             */}
      {/* ------------------------------------------------------------------ */}
      {showResults && results && (
        <div ref={resultsRef} className="space-y-5">

          {/* Score card */}
          <div className="bg-white border border-border rounded-2xl shadow-sm p-8 md:p-10">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-6 text-center">
              Your Automation Opportunity Score
            </p>

            {/* Big score + label */}
            <div className="flex items-end justify-center gap-1 mb-1">
              <span className="text-8xl font-black text-primary leading-none">
                {animatedScore}
              </span>
              <span className="text-3xl font-bold text-muted-foreground mb-3">
                /100
              </span>
            </div>
            <p className="text-center font-semibold text-foreground mb-1">
              {results.scoreLabel}
            </p>
            <p className="text-sm text-muted-foreground text-center mb-3">
              Businesses like yours average{" "}
              <span className="font-semibold text-foreground">
                {results.benchmark}/100
              </span>
            </p>
            <p className="text-xs text-muted-foreground text-center bg-secondary/30 rounded-lg px-4 py-2 mb-8">
              {results.scoreExplanation}
            </p>

            {/* Sub-scores */}
            <div className="space-y-5 border-t border-border pt-6">
              {[
                {
                  label: "ROI Potential",
                  value: results.roiPotential,
                  icon: TrendingUp,
                  hint: "Based on team size and time spent",
                },
                {
                  label: "Process Bottleneck",
                  value: results.processBottleneck,
                  icon: BarChart2,
                  hint: "Volume of manual work in your business",
                },
                {
                  label: "Technical Readiness",
                  value: results.technicalReadiness,
                  icon: Zap,
                  hint: "How prepared your setup is for automation",
                },
              ].map(({ label, value, icon: Icon, hint }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-semibold text-foreground">
                        {label}
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {hint}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground tabular-nums">
                      {value}/100
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                      style={{ width: subScoresVisible ? `${value}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial estimate */}
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 md:p-8">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">
              What Manual Work Is Costing You
            </p>
            <p className="text-xs text-muted-foreground mb-4">Per month, in lost productivity</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-black text-foreground">
                ~${results.financialEstimate.toLocaleString()}
              </span>
              <span className="text-base font-medium text-muted-foreground">
                /month
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              This is not how much automation costs. It&apos;s how much you&apos;re
              already spending on work that automation handles automatically, calculated
              on your team&apos;s manual hours at a blended $35/hr productivity rate.
            </p>
            <div className="border-t border-primary/15 pt-4">
              <p className="text-sm font-semibold text-foreground">
                Automation typically recovers 60–80% of this:
              </p>
              <p className="text-lg font-bold text-primary mt-0.5">
                ~${results.recoveryLow.toLocaleString()} – ${results.recoveryHigh.toLocaleString()}/month back into your business
              </p>
            </div>
          </div>

          {/* Top bottlenecks */}
          {results.bottlenecks.length > 0 && (
            <div className="bg-white border border-border rounded-2xl shadow-sm p-6 md:p-8">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-6">
                Your Top Bottlenecks and What Changes
              </p>
              <div className="space-y-6">
                {results.bottlenecks.map((b, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-foreground mb-1">
                        {b.headline}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        {b.detail}
                      </p>
                      <p className="text-sm text-primary font-medium leading-relaxed bg-primary/5 rounded-lg px-3 py-2">
                        → {b.outcome}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Readiness barrier — only shown for scores >= 25 */}
          {results.barrier && (
            <div className="bg-white border border-border rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex gap-3 mb-3">
                <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">
                  Your Main Barrier
                </p>
              </div>
              <p className="font-bold text-foreground mb-3 text-base">
                {results.barrier.label}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {results.barrier.message}
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-br from-primary/8 via-primary/3 to-background border border-border rounded-2xl p-8 md:p-10 text-center">
            <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-3">
              What&apos;s Next
            </p>
            {results.overall >= 45 ? (
              <>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  You know where the gaps are.
                  <br />
                  Now get expert opinions on how to close them.
                </h3>
                <p className="text-sm text-muted-foreground mb-7 max-w-md mx-auto leading-relaxed">
                  A Discovery Scan connects you with automation experts who review
                  your situation and submit bids, so you get real options, not
                  generic advice.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/solutions"
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:-translate-y-0.5 flex items-center gap-2 duration-200"
                  >
                    Book a Discovery Scan <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/solutions"
                    className="px-6 py-3 rounded-xl border border-border bg-white hover:bg-secondary/30 transition-colors font-medium text-sm"
                  >
                    Browse Ready-Made Solutions
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Come back when the time is right.
                </h3>
                <p className="text-sm text-muted-foreground mb-7 max-w-md mx-auto leading-relaxed">
                  When your manual workload starts piling up and the same tasks
                  keep repeating, that is when automation earns its place. Bookmark
                  this and retake it in a few months.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/solutions"
                    className="px-6 py-3 rounded-xl border border-border bg-white hover:bg-secondary/30 transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    Browse What&apos;s Possible <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Retake */}
          <p className="text-center text-xs text-muted-foreground pb-4">
            <button
              onClick={() => {
                setStep(0);
                setAnswers({ tasks: [] });
                setShowResults(false);
                setAnimatedScore(0);
                setSubScoresVisible(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Retake the audit
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
