import { getJobAnalytics } from "@/actions/admin";
import { redirect } from "next/navigation";
import {
  Briefcase,
  CreditCard,
  MessageSquare,
  Award,
  XCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  TrendingDown,
} from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Job Analytics | ${BRAND_NAME}`,
};

function Card({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.ElementType; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}

function CategoryBlock({ data }: { data: NonNullable<Awaited<ReturnType<typeof getJobAnalytics>>> }) {
  const maxFunnel = Math.max(...data.funnel.map(f => f.count), 1);
  const priceEur = (data.priceCents / 100).toFixed(0);
  const revenueEur = (data.revenue30d / 100).toFixed(0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{data.category}</h2>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">
          Last {data.periodDays} days
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card icon={Briefcase} label="Created" value={data.totalCreated} />
        <Card icon={CreditCard} label="Paid" value={data.totalPaid} sub={`${data.paymentRate}% conversion`} />
        <Card icon={MessageSquare} label="Proposals" value={data.totalProposals} sub={`${data.avgProposalsPerJob} avg/job`} />
        <Card icon={Award} label="Awarded" value={data.totalAwarded} sub={`${data.acceptanceRate}% acceptance`} />
        <Card icon={CreditCard} label="Revenue" value={`€${revenueEur}`} sub={`@ €${priceEur}/post`} />
      </div>

      {/* Funnel + Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Funnel */}
        <Section title="Conversion Funnel">
          <div className="space-y-3">
            {data.funnel.map((step, i) => {
              const pct = maxFunnel > 0 ? Math.round((step.count / maxFunnel) * 100) : 0;
              return (
                <div key={step.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{step.label}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {step.count}
                      {i > 0 && data.funnel[0].count > 0 && (
                        <span className="ml-1">
                          ({Math.round((step.count / data.funnel[0].count) * 100)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Details */}
        <Section title="Key Metrics">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Proposal coverage</span>
              </div>
              <span className="font-semibold text-foreground">{data.proposalCoverage}%</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Avg time to first proposal</span>
              </div>
              <span className="font-semibold text-foreground">
                {data.avgTimeToFirstProposal !== null ? `${data.avgTimeToFirstProposal}h` : "n/a"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <XCircle className="h-3.5 w-3.5" />
                <span>Rejected (refunded)</span>
              </div>
              <span className="font-semibold text-foreground">{data.totalRejected}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingDown className="h-3.5 w-3.5" />
                <span>Pending payment (abandoned)</span>
              </div>
              <span className="font-semibold text-foreground">{data.totalPendingPayment}</span>
            </div>

            <div className="flex items-center justify-between text-sm border-t border-border pt-3 mt-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Proposal feedback</span>
              </div>
              <span className="font-semibold text-foreground">
                {data.thumbsUp} <ThumbsUp className="h-3 w-3 inline text-green-600" /> / {data.thumbsDown} <ThumbsDown className="h-3 w-3 inline text-red-500" />
              </span>
            </div>
          </div>
        </Section>
      </div>

      {/* All-time */}
      <p className="text-xs text-muted-foreground">
        All-time: <span className="font-semibold text-foreground">{data.allTimePosted}</span> {data.category.toLowerCase()}s posted
      </p>
    </div>
  );
}

export default async function JobAnalyticsPage() {
  const [discovery, custom] = await Promise.all([
    getJobAnalytics("Discovery Scan"),
    getJobAnalytics("Custom Project"),
  ]);

  if (!discovery || !custom) redirect("/auth/sign-in");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Job Analytics</h1>
        <p className="text-sm text-muted-foreground">Discovery Scans and Custom Projects</p>
      </div>

      <CategoryBlock data={discovery} />

      <div className="border-t border-border" />

      <CategoryBlock data={custom} />
    </div>
  );
}
