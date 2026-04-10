"use client";

import {
  getAuditAnalyticsCompletionCount,
  getAuditAnalyticsScoreDistribution,
  getAuditAnalyticsStepCounts,
  getAuditAnalyticsSummary,
} from "@/actions/admin";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BarChart2,
  Gauge,
  Hash,
  Mail,
  TrendingDown,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuditAnalyticsSummary = NonNullable<
  Awaited<ReturnType<typeof getAuditAnalyticsSummary>>
>;
type AuditAnalyticsStepCounts = NonNullable<
  Awaited<ReturnType<typeof getAuditAnalyticsStepCounts>>
>;
type AuditAnalyticsScoreDistribution = NonNullable<
  Awaited<ReturnType<typeof getAuditAnalyticsScoreDistribution>>
>;
type AuditAnalyticsCompletionCount = NonNullable<
  Awaited<ReturnType<typeof getAuditAnalyticsCompletionCount>>
>;
type AuditAnalyticsPeriod = "7d" | "30d" | "all";

const AUDIT_ANALYTICS_PERIOD_OPTIONS = [
  { value: "30d", label: "30 days" },
  { value: "7d", label: "Last 7 days" },
  { value: "all", label: "All time" },
] as const satisfies ReadonlyArray<{
  value: AuditAnalyticsPeriod;
  label: string;
}>;

const STEP_LABELS = [
  "Team Size",
  "Manual Tasks",
  "Hours/Week",
  "Data Setup",
  "Frustration",
] as const;

const KPI_CONFIG = [
  { label: "Starts", key: "starts", icon: Activity },
  { label: "Completions", key: "completions", icon: BarChart2 },
  { label: "Completion Rate", key: "completion-rate", icon: TrendingDown },
  { label: "Emails Captured", key: "emails", icon: Mail },
  { label: "Email Rate", key: "email-rate", icon: Users },
] as const;

const SCORE_BUCKET_KEYS = ["0-24", "25-44", "45-64", "65-100"] as const;
const CATEGORY_SKELETON_KEYS = [
  "category-a",
  "category-b",
  "category-c",
] as const;

function getAuditAnalyticsPeriodDescription(period: AuditAnalyticsPeriod) {
  switch (period) {
    case "7d":
      return "Last 7 days";
    case "all":
      return "All time";
    case "30d":
    default:
      return "Last 30 days";
  }
}

function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className}`} />;
}

function AnalyticsSectionError({
  title,
  onRetry,
}: {
  title: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-xl border border-destructive/20 bg-card p-6">
      <h2 className="mb-2 text-sm font-semibold text-foreground">{title}</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        This section failed to load.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Retry
      </button>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
      {KPI_CONFIG.map(({ key }) => (
        <div key={key} className="rounded-xl border border-border bg-card p-4">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="mt-4 h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

function StepDropoffSkeleton() {
  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <SkeletonBlock className="h-4 w-4 rounded-full" />
        <SkeletonBlock className="h-4 w-40" />
      </div>
      <div className="space-y-3">
        {STEP_LABELS.map((label) => (
          <div key={label}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <SkeletonBlock className="h-4 w-32 max-w-full" />
              <SkeletonBlock className="h-4 w-14 shrink-0" />
            </div>
            <SkeletonBlock className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreSectionSkeleton() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <SkeletonBlock className="h-4 w-4 rounded-full" />
          <SkeletonBlock className="h-4 w-32" />
        </div>
        <SkeletonBlock className="mb-4 h-4 w-32" />
        <div className="space-y-3">
          {SCORE_BUCKET_KEYS.map((bucket) => (
            <div key={bucket}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <SkeletonBlock className="h-4 w-16" />
                <SkeletonBlock className="h-4 w-8 shrink-0" />
              </div>
              <SkeletonBlock className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <SkeletonBlock className="h-4 w-4 rounded-full" />
          <SkeletonBlock className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          {CATEGORY_SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-center justify-between border-b border-border py-1.5 last:border-0"
            >
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialProofSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-2 flex items-center gap-2">
        <SkeletonBlock className="h-4 w-4 rounded-full" />
        <SkeletonBlock className="h-4 w-32" />
      </div>
      <SkeletonBlock className="mb-3 h-4 w-full max-w-xl" />
      <SkeletonBlock className="h-9 w-20" />
      <SkeletonBlock className="mt-2 h-3 w-36" />
    </div>
  );
}

function AuditAnalyticsSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 space-y-2">
        <SkeletonBlock className="h-8 w-64 max-w-full" />
        <SkeletonBlock className="h-4 w-24" />
      </div>
      <KpiSkeleton />
      <StepDropoffSkeleton />
      <ScoreSectionSkeleton />
      <SocialProofSkeleton />
    </div>
  );
}

export function AuditAnalytics() {
  const router = useRouter();
  const [period, setPeriod] = useState<AuditAnalyticsPeriod>("30d");
  const periodDescription = getAuditAnalyticsPeriodDescription(period);

  const summaryQuery = useQuery<AuditAnalyticsSummary | null>({
    queryKey: ["admin", "audit-analytics", "summary", period],
    queryFn: () => getAuditAnalyticsSummary(period),
    retry: false,
  });

  const stepCountsQuery = useQuery<AuditAnalyticsStepCounts | null>({
    queryKey: ["admin", "audit-analytics", "steps", period],
    queryFn: () => getAuditAnalyticsStepCounts(period),
    retry: false,
  });

  const scoreDistributionQuery =
    useQuery<AuditAnalyticsScoreDistribution | null>({
      queryKey: ["admin", "audit-analytics", "scores", period],
      queryFn: () => getAuditAnalyticsScoreDistribution(period),
      retry: false,
    });

  const completionCountQuery = useQuery<AuditAnalyticsCompletionCount | null>({
    queryKey: ["admin", "audit-analytics", "completion-count", period],
    queryFn: () => getAuditAnalyticsCompletionCount(period),
    retry: false,
  });

  const isUnauthorized =
    summaryQuery.data === null ||
    stepCountsQuery.data === null ||
    scoreDistributionQuery.data === null ||
    completionCountQuery.data === null;

  useEffect(() => {
    if (isUnauthorized) {
      router.replace("/auth/sign-in");
    }
  }, [isUnauthorized, router]);

  if (isUnauthorized) {
    return <AuditAnalyticsSkeleton />;
  }

  const summary = summaryQuery.data;
  const stepCounts = stepCountsQuery.data;
  const scoreDistribution = scoreDistributionQuery.data;
  const completionCount = completionCountQuery.data;

  const maxStepCount =
    summary && stepCounts ? Math.max(summary.totalStarts, 1) : 1;
  const maxScoreBucket = scoreDistribution
    ? Math.max(
        ...scoreDistribution.scoreBuckets.map((bucket) => bucket.count),
        1,
      )
    : 1;

  const kpis = summary
    ? [
        { label: "Starts", value: summary.totalStarts, icon: Activity },
        {
          label: "Completions",
          value: summary.totalCompletes,
          icon: BarChart2,
        },
        {
          label: "Completion Rate",
          value: `${summary.completionRate}%`,
          icon: TrendingDown,
        },
        { label: "Emails Captured", value: summary.totalEmails, icon: Mail },
        { label: "Average Score", value: summary.avgScore, icon: Gauge },
        {
          label: "Email Rate",
          value: `${summary.emailCaptureRate}%`,
          icon: Users,
        },
      ]
    : [];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-foreground">
            Audit Quiz Analytics
          </h1>
          <p className="text-sm text-muted-foreground">{periodDescription}</p>
        </div>

        <div className="w-full sm:w-auto">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Time period
          </p>
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as AuditAnalyticsPeriod)}
          >
            <SelectTrigger className="w-full sm:min-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {AUDIT_ANALYTICS_PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {summaryQuery.error ? (
        <div className="mb-8">
          <AnalyticsSectionError
            title="Top-level metrics"
            onRetry={() => void summaryQuery.refetch()}
          />
        </div>
      ) : !summary ? (
        <KpiSkeleton />
      ) : (
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-5">
          {kpis.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}

      {summaryQuery.error || stepCountsQuery.error ? (
        <div className="mb-6">
          <AnalyticsSectionError
            title="Step-by-step drop-off"
            onRetry={() => {
              void summaryQuery.refetch();
              void stepCountsQuery.refetch();
            }}
          />
        </div>
      ) : !summary || !stepCounts ? (
        <StepDropoffSkeleton />
      ) : (
        <div className="mb-6 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <TrendingDown className="h-4 w-4 text-primary" />
            Step-by-Step Drop-off
          </h2>
          <div className="space-y-3">
            {stepCounts.map(({ step, count }) => {
              const pct = Math.round((count / maxStepCount) * 100);

              return (
                <div key={step}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Step {step + 1}: {STEP_LABELS[step]}
                    </span>
                    <span className="tabular-nums text-sm text-muted-foreground">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary transition-[width]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {scoreDistributionQuery.error ? (
        <div className="mb-6">
          <AnalyticsSectionError
            title="Score breakdown"
            onRetry={() => void scoreDistributionQuery.refetch()}
          />
        </div>
      ) : !scoreDistribution ? (
        <ScoreSectionSkeleton />
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Hash className="h-4 w-4 text-primary" />
              Score Distribution
            </h2>
            {scoreDistribution.avgScore > 0 && (
              <p className="mb-4 text-xs text-muted-foreground">
                Average score:{" "}
                <span className="font-semibold text-foreground">
                  {scoreDistribution.avgScore}
                </span>
                /100
              </p>
            )}
            <div className="space-y-3">
              {scoreDistribution.scoreBuckets.map(({ label, count }) => {
                const pct = Math.round((count / maxScoreBucket) * 100);

                return (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm text-foreground">{label}</span>
                      <span className="tabular-nums text-sm text-muted-foreground">
                        {count}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-[width]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <BarChart2 className="h-4 w-4 text-primary" />
              Result Categories
            </h2>
            <div className="space-y-2">
              {Object.entries(scoreDistribution.scoreLabelCounts).length > 0 ? (
                Object.entries(scoreDistribution.scoreLabelCounts).map(
                  ([label, count]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between border-b border-border py-1.5 text-sm last:border-0"
                    >
                      <span className="text-foreground">{label}</span>
                      <span className="tabular-nums font-semibold">
                        {count}
                      </span>
                    </div>
                  ),
                )
              ) : (
                <p className="text-sm text-muted-foreground">
                  No completions yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {completionCountQuery.error ? (
        <AnalyticsSectionError
          title="Social proof data"
          onRetry={() => void completionCountQuery.refetch()}
        />
      ) : !completionCount ? (
        <SocialProofSkeleton />
      ) : (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="h-4 w-4 text-primary" />
            Social Proof Data
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Real completion count for the selected period. Use the all-time view
            when you need the full social proof total.
          </p>
          <p className="text-3xl font-bold text-foreground">
            {completionCount.completions}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {period === "all"
              ? "all-time audit completions"
              : `${periodDescription.toLowerCase()} audit completions`}
          </p>
        </div>
      )}
    </div>
  );
}
