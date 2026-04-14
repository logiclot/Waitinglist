"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Zap,
  AlertCircle,
  BarChart2,
  Clock,
  Users,
  Mail,
  Loader2,
  UserPlus,
} from "lucide-react";
import { Solution } from "@/types";
import { getAuditRecommendationsScored } from "@/lib/solutions/related-matcher";
import { SmartEmptyState } from "@/components/solutions/SmartEmptyState";

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
    id: "strengths",
    question: "What\u2019s already running smoothly?",
    hint: "Select any that apply, even if they are also manual. If it works well, it counts.",
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
];

// ---------------------------------------------------------------------------
// Bottleneck copy (problem + automation outcome)
// ---------------------------------------------------------------------------

const TASK_COPY: Record<
  string,
  { headline: string; detail: string; outcome: string; before: string; after: string }
> = {
  invoicing: {
    headline: "Invoicing & Billing",
    detail:
      "Your billing cycle likely has 4–6 manual touchpoints per client. Every missed follow-up is revenue delayed or lost.",
    outcome:
      "What changes: invoices go out automatically on trigger, payment reminders chase themselves, reconciliation happens in the background.",
    before: "Manually creating, sending, and chasing every invoice",
    after: "Invoices sent and followed up automatically",
  },
  sales_followup: {
    headline: "Sales Follow-up",
    detail:
      "Leads go cold in 24–48 hours without contact. Manual follow-up means the busier your team gets, the more deals slip through.",
    outcome:
      "What changes: every lead gets a personalised sequence the moment they enter your pipeline, whether your team is in a meeting or off for the weekend.",
    before: "Remembering to follow up on every lead manually",
    after: "Leads contacted automatically within minutes",
  },
  scheduling: {
    headline: "Scheduling & Appointments",
    detail:
      "Back-and-forth booking takes 2–4 hours per week on average. That's 100+ hours a year spent on something that should take zero.",
    outcome:
      "What changes: clients book directly into your calendar, reminders go out automatically, and rescheduling happens without a single email.",
    before: "Back-and-forth emails to find a time that works",
    after: "Clients book directly, reminders go out on their own",
  },
  reporting: {
    headline: "Reporting & Data Entry",
    detail:
      "Manual reporting is slow and error-prone. By the time a report reaches a decision-maker, it's already out of date.",
    outcome:
      "What changes: live dashboards updated in real time, your weekly numbers ready without anyone pulling them together.",
    before: "Pulling numbers from multiple tools into a spreadsheet",
    after: "Live dashboards updated in real time",
  },
  hr_onboarding: {
    headline: "HR & Onboarding",
    detail:
      "A new hire typically touches 10+ manual steps before their first day. Delays here cost you their early productivity and your credibility as an employer.",
    outcome:
      "What changes: contracts sent, accounts created, training assigned, and day-one check-ins scheduled, all done before they walk through the door.",
    before: "10+ manual tasks per new hire before day one",
    after: "Contracts, accounts, and training handled automatically",
  },
  customer_support: {
    headline: "Customer Support",
    detail:
      "Up to 70% of support queries are repetitive. Every one your team handles manually is time taken away from the issues that actually need them.",
    outcome:
      "What changes: common queries answered instantly, tickets routed correctly, your team spending their time only on what genuinely needs a human.",
    before: "Every query handled by a person, even repeat questions",
    after: "Common questions answered instantly, team handles the rest",
  },
  social_media: {
    headline: "Social Media & Content",
    detail:
      "Inconsistent posting kills reach. Managing content manually across multiple platforms is unsustainable for most small teams.",
    outcome:
      "What changes: content approved once and distributed on schedule across every channel, no one logging into five different platforms every day.",
    before: "Logging into each platform to post and schedule manually",
    after: "Content approved once, published everywhere on schedule",
  },
  inventory: {
    headline: "Inventory & Orders",
    detail:
      "Manual inventory tracking leads to stockouts, overselling, and customer complaints that rarely come back.",
    outcome:
      "What changes: stock levels monitored around the clock, reorders triggered automatically, overselling prevented across every channel at once.",
    before: "Checking stock levels and placing reorders by hand",
    after: "Stock monitored 24/7, reorders triggered automatically",
  },
};

// ---------------------------------------------------------------------------
// Strength copy (lock-in angle — for processes already working well)
// ---------------------------------------------------------------------------

const STRENGTH_COPY: Record<
  string,
  { headline: string; detail: string; outcome: string; status: string; next: string }
> = {
  invoicing: {
    headline: "Invoicing & Billing",
    detail:
      "Your billing process works. Clients get invoiced, payments come in, follow-ups happen. That means the requirements are clear, the waste is gone, and the process is optimised.",
    outcome:
      "Automation locks it in: invoices trigger themselves, reminders run on schedule, reconciliation happens without anyone watching. Your team never touches it again.",
    status: "Process is dialled in and repeatable",
    next: "Automate it so your team never has to think about it",
  },
  sales_followup: {
    headline: "Sales Follow-up",
    detail:
      "Your follow-up cadence is working. Leads get contacted, sequences run, and deals move through the pipeline. That is a solved process, and a human should not be the one running it.",
    outcome:
      "Automation locks it in: every lead gets the same proven sequence instantly, whether your team is in a meeting, on holiday, or scaling from 50 leads to 500.",
    status: "Follow-up cadence is proven and consistent",
    next: "Let automation run it at scale without dropping a lead",
  },
  scheduling: {
    headline: "Scheduling & Appointments",
    detail:
      "Bookings happen, calendars stay accurate, and clients show up. You have already eliminated the chaos. Now eliminate the effort.",
    outcome:
      "Automation locks it in: clients self-book, reminders fire automatically, rescheduling happens without a single email. Zero human time on a solved problem.",
    status: "Scheduling process works and rarely breaks",
    next: "Remove the human effort from a process that no longer needs it",
  },
  reporting: {
    headline: "Reporting & Data Entry",
    detail:
      "Your reports land on time and decision-makers trust the numbers. The format is stable, the sources are known. That means it is ready to run itself.",
    outcome:
      "Automation locks it in: dashboards update in real time, weekly reports compile and send themselves. No one pulls data manually ever again.",
    status: "Reports are accurate and delivered consistently",
    next: "Automate the assembly so your team focuses on insight, not data entry",
  },
  hr_onboarding: {
    headline: "HR & Onboarding",
    detail:
      "New hires get set up properly. Contracts go out, accounts get created, and day-one is smooth. That is a repeatable process running on human effort alone.",
    outcome:
      "Automation locks it in: the entire checklist executes itself the moment someone is hired. Contracts, accounts, training, and check-ins, all handled before they walk through the door.",
    status: "Onboarding process is reliable and complete",
    next: "Let automation run the checklist so HR handles exceptions only",
  },
  customer_support: {
    headline: "Customer Support",
    detail:
      "Customers get answers, tickets get resolved, and satisfaction stays high. The playbook exists. Now stop making your team run it manually for every single query.",
    outcome:
      "Automation locks it in: common questions answered instantly, tickets routed correctly, and your team only handles the conversations that genuinely need a human.",
    status: "Support quality is consistent and customers are satisfied",
    next: "Automate the repeatable queries so your team handles only what matters",
  },
  social_media: {
    headline: "Social Media & Content",
    detail:
      "Content goes out on schedule, across the right channels, and engagement is steady. The strategy is working, but the execution costs more time than it should.",
    outcome:
      "Automation locks it in: content approved once, published everywhere on schedule. No one logs into five platforms. The strategy keeps running even when the team is focused elsewhere.",
    status: "Content cadence is consistent and effective",
    next: "Automate distribution so creative energy stays on strategy, not posting",
  },
  inventory: {
    headline: "Inventory & Orders",
    detail:
      "Stock levels are accurate, orders ship on time, and stockouts are rare. That means the rules are clear and the process is optimised. It just should not need a person watching it.",
    outcome:
      "Automation locks it in: stock monitored around the clock, reorders triggered automatically, overselling prevented across every channel. Human oversight becomes optional.",
    status: "Inventory tracking is accurate and orders flow smoothly",
    next: "Automate monitoring and reordering so no one checks stock manually",
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
  strengths: string[];
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

  // Process maturity — from strengths (things already working well)
  const strengthsCount = (answers.strengths ?? []).length;
  const processMaturity = Math.min(strengthsCount * 12, 95);

  // Four sub-scores (0–100)
  const roiPotential = Math.round((teamScore + hoursScore) / 2);
  const processBottleneck = Math.round((taskScore + hoursScore) / 2);

  // Overall: base calculation unchanged, maturity is a purely additive bonus
  const baseOverall = Math.round(
    roiPotential * 0.4 + processBottleneck * 0.35 + technicalReadiness * 0.25
  );
  const maturityBonus = Math.round(processMaturity * 0.15);
  const overall = Math.min(baseOverall + maturityBonus, 100);

  // Financial estimate (monthly)
  // Hours question asks about team total, so no team multiplier needed
  const hoursMonthMap: Record<string, number> = {
    low: 13,
    medium: 43,
    high: 95,
    very_high: 172,
  };
  const hoursMonth = hoursMonthMap[answers.hours] ?? 43;
  const financialEstimate = Math.round((hoursMonth * 25) / 100) * 100;
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
    scoreLabel = "Targeted Wins Available";
    scoreExplanation =
      "You have two or three areas where a focused automation fix would pay for itself quickly. The smartest move is to start with the highest-impact bottleneck and build from there.";
  } else if (overall >= 25) {
    scoreLabel = "Early Stage - Build the Foundation";
    scoreExplanation =
      "You are at the stage where one or two well-chosen automations could free up real time. The key is picking the right starting point, and that is what the recommendations below are for.";
  } else {
    scoreLabel = "Laying the Groundwork";
    scoreExplanation =
      "Your business is still building the processes that automation works best on top of. When the same manual tasks start repeating weekly, that is the right moment to act, and we will be here when you are ready.";
  }

  // Annual ROI comparison
  const annualWaste = financialEstimate * 12;
  const typicalFixCost = 2500; // slightly above average so real prices feel like a deal
  const roiMultiplier = Math.round((annualWaste / typicalFixCost) * 10) / 10;

  // Urgency: monthly cost of inaction
  const urgencyMonthly = financialEstimate;

  // Social proof: % of similar companies already automating
  const socialProofMap: Record<string, number> = {
    solo: 34,
    small: 52,
    medium: 67,
    large: 81,
  };
  const socialProofPct = socialProofMap[answers.teamSize] ?? 50;

  // Top 3 bottlenecks from selected tasks
  const bottlenecks = answers.tasks
    .slice(0, 3)
    .map((t) => TASK_COPY[t])
    .filter(Boolean);

  // Top 3 strengths (processes already working well)
  const strengths = (answers.strengths ?? [])
    .slice(0, 3)
    .map((t) => STRENGTH_COPY[t])
    .filter(Boolean);

  // Readiness barrier
  let barrier: { label: string; message: string } | null = null;
  if (overall >= 25) {
    if (technicalReadiness < 40) {
      barrier = {
        label: "You're building it all by hand",
        message:
          "Every week, someone on your team is doing work that a €50/month tool handles automatically. Your competitors who have already set this up are spending that time on things that actually move the needle. One properly implemented solution can pay for itself within the first month, no developer required.",
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
    processMaturity,
    financialEstimate,
    recoveryLow,
    recoveryHigh,
    benchmark,
    bottlenecks,
    strengths,
    barrier,
    annualWaste,
    typicalFixCost,
    roiMultiplier,
    urgencyMonthly,
    socialProofPct,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuditQuiz({ newTab = false, solutions = [], prelaunch = false }: { newTab?: boolean; solutions?: Solution[]; prelaunch?: boolean } = {}) {
  const { data: session } = useSession();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({
    tasks: [],
    strengths: [],
  });
  const [showResults, setShowResults] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [subScoresVisible, setSubScoresVisible] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [sessionId] = useState(() => crypto.randomUUID());
  const hasTrackedStart = useRef(false);

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

  function trackAudit(event: string, extra?: Record<string, unknown>) {
    const payload = JSON.stringify({ sessionId, event, ...extra });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/audit/track", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/audit/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => { });
    }
  }

  function advance(newAnswers: Partial<Answers>) {
    setAnswers(newAnswers);
    trackAudit("step_complete", { step });
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(step + 1), 200);
    } else if (newTab) {
      // Track completion before opening new tab
      const r = computeResults(newAnswers as Answers);
      trackAudit("quiz_complete", { score: r.overall, scoreLabel: r.scoreLabel, answers: newAnswers });
      // Open results in a new tab, then reset the homepage quiz
      const encoded = btoa(JSON.stringify(newAnswers));
      window.open(`/audit?a=${encoded}`, "_blank");
      setTimeout(() => {
        setStep(0);
        setAnswers({ tasks: [], strengths: [] });
      }, 300);
    } else {
      const r = computeResults(newAnswers as Answers);
      trackAudit("quiz_complete", { score: r.overall, scoreLabel: r.scoreLabel, answers: newAnswers });
      setTimeout(() => {
        setShowResults(true);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }, 200);
    }
  }

  function handleSingleSelect(questionId: string, optionId: string) {
    if (!hasTrackedStart.current) {
      trackAudit("quiz_start");
      hasTrackedStart.current = true;
    }
    setAnswers({ ...answers, [questionId]: optionId });
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  function handleMultiToggle(questionId: string, optionId: string) {
    if (!hasTrackedStart.current) {
      trackAudit("quiz_start");
      hasTrackedStart.current = true;
    }
    const current = ((answers as Record<string, unknown>)[questionId] ?? []) as string[];
    const updated = current.includes(optionId)
      ? current.filter((id) => id !== optionId)
      : [...current, optionId];
    setAnswers({ ...answers, [questionId]: updated });
  }

  function handleNext() {
    advance(answers);
  }

  async function handleSendReport() {
    if (!email || emailSending) return;
    setEmailSending(true);
    setEmailError("");
    try {
      const res = await fetch("/api/audit/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, answers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send");
      }
      setEmailSent(true);
      trackAudit("email_sent", { email });
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEmailSending(false);
    }
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
  const multiSelected = ((answers as Record<string, unknown>)[QUESTIONS[step]?.id] ?? []) as string[];

  // Compute solution recommendations based on audit answers (scored, always 3)
  const scoredRecommendations = useMemo(() => {
    if (!showResults || !answers.tasks || answers.tasks.length === 0) return [];
    return getAuditRecommendationsScored(
      solutions,
      answers.tasks as string[],
      3,
      (answers.strengths ?? []) as string[],
    );
  }, [showResults, answers.tasks, answers.strengths, solutions]);

  const recommendedSolutions = useMemo(
    () => scoredRecommendations.map((r) => r.solution),
    [scoredRecommendations]
  );

  const matchLabels = useMemo(() => {
    const map = new Map<string, "Best Match" | "Strong Match" | "Partial Match">();
    for (const r of scoredRecommendations) {
      map.set(r.solution.id, r.matchLabel);
    }
    return map;
  }, [scoredRecommendations]);

  return (
    <div>
      {/* ------------------------------------------------------------------ */}
      {/* Quiz card                                                           */}
      {/* ------------------------------------------------------------------ */}
      {!showResults && (
        <div className="bg-white border border-border rounded-2xl shadow-sm p-8 md:p-10 max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="flex items-center gap-1.5 mb-8">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < step
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
                      className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background hover:border-primary/40 hover:bg-secondary/30"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`font-medium text-sm ${isSelected ? "text-primary" : "text-foreground"
                              }`}
                          >
                            {opt.label}
                          </p>
                          {opt.sub && (
                            <p
                              className={`text-xs mt-0.5 ${isSelected
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
                        onClick={() => handleMultiToggle(currentQuestion.id, opt.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/40 hover:bg-secondary/30"
                          }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${isSelected
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
                          className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"
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

          {/* Score, financial, bottlenecks — keep narrow and centered */}
          <div className="max-w-2xl mx-auto space-y-5">

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
              <p className="text-xs text-muted-foreground text-center bg-secondary/30 rounded-lg px-4 py-2 mb-4">
                {results.scoreExplanation}
              </p>

              {/* Social proof */}
              <div className="flex items-center justify-center gap-2 mb-8 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{results.socialProofPct}%</span> of companies your size have already automated this
                </span>
              </div>

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
                  {
                    label: "Process Maturity",
                    value: results.processMaturity,
                    icon: CheckCircle2,
                    hint: "How well your current processes are working",
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
            <div className="bg-white border border-border rounded-2xl shadow-sm p-6 md:p-8">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1">
                What Manual Work Is Costing You
              </p>
              <p className="text-xs text-muted-foreground mb-4">Per month, in lost productivity</p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-black text-foreground">
                  ~&euro;{results.financialEstimate.toLocaleString()}
                </span>
                <span className="text-base font-medium text-muted-foreground">
                  /month
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                This is not how much automation costs. It&apos;s how much you&apos;re
                already spending on work that automation handles automatically, based
                on your team&apos;s manual hours at a blended &euro;25/hr productivity rate.
              </p>
              <div className="border-t border-border pt-4 mb-4">
                <p className="text-sm font-semibold text-foreground">
                  Automation typically recovers 60–80% of this:
                </p>
                <p className="text-lg font-bold text-primary mt-0.5">
                  ~&euro;{results.recoveryLow.toLocaleString()} – &euro;{results.recoveryHigh.toLocaleString()}/month back into your business
                </p>
              </div>

              {/* Annual ROI comparison */}
              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-3">
                  Annual Comparison
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[120px] bg-secondary/50 border border-border rounded-xl px-4 py-3 text-center">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Lost per year</p>
                    <p className="text-lg font-black text-foreground">&euro;{results.annualWaste.toLocaleString()}</p>
                  </div>
                  <span className="text-muted-foreground font-bold text-lg">vs</span>
                  <div className="flex-1 min-w-[120px] bg-secondary/50 border border-border rounded-xl px-4 py-3 text-center">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Typical one-time fix</p>
                    <p className="text-lg font-black text-foreground">&euro;{results.typicalFixCost.toLocaleString()}</p>
                  </div>
                  <span className="text-muted-foreground font-bold text-lg">=</span>
                  <div className="flex-1 min-w-[80px] bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-center">
                    <p className="text-xs text-primary font-medium mb-1">ROI</p>
                    <p className="text-lg font-black text-primary">{results.roiMultiplier}x</p>
                  </div>
                </div>
              </div>

              {/* Urgency note */}
              <div className="flex items-center gap-2 border-t border-border pt-4 mt-4">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Every month you wait = <span className="font-semibold text-foreground">&euro;{results.urgencyMonthly.toLocaleString()}</span> more spent on work a machine should do
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

                        {/* Before / After */}
                        <div className="text-xs text-muted-foreground mb-2 space-y-1">
                          <p><span className="font-semibold text-foreground">Today:</span> {b.before}</p>
                          <p><span className="font-semibold text-primary">After:</span> {b.after}</p>
                        </div>

                        <p className="text-sm text-primary font-medium leading-relaxed bg-primary/5 rounded-lg px-3 py-2">
                          → {b.outcome}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Automation-ready processes — strengths */}
            {results.strengths.length > 0 && (
              <div className="bg-white border border-border rounded-2xl shadow-sm p-6 md:p-8">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-2">
                  Automation-Ready Processes
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  These processes are already working well. The requirements are clear, the waste has been
                  cut, and the flow is optimised. When something is repetitive because it works,
                  not because it&apos;s broken, a human should not be the one running it.
                  Automation locks in the result and frees your team for work that genuinely needs them.
                </p>
                <div className="space-y-6">
                  {results.strengths.map((s, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-foreground mb-1">
                          {s.headline}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                          {s.detail}
                        </p>

                        {/* Status / Next */}
                        <div className="text-xs text-muted-foreground mb-2 space-y-1">
                          <p><span className="font-semibold text-green-700">Status:</span> {s.status}</p>
                          <p><span className="font-semibold text-primary">Next:</span> {s.next}</p>
                        </div>

                        <p className="text-sm text-green-800 font-medium leading-relaxed bg-green-50 rounded-lg px-3 py-2">
                          &rarr; {s.outcome}
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

            {/* Email capture — send report */}
            <div className="bg-white border border-border rounded-2xl shadow-sm p-6 md:p-8">
              <div className="flex items-start gap-3 mb-4">
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground text-sm">Send my report</p>
                  <p className="text-xs text-muted-foreground">
                    Get these results in your inbox so you can share them with your team or come back later.
                  </p>
                </div>
              </div>
              {emailSent ? (
                <div>
                  <div className="flex items-center gap-2 bg-primary/5 border border-primary/15 rounded-lg px-4 py-3 text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>Report sent to <span className="font-semibold">{email}</span>. Check your inbox (and spam folder).</span>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => { setEmailSent(false); setEmailError(""); }}
                      className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                      Resend
                    </button>
                    <button
                      onClick={() => { setEmailSent(false); setEmail(""); setEmailError(""); }}
                      className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                      Use a different email
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendReport()}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleSendReport}
                    disabled={!email || emailSending}
                    className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {emailSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    Send
                  </button>
                </div>
              )}
              {emailError && (
                <p className="text-xs text-red-600 mt-2">{emailError}</p>
              )}
            </div>

            {/* Account creation nudge — only for anonymous visitors (hidden in prelaunch) */}
            {!prelaunch && !session?.user && (
              <div className="bg-white border border-border rounded-2xl shadow-sm p-6 md:p-8 flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm mb-1">Save your results</p>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    Create a free account to save your audit results and get matched with experts who specialise in your bottlenecks.
                  </p>
                  <Link
                    href="/auth/sign-up"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-bold hover:opacity-90 transition-opacity"
                  >
                    Create Free Account <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Pre-launch waitlist CTA — replaces solutions & account nudge */}
            {prelaunch && (
              <div className="bg-white border border-primary/20 rounded-2xl shadow-sm p-6 md:p-8">
                <div className="text-center mb-6">
                  <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
                    Launching April 8th
                  </p>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Ready to fix these bottlenecks?
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    Join the waitlist now and get a <strong className="text-foreground">free Discovery Scan</strong> — a
                    personalised deep-dive with a verified automation expert to map out exactly
                    what to automate first, how much it would save you, and a step-by-step
                    plan to get there.
                  </p>
                </div>

                {/* What is a Discovery Scan? */}
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 mb-6">
                  <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    What is a Discovery Scan?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">1. Post your challenge</p>
                      <p className="text-xs text-muted-foreground">
                        Describe what&apos;s slowing you down — the repetitive tasks, the manual processes, the bottlenecks.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">2. Experts propose solutions</p>
                      <p className="text-xs text-muted-foreground">
                        Up to 5 verified automation experts review your challenge and submit tailored proposals.
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-1">3. Pick the best fit</p>
                      <p className="text-xs text-muted-foreground">
                        Compare approaches, timelines and pricing. Choose the expert you trust to deliver results.
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 text-center italic">
                    Normally costs €50 — <strong className="text-primary not-italic">free for waitlist members</strong>.
                  </p>
                </div>

                {/* What's available at launch */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="bg-secondary/30 border border-border rounded-xl p-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">Browse Solutions</p>
                    <p className="text-xs text-muted-foreground">
                      Pre-built automations matched to your bottlenecks, ready to implement.
                    </p>
                  </div>
                  <div className="bg-secondary/30 border border-border rounded-xl p-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">Free Discovery Scan</p>
                    <p className="text-xs text-muted-foreground">
                      A 1-on-1 deep-dive with an expert to map your full automation roadmap — <strong>on us</strong>.
                    </p>
                  </div>
                  <div className="bg-secondary/30 border border-border rounded-xl p-4 text-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">Custom Projects</p>
                    <p className="text-xs text-muted-foreground">
                      Bespoke automation built for your exact workflow by verified experts.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>{/* end narrow wrapper */}

          {/* CTA — Personalized recommendations based on audit answers (hidden in prelaunch) */}
          {!prelaunch && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
                  What&apos;s Next
                </p>
                {results.overall >= 45 ? (
                  <>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      You know where the gaps are.
                      <br />
                      Now get expert opinions on how to close them.
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                      We matched these solutions to the specific bottlenecks you described.
                      Each one is built for the kind of work you said you&apos;re still doing manually.
                    </p>
                  </>
                ) : results.overall >= 25 ? (
                  <>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Start with one focused win.
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                      You don&apos;t need to automate everything at once. Pick the bottleneck
                      that costs the most time and fix that first — the rest follows.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Explore what&apos;s possible.
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                      Even at an early stage, knowing what automation looks like for your
                      type of work helps you plan the right next steps.
                    </p>
                  </>
                )}
              </div>
              <SmartEmptyState relatedSolutions={recommendedSolutions} matchLabels={matchLabels} />
            </div>
          )}

          {/* Retake */}
          <p className="text-center text-xs text-muted-foreground pb-4">
            <button
              onClick={() => {
                setStep(0);
                setAnswers({ tasks: [], strengths: [] });
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
