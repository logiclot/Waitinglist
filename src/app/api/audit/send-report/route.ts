import { NextResponse } from "next/server";
import { resend, getFromEmail } from "@/lib/resend";
import { auditReportEmail } from "@/lib/email-templates";
import { log } from "@/lib/logger";
import { publicFormLimiter } from "@/lib/rate-limit";

// ---------------------------------------------------------------------------
// Scoring — mirrors computeResults() in AuditQuiz.tsx
// ---------------------------------------------------------------------------

const TASK_COPY: Record<
  string,
  { headline: string; detail: string; outcome: string; before: string; after: string }
> = {
  invoicing: {
    headline: "Invoicing & Billing",
    detail: "Your billing cycle likely has 4–6 manual touchpoints per client. Every missed follow-up is revenue delayed or lost.",
    outcome: "What changes: invoices go out automatically on trigger, payment reminders chase themselves, reconciliation happens in the background.",
    before: "Manually creating, sending, and chasing every invoice",
    after: "Invoices sent and followed up automatically",
  },
  sales_followup: {
    headline: "Sales Follow-up",
    detail: "Leads go cold in 24–48 hours without contact. Manual follow-up means the busier your team gets, the more deals slip through.",
    outcome: "What changes: every lead gets a personalised sequence the moment they enter your pipeline, whether your team is in a meeting or off for the weekend.",
    before: "Remembering to follow up on every lead manually",
    after: "Leads contacted automatically within minutes",
  },
  scheduling: {
    headline: "Scheduling & Appointments",
    detail: "Back-and-forth booking takes 2–4 hours per week on average. That's 100+ hours a year spent on something that should take zero.",
    outcome: "What changes: clients book directly into your calendar, reminders go out automatically, and rescheduling happens without a single email.",
    before: "Back-and-forth emails to find a time that works",
    after: "Clients book directly, reminders go out on their own",
  },
  reporting: {
    headline: "Reporting & Data Entry",
    detail: "Manual reporting is slow and error-prone. By the time a report reaches a decision-maker, it's already out of date.",
    outcome: "What changes: live dashboards updated in real time, your weekly numbers ready without anyone pulling them together.",
    before: "Pulling numbers from multiple tools into a spreadsheet",
    after: "Live dashboards updated in real time",
  },
  hr_onboarding: {
    headline: "HR & Onboarding",
    detail: "A new hire typically touches 10+ manual steps before their first day. Delays here cost you their early productivity and your credibility as an employer.",
    outcome: "What changes: contracts sent, accounts created, training assigned, and day-one check-ins scheduled, all done before they walk through the door.",
    before: "10+ manual tasks per new hire before day one",
    after: "Contracts, accounts, and training handled automatically",
  },
  customer_support: {
    headline: "Customer Support",
    detail: "Up to 70% of support queries are repetitive. Every one your team handles manually is time taken away from the issues that actually need them.",
    outcome: "What changes: common queries answered instantly, tickets routed correctly, your team spending their time only on what genuinely needs a human.",
    before: "Every query handled by a person, even repeat questions",
    after: "Common questions answered instantly, team handles the rest",
  },
  social_media: {
    headline: "Social Media & Content",
    detail: "Inconsistent posting kills reach. Managing content manually across multiple platforms is unsustainable for most small teams.",
    outcome: "What changes: content approved once and distributed on schedule across every channel, no one logging into five different platforms every day.",
    before: "Logging into each platform to post and schedule manually",
    after: "Content approved once, published everywhere on schedule",
  },
  inventory: {
    headline: "Inventory & Orders",
    detail: "Manual inventory tracking leads to stockouts, overselling, and customer complaints that rarely come back.",
    outcome: "What changes: stock levels monitored around the clock, reorders triggered automatically, overselling prevented across every channel at once.",
    before: "Checking stock levels and placing reorders by hand",
    after: "Stock monitored 24/7, reorders triggered automatically",
  },
};

const STRENGTH_COPY: Record<
  string,
  { headline: string; detail: string; outcome: string; status: string; next: string }
> = {
  invoicing: { headline: "Invoicing & Billing", detail: "Your billing process works. Clients get invoiced, payments come in, follow-ups happen. That means the requirements are clear, the waste is gone, and the process is optimised.", outcome: "Automation locks it in: invoices trigger themselves, reminders run on schedule, reconciliation happens without anyone watching.", status: "Process is dialled in and repeatable", next: "Automate it so your team never has to think about it" },
  sales_followup: { headline: "Sales Follow-up", detail: "Your follow-up cadence is working. Leads get contacted, sequences run, and deals move through the pipeline. That is a solved process, and a human should not be the one running it.", outcome: "Automation locks it in: every lead gets the same proven sequence instantly, whether your team is in a meeting, on holiday, or scaling from 50 leads to 500.", status: "Follow-up cadence is proven and consistent", next: "Let automation run it at scale without dropping a lead" },
  scheduling: { headline: "Scheduling & Appointments", detail: "Bookings happen, calendars stay accurate, and clients show up. You have already eliminated the chaos. Now eliminate the effort.", outcome: "Automation locks it in: clients self-book, reminders fire automatically, rescheduling happens without a single email.", status: "Scheduling process works and rarely breaks", next: "Remove the human effort from a process that no longer needs it" },
  reporting: { headline: "Reporting & Data Entry", detail: "Your reports land on time and decision-makers trust the numbers. The format is stable, the sources are known. That means it is ready to run itself.", outcome: "Automation locks it in: dashboards update in real time, weekly reports compile and send themselves.", status: "Reports are accurate and delivered consistently", next: "Automate the assembly so your team focuses on insight, not data entry" },
  hr_onboarding: { headline: "HR & Onboarding", detail: "New hires get set up properly. Contracts go out, accounts get created, and day-one is smooth. That is a repeatable process running on human effort alone.", outcome: "Automation locks it in: the entire checklist executes itself the moment someone is hired.", status: "Onboarding process is reliable and complete", next: "Let automation run the checklist so HR handles exceptions only" },
  customer_support: { headline: "Customer Support", detail: "Customers get answers, tickets get resolved, and satisfaction stays high. The playbook exists. Now stop making your team run it manually for every single query.", outcome: "Automation locks it in: common questions answered instantly, tickets routed correctly, your team handles only what matters.", status: "Support quality is consistent and customers are satisfied", next: "Automate the repeatable queries so your team handles only what matters" },
  social_media: { headline: "Social Media & Content", detail: "Content goes out on schedule, across the right channels, and engagement is steady. The strategy is working, but the execution costs more time than it should.", outcome: "Automation locks it in: content approved once, published everywhere on schedule.", status: "Content cadence is consistent and effective", next: "Automate distribution so creative energy stays on strategy, not posting" },
  inventory: { headline: "Inventory & Orders", detail: "Stock levels are accurate, orders ship on time, and stockouts are rare. That means the rules are clear and the process is optimised. It just should not need a person watching it.", outcome: "Automation locks it in: stock monitored around the clock, reorders triggered automatically, overselling prevented across every channel.", status: "Inventory tracking is accurate and orders flow smoothly", next: "Automate monitoring and reordering so no one checks stock manually" },
};

interface Answers {
  teamSize: string;
  tasks: string[];
  hours: string;
  dataOrg: string;
  strengths: string[];
  frustration: string;
}

function computeResults(answers: Answers) {
  const teamScoreMap: Record<string, number> = { solo: 15, small: 38, medium: 65, large: 85 };
  const teamScore = teamScoreMap[answers.teamSize] ?? 40;

  const hoursScoreMap: Record<string, number> = { low: 15, medium: 40, high: 70, very_high: 90 };
  const hoursScore = hoursScoreMap[answers.hours] ?? 40;

  const taskScore = Math.min(answers.tasks.length * 11, 95);

  const techScoreMap: Record<string, number> = { spreadsheets: 20, separate: 45, some: 65, integrated: 85 };
  const technicalReadiness = techScoreMap[answers.dataOrg] ?? 35;

  const strengthsCount = (answers.strengths ?? []).length;
  const processMaturity = Math.min(strengthsCount * 12, 95);

  const roiPotential = Math.round((teamScore + hoursScore) / 2);
  const processBottleneck = Math.round((taskScore + hoursScore) / 2);
  const baseOverall = Math.round(roiPotential * 0.4 + processBottleneck * 0.35 + technicalReadiness * 0.25);
  const maturityBonus = Math.round(processMaturity * 0.15);
  const overall = Math.min(baseOverall + maturityBonus, 100);

  const hoursMonthMap: Record<string, number> = { low: 13, medium: 43, high: 95, very_high: 172 };
  const hoursMonth = hoursMonthMap[answers.hours] ?? 43;
  const financialEstimate = Math.round((hoursMonth * 25) / 100) * 100;
  const recoveryLow = Math.round((financialEstimate * 0.6) / 100) * 100;
  const recoveryHigh = Math.round((financialEstimate * 0.8) / 100) * 100;

  let scoreLabel: string;
  let scoreExplanation: string;
  if (overall >= 65) {
    scoreLabel = "Strong Case for Automation";
    scoreExplanation = "Based on what you described, there are multiple areas in your business where automation would have a measurable, near-term impact. The ROI case is clear.";
  } else if (overall >= 45) {
    scoreLabel = "Targeted Wins Available";
    scoreExplanation = "You have two or three areas where a focused automation fix would pay for itself quickly. The smartest move is to start with the highest-impact bottleneck and build from there.";
  } else if (overall >= 25) {
    scoreLabel = "Early Stage - Build the Foundation";
    scoreExplanation = "You are at the stage where one or two well-chosen automations could free up real time. The key is picking the right starting point, and that is what the recommendations below are for.";
  } else {
    scoreLabel = "Laying the Groundwork";
    scoreExplanation = "Your business is still building the processes that automation works best on top of. When the same manual tasks start repeating weekly, that is the right moment to act, and we will be here when you are ready.";
  }

  const annualWaste = financialEstimate * 12;
  const typicalFixCost = 2500;
  const roiMultiplier = Math.round((annualWaste / typicalFixCost) * 10) / 10;
  const urgencyMonthly = financialEstimate;

  const socialProofMap: Record<string, number> = { solo: 34, small: 52, medium: 67, large: 81 };
  const socialProofPct = socialProofMap[answers.teamSize] ?? 50;

  const bottlenecks = answers.tasks
    .slice(0, 3)
    .map((t) => TASK_COPY[t])
    .filter(Boolean);

  const strengths = (answers.strengths ?? [])
    .slice(0, 3)
    .map((t) => STRENGTH_COPY[t])
    .filter(Boolean);

  let barrier: { label: string; message: string } | null = null;
  if (overall >= 25) {
    if (technicalReadiness < 40) {
      barrier = { label: "You're building it all by hand", message: "Every week, someone on your team is doing work that a €50/month tool handles automatically." };
    } else if (technicalReadiness < 65) {
      barrier = { label: "Your tools are working at 30% capacity", message: "You're paying for software that's only doing part of its job." };
    } else {
      barrier = { label: "You're set up to automate but not yet doing it", message: "You have the tools. Everything is already in place, it just needs to be wired together." };
    }
  }

  return {
    overall, scoreLabel, scoreExplanation, processMaturity, financialEstimate, recoveryLow, recoveryHigh,
    annualWaste, typicalFixCost, roiMultiplier, urgencyMonthly, socialProofPct,
    bottlenecks, strengths, barrier,
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

const VALID_TEAM_SIZES = ["solo", "small", "medium", "large"];
const VALID_HOURS = ["low", "medium", "high", "very_high"];
const VALID_DATA_ORG = ["spreadsheets", "separate", "some", "integrated"];
const VALID_TASKS = Object.keys(TASK_COPY);

export async function POST(request: Request) {
  try {
    const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
    const ipCheck = await publicFormLimiter.check(`ip:${ip}`);
    if (!ipCheck.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { email, answers } = body as { email?: string; answers?: Partial<Answers> };

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Also rate limit by target email to prevent flooding a specific address
    const emailCheck = await publicFormLimiter.check(`email:${email.toLowerCase()}`);
    if (!emailCheck.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    if (
      !answers ||
      !VALID_TEAM_SIZES.includes(answers.teamSize ?? "") ||
      !Array.isArray(answers.tasks) ||
      answers.tasks.length === 0 ||
      !answers.tasks.every((t: string) => VALID_TASKS.includes(t)) ||
      !VALID_HOURS.includes(answers.hours ?? "") ||
      !VALID_DATA_ORG.includes(answers.dataOrg ?? "") ||
      (answers.strengths !== undefined && (!Array.isArray(answers.strengths) || !answers.strengths.every((t: string) => VALID_TASKS.includes(t))))
    ) {
      return NextResponse.json({ error: "Invalid audit answers" }, { status: 400 });
    }

    const results = computeResults(answers as Answers);

    const fromEmail = getFromEmail();
    if (!fromEmail) {
      return NextResponse.json({ error: "Email sending not configured" }, { status: 500 });
    }

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Your Automation Audit: ${results.scoreLabel} (${results.overall}/100)`,
      html: auditReportEmail({ data: results }),
    });

    if (sendError) {
      log.error("audit.send_report_resend_error", { error: JSON.stringify(sendError), email });
      return NextResponse.json({ error: "Failed to send email. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    log.error("audit.send_report_error", { error: String(error) });
    return NextResponse.json({ error: "Failed to send report" }, { status: 500 });
  }
}
