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
                <a href="${BASE_URL}" style="color:#94a3b8;">logiclot.com</a>
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
        <p style="margin:0 0 28px;font-size:13px;color:#94a3b8;">This link expires in 1 hour. If you didn&apos;t request a reset, you can safely ignore this email — your password hasn&apos;t changed.</p>
        <a href="${resetUrl}" style="${BTN_STYLE}">Reset my password &rarr;</a>
      </td>
    </tr>
  `);
}

export function welcomeEmail({ firstName, role, hasFreeScan }: { firstName: string; role: "business" | "expert"; hasFreeScan?: boolean }): string {
  const dashboardUrl = role === "business" ? `${BASE_URL}/business` : `${BASE_URL}/dashboard`;
  const headline = role === "business"
    ? `You're in — let's find the right automation for your business`
    : `Welcome to LogicLot — your first clients are waiting`;
  const freeScanLine = hasFreeScan
    ? `<br/><br/>As a waitlist member, you have <strong>1 free Discovery Scan</strong>. Let our experts assess your business and propose where automation can save you the most time and money.`
    : "";
  const body = role === "business"
    ? `Your account is set up and ready. Browse vetted automation solutions, post a Discovery Scan, or reach out to an Expert directly. Everything is fixed-price, milestone-based, and escrow-protected.${freeScanLine}`
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
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">Great news &mdash; your demo for <strong>${solutionTitle}</strong> with <strong>${expertName}</strong> has been confirmed.</p>
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
        <p style="margin:0;font-size:14px;color:#6b7280;">Don&apos;t keep them waiting &mdash; a fast response makes a great first impression.</p>
      </td>
    </tr>
  `);
}

// ── Expert Invite Email ──────────────────────────────────────────────────────

export function expertInviteEmail({ name, inviteUrl }: { name: string; inviteUrl: string }): string {
  const firstName = name.split(" ")[0] || "there";
  return shell(`
    <tr>
      <td style="padding:36px 28px;">
        <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827;">You&apos;re invited to LogicLot</h1>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">Hi ${firstName},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">We&apos;re opening LogicLot to a small group of automation specialists &mdash; and you&apos;re in.</p>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;">LogicLot is a marketplace where businesses buy ready-to-implement automations directly from verified experts like you. List your solutions, get matched with clients, and earn on your terms.</p>
        <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.7;">Click below to set up your password and complete your profile. It takes about 2 minutes.</p>
        <a href="${inviteUrl}" style="${BTN_STYLE}">Set Up My Account</a>
        <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">This invite is unique to your email and can only be used once.</p>
      </td>
    </tr>
  `);
}
