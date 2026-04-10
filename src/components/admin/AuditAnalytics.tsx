"use client";

import {
  getAuditAnalyticsAllTimeCompletions,
  getAuditAnalyticsScoreDistribution,
  getAuditAnalyticsStepCounts,
  getAuditAnalyticsSummary,
} from "@/actions/admin";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BarChart2,
  Hash,
  Mail,
  TrendingDown,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type AuditAnalyticsSummary = NonNullable<
  Awaited<ReturnType<typeof getAuditAnalyticsSummary>>
>;
type AuditAnalyticsStepCounts = NonNullable<
  Awaited<ReturnType<typeof getAuditAnalyticsStepCounts>>
>;
type AuditAnalyticsScoreDistribution = NonNullable<
  Awaited<ReturnType<typeof getAuditAnalyticsScoreDistribution>>
>;
type AuditAnalyticsAllTimeCompletions = NonNullable<
  Awaited<ReturnType<typeof getAuditAnalyticsAllTimeCompletions>>
>;

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
const CATEGORY_SKELETON_KEYS = ["category-a", "category-b", "category-c"] as const;

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
        <div
          key={key}
          className="rounded-xl border border-border bg-card p-4"
        >
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

  const summaryQuery = useQuery<AuditAnalyticsSummary | null>({
    queryKey: ["admin", "audit-analytics", "summary"],
    queryFn: () => getAuditAnalyticsSummary(),
    retry: false,
  });

  const stepCountsQuery = useQuery<AuditAnalyticsStepCounts | null>({
    queryKey: ["admin", "audit-analytics", "steps"],
    queryFn: () => getAuditAnalyticsStepCounts(),
    retry: false,
  });

  const scoreDistributionQuery = useQuery<AuditAnalyticsScoreDistribution | null>({
    queryKey: ["admin", "audit-analytics", "scores"],
    queryFn: () => getAuditAnalyticsScoreDistribution(),
    retry: false,
  });

  const allTimeCompletionsQuery = useQuery<AuditAnalyticsAllTimeCompletions | null>({
    queryKey: ["admin", "audit-analytics", "all-time-completions"],
    queryFn: () => getAuditAnalyticsAllTimeCompletions(),
    retry: false,
  });

  const isUnauthorized =
    summaryQuery.data === null ||
    stepCountsQuery.data === null ||
    scoreDistributionQuery.data === null ||
    allTimeCompletionsQuery.data === null;

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
  const allTimeCompletions = allTimeCompletionsQuery.data;

  const maxStepCount =
    summary && stepCounts
      ? Math.max(summary.totalStarts, 1)
      : 1;
  const maxScoreBucket = scoreDistribution
    ? Math.max(...scoreDistribution.scoreBuckets.map((bucket) => bucket.count), 1)
    : 1;

  const kpis = summary
    ? [
        { label: "Starts", value: summary.totalStarts, icon: Activity },
        { label: "Completions", value: summary.totalCompletes, icon: BarChart2 },
        {
          label: "Completion Rate",
          value: `${summary.completionRate}%`,
          icon: TrendingDown,
        },
        { label: "Emails Captured", value: summary.totalEmails, icon: Mail },
        {
          label: "Email Rate",
          value: `${summary.emailCaptureRate}%`,
          icon: Users,
        },
      ]
    : [];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-1 text-2xl font-bold text-foreground">
          Audit Quiz Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Last {summary?.periodDays ?? 30} days
        </p>
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
                Object.entries(scoreDistribution.scoreLabelCounts).map(([label, count]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between border-b border-border py-1.5 text-sm last:border-0"
                  >
                    <span className="text-foreground">{label}</span>
                    <span className="tabular-nums font-semibold">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No completions yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {allTimeCompletionsQuery.error ? (
        <AnalyticsSectionError
          title="Social proof data"
          onRetry={() => void allTimeCompletionsQuery.refetch()}
        />
      ) : !allTimeCompletions ? (
        <SocialProofSkeleton />
      ) : (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="h-4 w-4 text-primary" />
            Social Proof Data
          </h2>
          <p className="mb-3 text-sm text-muted-foreground">
            Real completion count. Use this to replace the fabricated social proof
            percentages once it reaches a meaningful number.
          </p>
          <p className="text-3xl font-bold text-foreground">
            {allTimeCompletions.allTimeCompletions}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            all-time audit completions
          </p>
        </div>
      )}
    </div>
  );
}
