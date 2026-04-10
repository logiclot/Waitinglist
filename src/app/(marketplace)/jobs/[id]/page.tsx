import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { PaymentStub } from "@/components/jobs/PaymentStub";
import { JobPaymentFeedback } from "@/components/jobs/JobPaymentFeedback";
import { ProposalFormGated } from "@/components/jobs/ProposalFormGated";
import { ProposalList } from "@/components/jobs/ProposalCard";
import { MAX_PROPOSALS } from "@/lib/job-config";
import Link from "next/link";
import {
  ArrowLeft,
  Lock,
  Briefcase,
  Compass,
  Building2,
  Wrench,
  Target,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Euro,
  XCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

// ── Brief display primitives ──────────────────────────────────────────────────

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-2.5 py-1 bg-secondary text-secondary-foreground rounded-md text-xs border border-border font-medium">
      {children}
    </span>
  );
}
function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <Tag key={i}>{i}</Tag>
      ))}
    </div>
  );
}

// ── Discovery Brief types & helpers ───────────────────────────────────────────
interface QAItem {
  q: string;
  a: string | string[];
}
interface BriefSectionData {
  id: string;
  title: string;
  subtitle?: string;
  qa: QAItem[];
}
interface BriefV2 {
  version: string;
  sections: BriefSectionData[];
}

type Answer = string | string[];
function qa(s: BriefSectionData | undefined, i: number): Answer {
  return s?.qa?.[i]?.a ?? "";
}
function asStr(a: Answer): string {
  return Array.isArray(a) ? a.join(", ") : (a ?? "");
}
function asArr(a: Answer): string[] {
  return Array.isArray(a) ? a.filter(Boolean) : a ? [a] : [];
}
function blank(a: Answer): boolean {
  if (!a) return true;
  if (Array.isArray(a)) return a.length === 0;
  return !a.trim() || a === "None provided.";
}

// ONE answer renderer — the only visual pattern used throughout:
//   Short multi-items (≤ 32 chars each)  → pill tags
//   Everything else                       → plain text with a left accent border per line
function Ans({ a }: { a: Answer }) {
  if (blank(a)) return null;
  const items = asArr(a);
  if (items.length === 0) return null;
  if (items.length === 1)
    return (
      <p className="text-sm text-foreground leading-relaxed">{items[0]}</p>
    );
  if (items.every((i) => i.length <= 32)) return <TagList items={items} />;
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <p
          key={i}
          className="text-sm text-foreground leading-relaxed pl-3 border-l-2 border-border"
        >
          {item}
        </p>
      ))}
    </div>
  );
}

// Labeled row: small muted label stacked above answer
function Row({ label, a }: { label: string; a: Answer }) {
  if (blank(a)) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <Ans a={a} />
    </div>
  );
}

// Card wrapper
function BCard({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: "pain" | "outcome";
}) {
  const border =
    accent === "pain"
      ? "border-destructive/20"
      : accent === "outcome"
        ? "border-primary/20"
        : "border-border";
  return (
    <div className={`bg-card border ${border} rounded-xl overflow-hidden`}>
      {children}
    </div>
  );
}

// Card header — subtitle on its own line, visible (not muted grey)
function BCardHeader({
  icon,
  title,
  subtitle,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accent?: "pain" | "outcome";
}) {
  const bg =
    accent === "pain"
      ? "bg-destructive/5 border-b-destructive/20"
      : accent === "outcome"
        ? "bg-primary/5 border-b-primary/20"
        : "bg-secondary/20 border-b-border";
  const color = accent === "pain" ? "text-destructive" : "text-primary";
  return (
    <div className={`flex items-start gap-2.5 px-5 py-4 border-b ${bg}`}>
      <div className={`mt-0.5 shrink-0 ${color}`}>{icon}</div>
      <div>
        <p className="font-semibold text-sm text-foreground">{title}</p>
        {subtitle && (
          <p className="text-sm text-foreground/60 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ── Section A – Business Context ──────────────────────────────────────────────
function SectionA({ s }: { s?: BriefSectionData }) {
  return (
    <BCard>
      <BCardHeader
        icon={<Building2 className="h-4 w-4" />}
        title="Business Context"
      />
      <div className="p-5 space-y-4 divide-y divide-border">
        <Row label="Business model" a={qa(s, 0)} />
        <div className="pt-4">
          <Row label="Team size" a={qa(s, 2)} />
        </div>
        <div className="pt-4">
          <Row label="What they sell" a={qa(s, 1)} />
        </div>
      </div>
    </BCard>
  );
}

// ── Section B – Revenue & Operations ─────────────────────────────────────────
function SectionB({ s }: { s?: BriefSectionData }) {
  const rows: [string, Answer][] = [
    ["How customers find you", qa(s, 0)],
    ["How leads convert", qa(s, 1)],
    ["After-sale work triggers", qa(s, 2)],
    ["Revenue tracking", qa(s, 3)],
    ["Revenue predictability", qa(s, 4)],
    ["What breaks at scale", qa(s, 5)],
    ["Where handoffs happen", qa(s, 6)],
  ];
  const visible = rows.filter(([, a]) => !blank(a));
  if (visible.length === 0) return null;
  return (
    <BCard>
      <BCardHeader
        icon={<TrendingUp className="h-4 w-4" />}
        title="Revenue & Operations"
        subtitle="How money and work flow through the business"
      />
      <div className="p-5 space-y-4 divide-y divide-border">
        {visible.map(([label, a], i) => (
          <div key={i} className={i > 0 ? "pt-4" : ""}>
            <Row label={label} a={a} />
          </div>
        ))}
      </div>
    </BCard>
  );
}

// ── Section C – Tools & Stack ─────────────────────────────────────────────────
function SectionC({ s }: { s?: BriefSectionData }) {
  return (
    <BCard>
      <BCardHeader
        icon={<Wrench className="h-4 w-4" />}
        title="Tools & Stack"
        subtitle="What the team works with every day"
      />
      <div className="p-5 space-y-4 divide-y divide-border">
        <Row label="Core tools" a={qa(s, 0)} />
        <div className="pt-4">
          <Row label="Source of truth" a={qa(s, 1)} />
        </div>
        <div className="pt-4">
          <Row label="Automation today" a={qa(s, 2)} />
        </div>
      </div>
    </BCard>
  );
}

// ── Section D – Pain Signals ──────────────────────────────────────────────────
function SectionD({ s }: { s?: BriefSectionData }) {
  const pains: [string, Answer][] = [
    ["How much human judgment does this process require?", qa(s, 0)],
    ["Which activities consume the most manual time each week?", qa(s, 1)],
    ["Which tasks often lead to mistakes or need redoing?", qa(s, 2)],
    ["Where do delays most often occur?", qa(s, 3)],
    ["How visible are your operations right now?", qa(s, 4)],
  ];
  const visible = pains.filter(([, a]) => !blank(a));
  return (
    <BCard accent="pain">
      <BCardHeader
        icon={<AlertTriangle className="h-4 w-4" />}
        title="Process Pain Signals"
        subtitle="These are your brief. Find the highest-ROI win and build your entire proposal around it."
        accent="pain"
      />
      <div className="p-5 grid sm:grid-cols-2 gap-4">
        {visible.map(([label, a], i) => (
          <div
            key={i}
            className="bg-secondary/40 border border-border rounded-lg p-4 space-y-2.5"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <Ans a={a} />
          </div>
        ))}
      </div>
    </BCard>
  );
}

// ── Section E – Constraints ───────────────────────────────────────────────────
function SectionE({ s }: { s?: BriefSectionData }) {
  const rows: [string, Answer][] = [
    ["Compliance requirements", qa(s, 0)],
    ["What environments do you operate in?", qa(s, 1)],
    ["Vendor lock-ins", qa(s, 2)],
  ];
  const visible = rows.filter(([, a]) => !blank(a));
  if (visible.length === 0) return null;
  return (
    <BCard>
      <BCardHeader
        icon={<ShieldAlert className="h-4 w-4" />}
        title="Risk, Access & Constraints"
        subtitle="What you can and cannot touch"
      />
      <div className="p-5 space-y-4 divide-y divide-border">
        {visible.map(([label, a], i) => (
          <div key={i} className={i > 0 ? "pt-4" : ""}>
            <Row label={label} a={a} />
          </div>
        ))}
      </div>
    </BCard>
  );
}

// ── Section F – Outcome ───────────────────────────────────────────────────────
function SectionF({ s }: { s?: BriefSectionData }) {
  const timeline = qa(s, 0);
  const metrics = qa(s, 1);
  const topPri = qa(s, 2);
  const inaction = qa(s, 3);
  const criteria = qa(s, 4);
  return (
    <BCard accent="outcome">
      <BCardHeader
        icon={<Target className="h-4 w-4" />}
        title="Outcome Orientation"
        subtitle="Align every section of your proposal to what the owner states here."
        accent="outcome"
      />
      <div className="p-5 space-y-4 divide-y divide-border">
        {!blank(timeline) && (
          <Row label="Implementation timeline" a={timeline} />
        )}
        {!blank(topPri) && (
          <div className="pt-4 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
            <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
              Top priority
            </p>
            <p className="text-sm font-semibold text-foreground leading-relaxed">
              {asStr(topPri)}
            </p>
          </div>
        )}
        {!blank(metrics) && (
          <div className="pt-4">
            <Row
              label="What would success look like in 3–6 months?"
              a={metrics}
            />
          </div>
        )}
        {!blank(inaction) && (
          <div className="pt-4 space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              If nothing changes, what happens?
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {asStr(inaction)}
            </p>
          </div>
        )}
        {!blank(criteria) && (
          <div className="pt-4">
            <Row label='What makes a proposal "good"' a={criteria} />
          </div>
        )}
      </div>
    </BCard>
  );
}

// ── Legacy fallback (pre-v2 posts) ────────────────────────────────────────────
function DiscoveryBriefLegacy({ goal }: { goal: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Business Brief
      </p>
      <pre className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">
        {goal}
      </pre>
    </div>
  );
}

function DiscoveryBrief({ goal }: { goal: string }) {
  if (!goal.trim().startsWith("{")) return <DiscoveryBriefLegacy goal={goal} />;
  let brief: BriefV2 | null = null;
  try {
    brief = JSON.parse(goal) as BriefV2;
  } catch {
    /* fall through */
  }
  if (!brief) return <DiscoveryBriefLegacy goal={goal} />;
  const get = (id: string) => brief!.sections.find((s) => s.id === id);
  const G = get("G");
  const finalNote = G?.qa?.[0]?.a;
  return (
    <div className="space-y-4">
      <SectionA s={get("A")} />
      <SectionB s={get("B")} />
      <SectionC s={get("C")} />
      <SectionD s={get("D")} />
      <SectionE s={get("E")} />
      <SectionF s={get("F")} />
      {finalNote && !blank(finalNote) && (
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            In their own words
          </p>
          <blockquote className="border-l-2 border-primary pl-4 text-sm text-foreground leading-relaxed italic">
            {asStr(finalNote)}
          </blockquote>
        </div>
      )}
    </div>
  );
}

// ── Custom Project Brief ──────────────────────────────────────────────────────

// Icons per custom project section id
const cpSectionIcon: Record<string, React.ReactNode> = {
  A: <Briefcase className="h-4 w-4" />,
  B: <Wrench className="h-4 w-4" />,
  C: <AlertTriangle className="h-4 w-4" />,
  D: <ShieldAlert className="h-4 w-4" />,
  E: <Target className="h-4 w-4" />,
  F: <TrendingUp className="h-4 w-4" />,
};

function CustomProjectBrief({
  job,
}: {
  job: {
    title: string;
    goal: string;
    tools: string[];
    budgetRange: string;
    timeline: string;
  };
}) {
  // Meta strip (budget / timeline / tools) — always shown
  const meta = (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2 font-bold text-sm border-b border-border pb-3">
        <Briefcase className="h-4 w-4 text-primary" /> Project Overview
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/30 border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Budget range</div>
          <div className="font-semibold text-sm flex items-center gap-1">
            <Euro className="h-3.5 w-3.5 text-primary" />
            {job.budgetRange}
          </div>
        </div>
        <div className="bg-secondary/30 border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground mb-1">Timeline</div>
          <div className="font-semibold text-sm flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-primary" />
            {job.timeline}
          </div>
        </div>
      </div>
      {job.tools.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            Tools involved
          </div>
          <TagList items={job.tools} />
        </div>
      )}
    </div>
  );

  // If goal is BriefV2 JSON → render structured section cards
  if (job.goal?.trim().startsWith("{")) {
    try {
      const brief = JSON.parse(job.goal) as BriefV2;
      if (brief.version && Array.isArray(brief.sections)) {
        return (
          <div className="space-y-4">
            {meta}
            {brief.sections.map((section) => {
              const visibleQA = section.qa.filter((item) => !blank(item.a));
              if (visibleQA.length === 0) return null;
              return (
                <BCard key={section.id}>
                  <BCardHeader
                    icon={
                      cpSectionIcon[section.id] ?? (
                        <Briefcase className="h-4 w-4" />
                      )
                    }
                    title={section.title}
                    subtitle={section.subtitle}
                  />
                  <div className="p-5 space-y-4 divide-y divide-border">
                    {visibleQA.map((item, i) => (
                      <div key={i} className={i > 0 ? "pt-4" : ""}>
                        <Row label={item.q} a={item.a} />
                      </div>
                    ))}
                  </div>
                </BCard>
              );
            })}
          </div>
        );
      }
    } catch {
      /* fall through to legacy */
    }
  }

  // Legacy: plain text goal
  return (
    <div className="space-y-4">
      {meta}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 font-bold text-sm mb-3">
          <Target className="h-4 w-4 text-primary" /> Project Goal
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {job.goal}
        </p>
      </div>
    </div>
  );
}

// ── Shared client sidebar card ────────────────────────────────────────────────

function ClientCard({
  job,
  isDiscovery,
  maxBids,
  bidCount,
  isFull,
}: {
  job: {
    buyer: {
      businessProfile: {
        companyName?: string | null;
        industry?: string | null;
      } | null;
    };
  };
  isDiscovery: boolean;
  maxBids: number;
  bidCount: number;
  isFull: boolean;
}) {
  return (
    <>
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-bold text-sm mb-4">About the client</h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary">
            {job.buyer.businessProfile?.companyName?.[0] ?? "C"}
          </div>
          <div>
            <div className="font-medium text-sm">
              {job.buyer.businessProfile?.companyName ?? "Company"}
            </div>
            <div className="text-xs text-muted-foreground">
              {job.buyer.businessProfile?.industry ?? ""}
            </div>
          </div>
        </div>
        {isDiscovery ? (
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Paid €50 for
              this diagnostic
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Up to{" "}
              {maxBids} proposals — yours earns €5
            </div>
          </div>
        ) : (
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Paid €100
              posting fee — serious intent
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Max{" "}
              {maxBids} proposals — low competition
            </div>
          </div>
        )}
      </div>

      <div className="bg-secondary/30 border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Proposals received
          </span>
          <span
            className={`text-xs font-bold ${isFull ? "text-destructive" : "text-foreground"}`}
          >
            {bidCount} / {maxBids}
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isFull ? "bg-destructive" : "bg-primary"}`}
            style={{ width: `${Math.min((bidCount / maxBids) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {isFull
            ? "No more proposals are being accepted for this project."
            : `${maxBids - bidCount} slot${maxBids - bidCount === 1 ? "" : "s"} remaining`}
        </p>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: {
    paid?: string;
    canceled?: string;
  };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/auth/sign-in?next=/jobs/${params.id}`);
  }

  if (searchParams.canceled === "true") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        </div>
        <p className="text-muted-foreground mb-6">
          Payment was canceled. You can pay anytime from this page.
        </p>
        <Link
          href="/jobs"
          className="text-primary font-medium hover:underline text-sm"
        >
          Back to job →
        </Link>
      </div>
    );
  }

  if (searchParams.paid === "true") {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center">
          <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Payment successful!</h1>
          <p className="text-muted-foreground mb-6">
            Your project is now live and visible to experts.
          </p>
          <Link
            href="/jobs"
            className="text-primary font-medium hover:underline text-sm"
          >
            View your project →
          </Link>
        </div>
      </div>
    );
  }

  const job = await prisma.jobPost.findUnique({
    where: { id: params.id },
    include: {
      buyer: { include: { businessProfile: true } },
      bids: {
        include: {
          specialist: { include: { user: true } },
          order: { select: { id: true, milestones: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job) notFound();

  const isBuyer = job.buyerId === session.user.id;
  const isExpert = session.user.role === "EXPERT";

  let specialistProfile = null;
  if (isExpert) {
    specialistProfile = await prisma.specialistProfile.findUnique({
      where: { userId: session.user.id },
    });
  }

  const isDiscovery =
    job.category === "Discovery" || job.category === "Discovery Scan";
  const maxBids = MAX_PROPOSALS[job.category] ?? MAX_PROPOSALS.default;
  const bidCount = job.bids.length;
  const isFull = bidCount >= maxBids;
  const alreadySubmitted =
    isExpert && specialistProfile
      ? job.bids.some((b) => b.specialistId === specialistProfile?.id)
      : false;

  const canPropose =
    isExpert &&
    specialistProfile?.status === "APPROVED" &&
    (specialistProfile.tier === "ELITE" ||
      specialistProfile.isFoundingExpert) &&
    (job.status === "open" || job.status === "full") &&
    !alreadySubmitted &&
    !isFull;

  // Post-tender: expert participated and job is awarded or closed
  const isPostTender =
    isExpert &&
    alreadySubmitted &&
    (job.status === "awarded" || job.status === "closed");

  // Pending Payment View
  if (job.status === "pending_payment") {
    if (!isBuyer) return <div className="p-8">This job is not yet active.</div>;
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Link
          href="/jobs"
          className="flex items-center text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Link>
        <PaymentStub jobId={job.id} category={job.category} />
      </div>
    );
  }

  // Non-ELITE expert — locked
  if (
    isExpert &&
    !canPropose &&
    !specialistProfile?.isFoundingExpert &&
    specialistProfile?.tier !== "ELITE" &&
    !isBuyer
  ) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <div className="bg-card border border-border rounded-xl p-12">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold mb-4">
            Elite & Founding Access Only
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm">
            Job requests are available to Elite and Founding experts. Deliver
            great solutions to level up.
          </p>
          <Link
            href="/dashboard"
            className="text-primary font-medium hover:underline text-sm"
          >
            View ranking requirements →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl">
      <JobPaymentFeedback />
      <Link
        href="/jobs"
        className="flex items-center text-muted-foreground hover:text-foreground mb-6 text-sm"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {isExpert
          ? isDiscovery
            ? "Discovery Scan Feed"
            : "Custom Projects Feed"
          : "My Job Requests"}
      </Link>

      {/* Page header */}
      <div className="flex items-start gap-3 mb-8">
        <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          {isDiscovery ? (
            <Compass className="h-5 w-5" />
          ) : (
            <Briefcase className="h-5 w-5" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
              {job.category}
            </span>
            <span className="text-xs text-muted-foreground">
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-1">{job.title}</h1>
          {job.buyer?.businessProfile?.companyName && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              {job.buyer.businessProfile.companyName}
              {job.buyer.businessProfile.industry && (
                <span>· {job.buyer.businessProfile.industry}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Expert view: always 50/50 — brief left, action right ── */}
      {isExpert ? (
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left: brief — sticky on desktop (lg+), stacks on mobile */}
          <div className="lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto space-y-4 lg:pr-2 pb-6 lg:pb-0">
            {/* Compact client strip */}
            <div className="flex items-center justify-between gap-4 bg-secondary/30 border border-border rounded-xl px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary text-sm shrink-0">
                  {job.buyer.businessProfile?.companyName?.[0] ?? "C"}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">
                    {job.buyer.businessProfile?.companyName ?? "Client"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {job.buyer.businessProfile?.industry ?? ""}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p
                  className={`text-xs font-bold ${isFull ? "text-destructive" : "text-foreground"}`}
                >
                  {bidCount} / {maxBids} proposals
                </p>
                <p className="text-xs text-muted-foreground">
                  {isFull
                    ? "Full"
                    : `${maxBids - bidCount} slot${maxBids - bidCount === 1 ? "" : "s"} left`}
                </p>
              </div>
            </div>

            {/* Brief label */}
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              {isDiscovery ? "Business Diagnostic Brief" : "Project Brief"}
            </p>

            {isDiscovery ? (
              <DiscoveryBrief goal={job.goal} />
            ) : (
              <CustomProjectBrief job={job} />
            )}
          </div>

          {/* Right: form OR submitted state */}
          <div className="space-y-5">
            {canPropose ? (
              <ProposalFormGated jobId={job.id} jobCategory={job.category} />
            ) : isPostTender ? (
              <>
                {/* Post-tender: show all bids anonymized for learning */}
                <ProposalList
                  bids={job.bids}
                  jobId={job.id}
                  isOwner={false}
                  isExpertView={true}
                  isPostTenderView={true}
                  expertSpecialistId={specialistProfile?.id}
                />
                <ClientCard
                  job={job}
                  isDiscovery={isDiscovery}
                  maxBids={maxBids}
                  bidCount={bidCount}
                  isFull={isFull}
                />
              </>
            ) : alreadySubmitted ? (
              <>
                {/* Submitted banner — job still open, waiting for result */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                  <CheckCircle2 className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-sm">Proposal submitted</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You&apos;ll be notified if the buyer accepts.
                  </p>
                </div>
                {/* Show their proposal */}
                <div>
                  <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
                    Your Submitted Proposal
                  </h2>
                  <ProposalList
                    bids={job.bids.filter(
                      (b) => b.specialistId === specialistProfile?.id,
                    )}
                    jobId={job.id}
                    isOwner={false}
                    isExpertView={true}
                  />
                </div>
                {/* About the client */}
                <ClientCard
                  job={job}
                  isDiscovery={isDiscovery}
                  maxBids={maxBids}
                  bidCount={bidCount}
                  isFull={isFull}
                />
              </>
            ) : isFull ? (
              <>
                <div className="bg-secondary/40 border border-border rounded-xl p-5 text-center">
                  <Lock className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                  <p className="font-semibold text-sm">
                    Proposal limit reached
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This project received all {maxBids} proposals. Check other
                    open projects.
                  </p>
                </div>
                <ClientCard
                  job={job}
                  isDiscovery={isDiscovery}
                  maxBids={maxBids}
                  bidCount={bidCount}
                  isFull={isFull}
                />
              </>
            ) : job.status === "awarded" ? (
              <>
                <div className="bg-secondary/40 border border-border rounded-xl p-5 text-center">
                  <CheckCircle2 className="h-7 w-7 text-muted-foreground mx-auto mb-2" />
                  <p className="font-semibold text-sm">Project awarded</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This project has been awarded to another expert.
                  </p>
                </div>
                <ClientCard
                  job={job}
                  isDiscovery={isDiscovery}
                  maxBids={maxBids}
                  bidCount={bidCount}
                  isFull={isFull}
                />
              </>
            ) : null}
          </div>
        </div>
      ) : (
        /* ── Buyer view: 2/3 brief + 1/3 sidebar ── */
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">
                {isDiscovery ? "Business Diagnostic Brief" : "Project Brief"}
              </h2>
              {isDiscovery ? (
                <DiscoveryBrief goal={job.goal} />
              ) : (
                <CustomProjectBrief job={job} />
              )}
            </div>
            {isBuyer && (
              <div className="mt-8">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-4">
                  Proposals
                </h2>
                <ProposalList bids={job.bids} jobId={job.id} isOwner={true} />
              </div>
            )}
          </div>
          <div className="lg:col-span-1 space-y-5">
            <ClientCard
              job={job}
              isDiscovery={isDiscovery}
              maxBids={maxBids}
              bidCount={bidCount}
              isFull={isFull}
            />
          </div>
        </div>
      )}
    </div>
  );
}
