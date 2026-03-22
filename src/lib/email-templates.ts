import { APP_URL as BASE_URL } from "@/lib/app-url";

const HEADER_STYLE = `background:#0f172a;padding:20px 28px;`;
const LOGO_STYLE = `font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;`;
const BTN_STYLE = `display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;`;
const FOOTER_STYLE = `padding:20px 28px;border-top:1px solid #f1f5f9;`;
const FOOTER_TEXT_STYLE = `margin:0;font-size:12px;color:#94a3b8;line-height:1.6;`;

function shell(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr><td style="${HEADER_STYLE}"><span style="${LOGO_STYLE}">LogicLot</span></td></tr>
          ${body}
          <tr>
            <td style="${FOOTER_STYLE}">
              <p style="${FOOTER_TEXT_STYLE}">
                You&apos;re receiving this because you have an account on LogicLot.<br/>
                <a href="${BASE_URL}" style="color:#94a3b8;">logiclot.io</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function verificationEmail({ verifyUrl }: { verifyUrl: string }): string {
  return shell(`
    <tr>
      <td style="padding:36px 28px;">
        <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0f172a;">Confirm your email address</h1>
        <p style="margin:0 0 8px;font-size:14px;color:#64748b;line-height:1.7;">
          You&apos;re one step away from joining LogicLot. Click the button below to verify your email and continue to onboarding.
        </p>
        <p style="margin:0 0 28px;font-size:13px;color:#94a3b8;">This link expires in 24 hours.</p>
        <a href="${verifyUrl}" style="${BTN_STYLE}">Verify my email &rarr;</a>
        <p style="margin:28px 0 0;font-size:12px;color:#94a3b8;">
          If you didn&apos;t create an account on LogicLot, you can safely ignore this email.
        </p>
      </td>
    </tr>
  `);
}

export function passwordResetEmail({ resetUrl }: { resetUrl: string }): string {
  return shell(`
    <tr>
      <td style="padding:36px 28px;">
        <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0f172a;">Reset your password</h1>
        <p style="margin:0 0 8px;font-size:14px;color:#64748b;line-height:1.7;">
          We received a request to reset the password for your LogicLot account. Click below to choose a new one.
        </p>
        <p style="margin:0 0 28px;font-size:13px;color:#94a3b8;">This link expires in 1 hour. If you didn&apos;t request a reset, you can safely ignore this email. Your password hasn&apos;t changed.</p>
        <a href="${resetUrl}" style="${BTN_STYLE}">Reset my password &rarr;</a>
      </td>
    </tr>
  `);
}

export function welcomeEmail({ firstName, role, hasFreeScan }: { firstName: string; role: "business" | "expert"; hasFreeScan?: boolean }): string {
  const dashboardUrl = role === "business" ? `${BASE_URL}/business` : `${BASE_URL}/dashboard`;
  const headline = role === "business"
    ? `You're in. Let's find the right automation for your business`
    : `Welcome to LogicLot. Your first clients are waiting`;
  const freeScanLine = hasFreeScan
    ? `<br/><br/>As a waitlist member, you have <strong>1 free Discovery Scan</strong>. Let our experts assess your business and propose where automation can save you the most time and money.`
    : "";
  const body = role === "business"
    ? `Your account is set up and ready. Browse verified automation solutions, post a Discovery Scan, or reach out to an Expert directly. Everything is fixed-price, milestone-based, and escrow-protected.${freeScanLine}`
    : `Your expert profile is live. Complete your first solution listing to start appearing in searches and get matched with businesses looking for exactly what you build.`;
  const cta = role === "business" ? "Go to my dashboard" : "Create my first solution";

  return shell(`
    <tr>
      <td style="padding:36px 28px;">
        <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#0f172a;">Hi ${firstName},</h1>
        <h2 style="margin:0 0 16px;font-size:17px;font-weight:600;color:#1e293b;">${headline}</h2>
        <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.7;">${body}</p>
        <a href="${dashboardUrl}" style="${BTN_STYLE}">${cta} &rarr;</a>
      </td>
    </tr>
  `);
}

// ── Onboarding sequence emails ────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function sequenceEmail({
  firstName,
  subject: _subject, // eslint-disable-line @typescript-eslint/no-unused-vars
  headline,
  body,
  ctaLabel,
  ctaUrl,
  footnote,
}: {
  firstName: string;
  subject: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  footnote?: string;
}): string {
  return shell(`
    <tr>
      <td style="padding:36px 28px;">
        <p style="margin:0 0 6px;font-size:14px;color:#64748b;">Hi ${firstName},</p>
        <h1 style="margin:0 0 16px;font-size:19px;font-weight:700;color:#0f172a;line-height:1.4;">${headline}</h1>
        <p style="margin:0 0 28px;font-size:14px;color:#475569;line-height:1.8;">${body}</p>
        <a href="${ctaUrl}" style="${BTN_STYLE}">${ctaLabel} &rarr;</a>
        ${footnote ? `<p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">${footnote}</p>` : ""}
      </td>
    </tr>
  `);
}

export function notificationEmail({
  title,
  message,
  actionUrl,
  actionLabel = "View on LogicLot",
}: {
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}): string {
  const fullActionUrl = actionUrl
    ? actionUrl.startsWith("http") ? actionUrl : `${BASE_URL}${actionUrl}`
    : null;

  return shell(`
    <tr>
      <td style="padding:32px 28px;">
        <h1 style="margin:0 0 12px;font-size:18px;font-weight:600;color:#0f172a;line-height:1.4;">${title}</h1>
        <p style="margin:0 0 28px;font-size:14px;color:#64748b;line-height:1.7;">${message}</p>
        ${fullActionUrl ? `<a href="${fullActionUrl}" style="${BTN_STYLE}">${actionLabel} &rarr;</a>` : ""}
      </td>
    </tr>
  `);
}

// ── Post-delivery nurture emails ─────────────────────────────────────────────

export function deliveryReadyEmail({
  firstName,
  projectTitle,
  expertName,
  reviewUrl,
}: {
  firstName: string;
  projectTitle: string;
  expertName: string;
  reviewUrl: string;
}): string {
  return shell(`
    <tr>
      <td style="padding:36px 28px;">
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">Your automation is ready for review!</h1>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;">Hi ${firstName},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;"><strong>${expertName}</strong> has completed work on <strong>${projectTitle}</strong>. All milestones have been delivered.</p>
        <p style="margin:0 0 24px;"><a href="${reviewUrl}" style="display:inline-block;background:#2563EB;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Review &amp; Approve</a></p>
        <p style="margin:0;font-size:14px;color:#6b7280;">Once you approve, both reviews will be visible and your project will be marked as complete.</p>
      </td>
    </tr>
  `);
}

export interface NurtureRecommendation {
  title: string;
  slug: string;
  category: string;
  priceCents: number;
}

function recommendationRows(recommendations: NurtureRecommendation[]): string {
  return recommendations
    .map(
      (r) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
          <a href="${BASE_URL}/solutions/${r.slug}" style="color:#2563EB;font-weight:600;text-decoration:none;">${r.title}</a>
          <br/><span style="font-size:13px;color:#6b7280;">${r.category} &middot; &euro;${(r.priceCents / 100).toFixed(2)}</span>
        </td></tr>`
    )
    .join("");
}

export function postApprovalEmail({
  firstName,
  projectTitle,
  recommendations,
}: {
  firstName: string;
  projectTitle: string;
  recommendations: NurtureRecommendation[];
}): string {
  const recSection =
    recommendations.length > 0
      ? `<tr><td style="font-size:16px;font-weight:600;padding:16px 0 8px;color:#111827;">Businesses like you also automated:</td></tr>
         <tr><td><table style="width:100%">${recommendationRows(recommendations)}</table></td></tr>`
      : "";

  return shell(`
    <tr>
      <td style="padding:36px 28px;">
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">How&apos;s your automation working?</h1>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;">Hi ${firstName},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">It&apos;s been a few days since <strong>${projectTitle}</strong> was completed. We hope it&apos;s saving you time already!</p>
        ${recSection}
        <p style="margin:24px 0 0;"><a href="${BASE_URL}/solutions" style="display:inline-block;background:#2563EB;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Browse More Solutions</a></p>
      </td>
    </tr>
  `);
}

export function reEngagementEmail({
  firstName,
  recommendations,
}: {
  firstName: string;
  recommendations: NurtureRecommendation[];
}): string {
  const recSection =
    recommendations.length > 0
      ? `<tr><td><table style="width:100%">${recommendationRows(recommendations)}</table></td></tr>`
      : "";

  return shell(`
    <tr>
      <td style="padding:36px 28px;">
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">What else could you automate?</h1>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;">Hi ${firstName},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">It&apos;s been a while since your last project. Here are some automations that businesses in your space are using:</p>
        ${recSection}
        <p style="margin:24px 0 0;"><a href="${BASE_URL}/solutions" style="display:inline-block;background:#2563EB;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Explore Solutions</a></p>
      </td>
    </tr>
  `);
}

// ── Audit report email ──────────────────────────────────────────────────────

interface AuditBottleneck {
  headline: string;
  detail: string;
  outcome: string;
  before: string;
  after: string;
}

interface AuditStrength {
  headline: string;
  detail: string;
  outcome: string;
  status: string;
  next: string;
}

interface AuditReportData {
  overall: number;
  scoreLabel: string;
  scoreExplanation: string;
  processMaturity: number;
  financialEstimate: number;
  recoveryLow: number;
  recoveryHigh: number;
  annualWaste: number;
  typicalFixCost: number;
  roiMultiplier: number;
  urgencyMonthly: number;
  socialProofPct: number;
  bottlenecks: AuditBottleneck[];
  strengths: AuditStrength[];
  barrier: { label: string; message: string } | null;
}

export function auditReportEmail({ data }: { data: AuditReportData }): string {
  const bottleneckRows = data.bottlenecks
    .map(
      (b, i) =>
        `<tr><td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
          <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0f172a;">${i + 1}. ${b.headline}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#64748b;line-height:1.6;">${b.detail}</p>
          <p style="margin:0 0 2px;font-size:12px;color:#64748b;"><strong style="color:#0f172a;">Today:</strong> ${b.before}</p>
          <p style="margin:0 0 6px;font-size:12px;color:#64748b;"><strong style="color:#2563EB;">After:</strong> ${b.after}</p>
          <p style="margin:0;font-size:13px;color:#0f172a;background:#f0f9ff;padding:8px 12px;border-radius:6px;">&rarr; ${b.outcome}</p>
        </td></tr>`
    )
    .join("");

  const barrierSection = data.barrier
    ? `<tr><td style="padding:16px 0 8px;">
        <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Your Main Barrier</p>
        <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#0f172a;">${data.barrier.label}</p>
        <p style="margin:0;font-size:13px;color:#64748b;line-height:1.7;">${data.barrier.message}</p>
      </td></tr>`
    : "";

  return shell(`
    <tr>
      <td style="padding:36px 28px;">
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;text-align:center;">Your Automation Audit Report</h1>
        <p style="margin:0 0 24px;font-size:13px;color:#94a3b8;text-align:center;">Here are your results from the LogicLot Free Automation Audit.</p>

        <!-- Score -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;margin-bottom:24px;">
          <tr><td style="padding:24px;text-align:center;">
            <p style="margin:0 0 4px;font-size:48px;font-weight:900;color:#0f172a;">${data.overall}<span style="font-size:20px;color:#94a3b8;">/100</span></p>
            <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#0f172a;">${data.scoreLabel}</p>
            <p style="margin:0;font-size:12px;color:#64748b;">${data.socialProofPct}% of companies your size have already automated this</p>
          </td></tr>
        </table>

        <!-- Financial -->
        <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">What Manual Work Is Costing You</p>
        <p style="margin:0 0 8px;font-size:28px;font-weight:900;color:#0f172a;">~&euro;${data.financialEstimate.toLocaleString()}<span style="font-size:14px;font-weight:500;color:#94a3b8;">/month</span></p>
        <p style="margin:0 0 4px;font-size:14px;color:#0f172a;font-weight:600;">Automation typically recovers 60&ndash;80% of this:</p>
        <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#2563EB;">~&euro;${data.recoveryLow.toLocaleString()} &ndash; &euro;${data.recoveryHigh.toLocaleString()}/month back</p>

        <!-- Annual ROI -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
          <tr>
            <td style="background:#f8fafc;padding:12px;border-radius:8px;text-align:center;width:40%;">
              <p style="margin:0;font-size:11px;color:#64748b;">Lost per year</p>
              <p style="margin:0;font-size:18px;font-weight:900;color:#0f172a;">&euro;${data.annualWaste.toLocaleString()}</p>
            </td>
            <td style="text-align:center;width:20%;font-size:14px;color:#94a3b8;font-weight:600;">vs</td>
            <td style="background:#f8fafc;padding:12px;border-radius:8px;text-align:center;width:40%;">
              <p style="margin:0;font-size:11px;color:#64748b;">Typical one-time fix</p>
              <p style="margin:0;font-size:18px;font-weight:900;color:#0f172a;">&euro;${data.typicalFixCost.toLocaleString()}</p>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 24px;text-align:center;font-size:16px;font-weight:700;color:#0f172a;">= ${data.roiMultiplier}x ROI</p>

        <!-- Urgency -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
          <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;">
            Every month you wait = <strong style="color:#0f172a;">&euro;${data.urgencyMonthly.toLocaleString()}</strong> more spent on work a machine should do
          </td></tr>
        </table>

        <!-- Bottlenecks -->
        ${data.bottlenecks.length > 0 ? `
        <p style="margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Your Top Bottlenecks</p>
        <table width="100%" cellpadding="0" cellspacing="0">${bottleneckRows}</table>
        ` : ""}

        ${data.strengths && data.strengths.length > 0 ? `
        <p style="margin:16px 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;font-weight:600;">Automation-Ready Processes</p>
        <p style="margin:0 0 12px;font-size:13px;color:#64748b;line-height:1.7;">These processes are already working well. Automation locks in the result so your team never runs them manually again.</p>
        <table width="100%" cellpadding="0" cellspacing="0">${data.strengths
          .map(
            (s, i) =>
              `<tr><td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#0f172a;">${i + 1}. ${s.headline}</p>
                <p style="margin:0 0 6px;font-size:13px;color:#64748b;line-height:1.6;">${s.detail}</p>
                <p style="margin:0 0 2px;font-size:12px;color:#64748b;"><strong style="color:#16a34a;">Status:</strong> ${s.status}</p>
                <p style="margin:0 0 6px;font-size:12px;color:#64748b;"><strong style="color:#2563EB;">Next:</strong> ${s.next}</p>
                <p style="margin:0;font-size:13px;color:#0f172a;background:#f0fdf4;padding:8px 12px;border-radius:6px;">&rarr; ${s.outcome}</p>
              </td></tr>`
          )
          .join("")}</table>
        ` : ""}

        ${barrierSection}

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;">
          <tr><td style="text-align:center;padding:16px 0;">
            <a href="${BASE_URL}/solutions" style="${BTN_STYLE}">Browse Automation Solutions &rarr;</a>
          </td></tr>
          <tr><td style="text-align:center;">
            <a href="${BASE_URL}/audit" style="font-size:13px;color:#64748b;text-decoration:underline;">Retake the audit</a>
          </td></tr>
        </table>
      </td>
    </tr>
  `);
}

// ── Demo booking email ───────────────────────────────────────────────────────

export function demoBookedEmail({
  firstName,
  expertName,
  solutionTitle,
  calendarUrl,
}: {
  firstName: string;
  expertName: string;
  solutionTitle: string;
  calendarUrl?: string | null;
}): string {
  const calendarSection = calendarUrl
    ? `<tr><td style="padding:24px 0;"><a href="${calendarUrl}" style="display:inline-block;background:#2563EB;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Schedule Your Demo Call</a></td></tr>`
    : `<tr><td style="padding:16px 0;color:#6b7280;">Your expert will reach out to you directly to schedule the demo call.</td></tr>`;

  return shell(`
    <tr>
      <td style="padding:36px 28px;">
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">Your demo is confirmed!</h1>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">Hi ${firstName},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">Great news. Your demo for <strong>${solutionTitle}</strong> with <strong>${expertName}</strong> has been confirmed.</p>
        ${calendarSection}
        <p style="margin:16px 0 0;font-size:14px;color:#6b7280;">You can also find the booking link in your messages inbox.</p>
      </td>
    </tr>
  `);
}

// ── Expert Demo Booked Email ─────────────────────────────────────────────────

export function expertDemoBookedEmail({
  expertFirstName,
  buyerName,
  solutionTitle,
}: {
  expertFirstName: string;
  buyerName: string;
  solutionTitle: string;
}): string {
  return shell(`
    <tr>
      <td style="padding:36px 28px;">
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">New demo booking!</h1>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">Hi ${expertFirstName},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;"><strong>${buyerName}</strong> has just booked and paid for a demo of <strong>${solutionTitle}</strong>.</p>
        <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.7;">Please check your messages and reach out to schedule the call.</p>
        <tr><td style="padding:0 0 24px;"><a href="${BASE_URL}/inbox" style="display:inline-block;background:#2563EB;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Go to Inbox</a></td></tr>
        <p style="margin:0;font-size:14px;color:#6b7280;">Don&apos;t keep them waiting. A fast response makes a great first impression.</p>
      </td>
    </tr>
  `);
}

// ── Expert Invite Email ──────────────────────────────────────────────────────

// ── Launch countdown emails (waitlist) ────────────────────────────────────────

function launchShell(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr><td style="${HEADER_STYLE}"><span style="${LOGO_STYLE}">LogicLot</span></td></tr>
          ${body}
          <tr>
            <td style="${FOOTER_STYLE}">
              <p style="${FOOTER_TEXT_STYLE}">
                You&apos;re receiving this because you joined the LogicLot waitlist.<br/>
                <a href="${BASE_URL}" style="color:#94a3b8;">logiclot.io</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

type LaunchDay = "d14" | "d7" | "d2" | "launch";
type WaitlistRole = "business" | "expert";

interface LaunchEmailContent {
  subject: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  footnote?: string;
}

export const LAUNCH_SEQUENCE: Record<WaitlistRole, Record<LaunchDay, LaunchEmailContent>> = {
  business: {
    d14: {
      subject: "LogicLot launches April 8th. You're getting first access.",
      headline: "In two weeks, on April 8th, LogicLot goes live and you're getting first access.",
      body: `As a waitlist member, you'll be among the first businesses to browse verified automation solutions, connect with verified experts, and stop overpaying for work that should run itself.<br/><br/>
Here's what's waiting for you on launch day:<br/><br/>
&bull; <strong>Browse &amp; buy</strong> fixed-price automation solutions, no proposals, no guesswork<br/>
&bull; <strong>Discovery Scans</strong> let an expert audit your workflows and show you exactly where to automate. Because you're on the waitlist, your first Discovery Scan is completely free.<br/>
&bull; <strong>Custom Projects</strong> have a specific automation need? Post a brief and get proposals from verified experts, scoped and priced before any work begins.<br/>
&bull; <strong>Escrow-protected payments</strong> you only pay when milestones are delivered and approved<br/><br/>
You're on the list. When the doors open on April 8th, you'll be the first to walk through.`,
      ctaLabel: "Get ready",
      ctaUrl: BASE_URL,
    },
    d7: {
      subject: "One week to launch 🚀",
      headline: "LogicLot goes live in 7 days.",
      body: `Businesses just like yours are wasting 20+ hours a week on tasks that could run automatically: data entry, client onboarding, reporting, invoicing. That ends next week.<br/><br/>
On launch day you'll be able to:<br/><br/>
&bull; Browse automation solutions built for real business problems<br/>
&bull; Use your <strong>free Discovery Scan</strong> to find out exactly where you're losing time<br/>
&bull; Post a <strong>Custom Project</strong> brief and get scoped proposals from verified experts<br/>
&bull; Hire with milestone-based, escrow-protected pricing<br/><br/>
No long contracts. No vague proposals. Just results.<br/><br/>
We'll email you the moment the doors open.`,
      ctaLabel: "Preview what's coming",
      ctaUrl: BASE_URL,
    },
    d2: {
      subject: "48 hours. This is happening.",
      headline: "LogicLot launches in 2 days.",
      body: `Experts are listing their solutions right now. On launch day, you'll be able to browse, compare, and buy, all in one place, all with escrow protection.<br/><br/>
Quick reminder of what you'll get as a waitlist member:<br/><br/>
&#10003; <strong>First access</strong> before we open to the public<br/>
&#10003; <strong>1 free Discovery Scan</strong> an expert reviews your business and tells you where automation saves you the most<br/>
&#10003; <strong>Priority support</strong> during launch week<br/><br/>
Check your inbox in 48 hours. We'll send your access link.`,
      ctaLabel: "Learn more",
      ctaUrl: BASE_URL,
    },
    launch: {
      subject: "LogicLot is LIVE. Your access is ready.",
      headline: "It's here. LogicLot is officially live.",
      body: `You now have full access to the marketplace. Browse automation solutions, post a Custom Project, or hire an expert, all with fixed pricing and escrow protection.<br/><br/>
&#128275; <strong>Your waitlist account is active.</strong> Log in and start exploring.<br/><br/>
Not sure where to start? Use your <strong>free Discovery Scan</strong>. An expert will analyze your workflows and show you the #1 thing to automate first. It's the best way to begin and it's completely free for waitlist members.<br/><br/>
Welcome to LogicLot. Let's automate the boring stuff.`,
      ctaLabel: "Enter LogicLot",
      ctaUrl: BASE_URL,
      footnote: "The LogicLot team",
    },
  },
  expert: {
    d14: {
      subject: "LogicLot launches April 8th. Your first clients are waiting.",
      headline: "Two weeks from now, on April 8th, LogicLot opens to businesses and they're already signing up.",
      body: `As an early expert, you'll have the advantage of being visible from day one. Businesses on our waitlist are actively looking for automation help, and the earlier you list your solutions, the more visibility you get.<br/><br/>
Here's what's ready for you:<br/><br/>
&bull; <strong>List your solutions</strong> with fixed pricing, clear deliverables, and demo videos<br/>
&bull; <strong>Get matched</strong> with businesses who need exactly what you build<br/>
&bull; <strong>Earn with confidence</strong> escrow-protected milestone payments, and as a founding expert you're locked in at our lowest commission rate of just 11%, permanently<br/><br/>
Early experts who list before launch day will rank higher in search from the start.`,
      ctaLabel: "Set up your profile",
      ctaUrl: BASE_URL,
    },
    d7: {
      subject: "One week until businesses start buying",
      headline: "In 7 days, LogicLot opens and businesses will start purchasing solutions.",
      body: `We're launching with a small, curated group of experts, which means more visibility for your listings and less noise to compete with from day one.<br/><br/>
What to do this week:<br/><br/>
&bull; <strong>Finalize your solution listings</strong> title, pricing, deliverables, demo video<br/>
&bull; <strong>Complete your expert profile</strong> photo, bio, portfolio links<br/>
&bull; <strong>Set your pricing</strong> fixed-price sells faster on LogicLot than hourly<br/><br/>
As a founding expert, your commission is locked in at just <strong>11%</strong>, permanently.<br/><br/>
The marketplace opens in 7 days. Be ready.`,
      ctaLabel: "Prepare your listings",
      ctaUrl: BASE_URL,
    },
    d2: {
      subject: "48 hours. Be listed when the doors open.",
      headline: "In 48 hours, businesses will start browsing and buying on LogicLot.",
      body: `If your solutions are live when the marketplace opens, you'll be in front of buyers from minute one. If not, you're leaving early sales on the table.<br/><br/>
Final checklist:<br/><br/>
&#10003; At least <strong>3 solutions listed</strong> with clear deliverables and pricing<br/>
&#10003; <strong>Profile complete</strong> photo, bio, and skills<br/>
&#10003; <strong>Demo video</strong> uploaded (solutions with demos get 3&times; more clicks)<br/><br/>
Founding expert commission: <strong>11%</strong>, the lowest it will ever be. Locked in permanently when you list before launch.<br/><br/>
See you on the other side.`,
      ctaLabel: "Finalize your listings",
      ctaUrl: BASE_URL,
    },
    launch: {
      subject: "We're LIVE. Businesses are browsing right now.",
      headline: "LogicLot is officially open. Businesses are logging in right now.",
      body: `If your solutions are listed, they're already visible. If not, there's no better time than right now.<br/><br/>
&#128275; <strong>Your expert account is active.</strong> Log in and check your dashboard.<br/><br/>
Here's what to do today:<br/><br/>
&bull; <strong>Check your solution listings</strong> are published and looking sharp<br/>
&bull; <strong>Watch for order notifications</strong> respond fast, first impressions matter<br/>
&bull; <strong>Share your LogicLot profile</strong> on LinkedIn to drive traffic to your solutions<br/><br/>
Founding expert commission: <strong>11%</strong>, locked in. Let's build something great.<br/><br/>
Welcome to LogicLot. Your first clients are waiting.`,
      ctaLabel: "Go to my dashboard",
      ctaUrl: BASE_URL,
      footnote: "The LogicLot team",
    },
  },
};

export function launchSequenceEmail({
  firstName,
  role,
  day,
}: {
  firstName: string;
  role: WaitlistRole;
  day: LaunchDay;
}): string {
  const content = LAUNCH_SEQUENCE[role][day];
  return launchShell(`
    <tr>
      <td style="padding:36px 28px;">
        <p style="margin:0 0 6px;font-size:14px;color:#64748b;">Hi ${firstName},</p>
        <h1 style="margin:0 0 16px;font-size:19px;font-weight:700;color:#0f172a;line-height:1.4;">${content.headline}</h1>
        <p style="margin:0 0 28px;font-size:14px;color:#475569;line-height:1.8;">${content.body}</p>
        <a href="${content.ctaUrl}" style="${BTN_STYLE}">${content.ctaLabel} &rarr;</a>
        ${content.footnote ? `<p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">${content.footnote}</p>` : ""}
      </td>
    </tr>
  `);
}

export function expertInviteEmail({ name, inviteUrl }: { name: string; inviteUrl: string }): string {
  const firstName = name.split(" ")[0] || "there";
  return shell(`
    <tr>
      <td style="padding:36px 28px;">
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">You&apos;re invited to LogicLot</h1>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">Hi ${firstName},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">We&apos;re opening LogicLot to a small group of automation experts, and you&apos;re in.</p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">LogicLot is a marketplace where businesses buy ready-to-implement automations directly from verified experts like you. List your solutions, get matched with clients, and earn on your terms.</p>
        <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.7;">Click below to set up your password and complete your profile. It takes about 2 minutes.</p>
        <a href="${inviteUrl}" style="${BTN_STYLE}">Set Up My Account</a>
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">This invite is unique to your email and can only be used once.</p>
      </td>
    </tr>
  `);
}
