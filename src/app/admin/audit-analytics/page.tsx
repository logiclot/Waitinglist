import { getAuditAnalytics } from "@/actions/admin";
import { redirect } from "next/navigation";
import {
  BarChart2,
  Users,
  Mail,
  TrendingDown,
  Activity,
  Hash,
} from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Audit Analytics | ${BRAND_NAME}`,
};

const STEP_LABELS = [
  "Team Size",
  "Manual Tasks",
  "Hours/Week",
  "Data Setup",
  "Frustration",
];

export default async function AuditAnalyticsPage() {
  const data = await getAuditAnalytics();
  if (!data) redirect("/auth/sign-in");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Audit Quiz Analytics
        </h1>
        <p className="text-sm text-muted-foreground">
          Last {data.periodDays} days
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: "Starts", value: data.totalStarts, icon: Activity },
          { label: "Completions", value: data.totalCompletes, icon: BarChart2 },
          {
            label: "Completion Rate",
            value: `${data.completionRate}%`,
            icon: TrendingDown,
          },
          { label: "Emails Captured", value: data.totalEmails, icon: Mail },
          {
            label: "Email Rate",
            value: `${data.emailCaptureRate}%`,
            icon: Users,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Icon className="w-3.5 h-3.5" /> {label}
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Step drop-off funnel */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-primary" />
          Step-by-Step Drop-off
        </h2>
        <div className="space-y-3">
          {data.stepCounts.map(({ step, count }) => {
            const maxCount = Math.max(data.totalStarts, 1);
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={step}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-foreground font-medium">
                    Step {step + 1}: {STEP_LABELS[step]}
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score distribution + result categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Score buckets */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" />
            Score Distribution
          </h2>
          {data.avgScore > 0 && (
            <p className="text-xs text-muted-foreground mb-4">
              Average score: <span className="font-semibold text-foreground">{data.avgScore}</span>/100
            </p>
          )}
          <div className="space-y-3">
            {data.scoreBuckets.map(({ label, count }) => {
              const maxBucket = Math.max(
                ...data.scoreBuckets.map((b) => b.count),
                1
              );
              const pct = Math.round((count / maxBucket) * 100);
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{label}</span>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {count}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Score label breakdown */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Result Categories
          </h2>
          <div className="space-y-2">
            {Object.entries(data.scoreLabelCounts).length > 0 ? (
              Object.entries(data.scoreLabelCounts).map(([label, count]) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0"
                >
                  <span className="text-foreground">{label}</span>
                  <span className="font-semibold tabular-nums">{count}</span>
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

      {/* Social proof */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Social Proof Data
        </h2>
        <p className="text-sm text-muted-foreground mb-3">
          Real completion count. Use this to replace the fabricated social proof
          percentages once it reaches a meaningful number.
        </p>
        <p className="text-3xl font-bold text-foreground">
          {data.allTimeCompletions}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          all-time audit completions
        </p>
      </div>
    </div>
  );
}
