"use client";

import { useState } from "react";
import {
  ChevronDown, ChevronUp, Mail, Clock, Target,
  BarChart2, Users,
} from "lucide-react";

export interface AuditCompletion {
  id: string;
  sessionId: string;
  score: number | null;
  scoreLabel: string | null;
  answers: Record<string, string | string[]> | null;
  email: string | null;
  createdAt: string;
}

// Maps answer IDs to readable labels
const ANSWER_LABELS: Record<string, Record<string, string>> = {
  team_size: {
    solo: "Just me (Solo)",
    small: "2–10 people",
    medium: "11–50 people",
    large: "50+ people",
  },
  manual_tasks: {
    invoicing: "Invoicing & billing",
    sales_followup: "Sales follow-up & outreach",
    scheduling: "Scheduling & appointments",
    reporting: "Reporting & data entry",
    hr_onboarding: "HR & employee onboarding",
    customer_support: "Customer support & queries",
    social_media: "Social media & content",
    inventory: "Inventory & order management",
  },
  hours_spent: {
    low: "Less than 5 hours/week",
    medium: "5–15 hours/week",
    high: "15–30 hours/week",
    very_high: "More than 30 hours/week",
  },
  data_management: {
    spreadsheets: "Mainly spreadsheets and email",
    disconnected: "Tools that work separately",
    partial: "Some tools connected",
    connected: "Fully connected systems",
  },
  biggest_frustration: {
    things_slip: "Things fall through the cracks",
    too_slow: "Manual processes are too slow",
    no_visibility: "No visibility on what's happening",
    scaling: "Can't scale without hiring",
  },
};

const QUESTION_LABELS: Record<string, string> = {
  team_size: "Team Size",
  manual_tasks: "Manual Tasks",
  hours_spent: "Hours Spent",
  data_management: "Data Management",
  biggest_frustration: "Biggest Frustration",
};

function ScoreBadge({ score, label }: { score: number | null; label: string | null }) {
  if (score === null) return null;
  const color = score >= 65
    ? "bg-red-100 text-red-700"
    : score >= 45
      ? "bg-amber-100 text-amber-700"
      : score >= 25
        ? "bg-blue-100 text-blue-700"
        : "bg-green-100 text-green-700";
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded ${color}`}>
      {score}/100 {label && `— ${label}`}
    </span>
  );
}

function formatAnswer(key: string, value: string | string[]): string {
  const labelMap = ANSWER_LABELS[key];
  if (!labelMap) return Array.isArray(value) ? value.join(", ") : String(value);
  if (Array.isArray(value)) {
    return value.map(v => labelMap[v] ?? v).join(", ");
  }
  return labelMap[value] ?? String(value);
}

export function AuditResultsTab({ completions }: { completions: AuditCompletion[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "with_email" | "high_score">("all");

  const filtered = completions.filter(c => {
    if (filter === "with_email") return !!c.email;
    if (filter === "high_score") return (c.score ?? 0) >= 45;
    return true;
  });

  const emailCount = completions.filter(c => c.email).length;
  const avgScore = completions.length > 0
    ? Math.round(completions.reduce((s, c) => s + (c.score ?? 0), 0) / completions.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{completions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Completions</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{emailCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Emails Captured</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{avgScore}/100</p>
          <p className="text-xs text-muted-foreground mt-1">Avg Score</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {completions.length > 0 ? Math.round((emailCount / completions.length) * 100) : 0}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">Email Capture Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {([
          { key: "all", label: "All" },
          { key: "with_email", label: "With Email" },
          { key: "high_score", label: "High Potential (45+)" },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-xs text-muted-foreground self-center ml-2">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Results list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <BarChart2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No audit completions yet</p>
          <p className="text-xs text-muted-foreground">Completions will appear here as users finish the audit quiz.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const isExpanded = expandedId === c.id;
            const answers = c.answers as Record<string, string | string[]> | null;
            return (
              <div key={c.id} className="border border-border rounded-xl overflow-hidden bg-card">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex items-center gap-2">
                      {c.email ? (
                        <Mail className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">
                            {c.email ?? "Anonymous"}
                          </span>
                          <ScoreBadge score={c.score} label={c.scoreLabel} />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(c.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {isExpanded && answers && (
                  <div className="border-t border-border px-5 py-4 space-y-3">
                    {Object.entries(answers).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-3">
                        <Target className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {QUESTION_LABELS[key] ?? key}
                          </p>
                          <p className="text-sm text-foreground mt-0.5">
                            {formatAnswer(key, value)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
