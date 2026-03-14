"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Clock,
  CheckCircle2,
  Zap,
  Sparkles,
  Play,
  TrendingUp,
} from "lucide-react";
import { normalizeYouTubeUrl, getYouTubeEmbedUrl } from "@/lib/video";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SuiteDetailSolutionCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: any;
  index: number;
  ecosystemExpertId: string;
  isLast: boolean;
}

export function SuiteDetailSolutionCard({
  item,
  index,
  ecosystemExpertId,
  isLast,
}: SuiteDetailSolutionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sol = item.solution;
  const isPartner = sol.expert && sol.expert.id !== ecosystemExpertId;

  // Gather expandable content
  const description = sol.longDescription || sol.description || "";
  const outline: string[] = sol.outline ?? [];
  const included: string[] = sol.included ?? [];
  const integrations: string[] = sol.integrations ?? [];
  const skills: { name: string; description: string }[] = sol.skills ?? [];
  const faq: { question: string; answer: string }[] = sol.faq ?? [];

  // Demo video
  const hasDemoVideo =
    sol.demoVideoUrl &&
    sol.demoVideoStatus === "approved";
  let embedUrl = "";
  if (hasDemoVideo) {
    const parsed = normalizeYouTubeUrl(sol.demoVideoUrl);
    if (parsed.ok && parsed.videoId) {
      embedUrl = getYouTubeEmbedUrl(parsed.videoId, sol.demoVideoStartSeconds);
    }
  }

  // ROI
  const hasRoi = sol.avgRoi || sol.roiMonths || sol.measurableOutcome;

  const hasExpandableContent =
    description ||
    outline.length > 0 ||
    included.length > 0 ||
    embedUrl ||
    skills.length > 0 ||
    hasRoi;

  return (
    <div
      className={`relative pl-8 border-l-2 border-border pb-8 ${
        isLast ? "last:pb-0 last:border-l-0" : ""
      }`}
    >
      {/* Step number */}
      <div className="absolute -left-[11px] top-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
        {index + 1}
      </div>

      <div
        className={`bg-card border rounded-xl transition-colors ${
          expanded ? "border-primary/40 shadow-md" : "border-border hover:border-primary/30"
        }`}
      >
        {/* Header — always visible */}
        <button
          onClick={() => hasExpandableContent && setExpanded(!expanded)}
          className={`w-full text-left p-6 ${
            hasExpandableContent ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2 flex-wrap">
                <Link
                  href={`/solutions/${sol.slug}`}
                  className="hover:underline hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  {sol.title}
                </Link>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  v{sol.version || 1}.0
                </span>
                {isPartner && (
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium border border-blue-100">
                    Partner
                  </span>
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                {sol.shortSummary || sol.outcome}
              </p>

              {/* Expert attribution for partner solutions */}
              {isPartner && sol.expert && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600">
                    {sol.expert.displayName[0]}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    by{" "}
                    <Link
                      href={`/experts/${sol.expert.slug}`}
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {sol.expert.displayName}
                    </Link>
                  </span>
                </div>
              )}

              {/* Compact meta row */}
              {integrations.length > 0 && (
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {integrations.slice(0, 5).map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1 text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full"
                    >
                      <Zap className="w-2.5 h-2.5" />
                      {tool}
                    </span>
                  ))}
                  {integrations.length > 5 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{integrations.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="font-bold text-lg">
                  &euro;
                  {(sol.implementationPriceCents / 100).toLocaleString(
                    "de-DE"
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                  <Clock className="w-3 h-3" /> {sol.deliveryDays} days
                </div>
              </div>

              {hasExpandableContent && (
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              )}
            </div>
          </div>
        </button>

        {/* Expandable content */}
        {expanded && hasExpandableContent && (
          <div className="px-6 pb-6 border-t border-border pt-5 space-y-6 animate-in slide-in-from-top-2 duration-200">
            {/* Description */}
            {description && (
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>
            )}

            {/* Demo Video */}
            {embedUrl && (
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" /> Demo Video
                </h4>
                <div className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden border border-border/50">
                  <iframe
                    src={embedUrl}
                    title={`${sol.title} Demo Video`}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {/* Two-column: Key Outcomes + What's Included */}
            {(outline.length > 0 || included.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {outline.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      Key Outcomes
                    </h4>
                    <ul className="space-y-2">
                      {outline.slice(0, 5).map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {included.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                      What&apos;s Included
                    </h4>
                    <ul className="space-y-2">
                      {included.slice(0, 6).map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                      {included.length > 6 && (
                        <li className="text-xs text-muted-foreground pl-6">
                          +{included.length - 6} more included
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* AI Skills */}
            {skills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> AI Skills
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {skills.slice(0, 4).map((skill, i) => (
                    <div
                      key={i}
                      className="bg-secondary/40 rounded-lg px-3 py-2"
                    >
                      <p className="text-sm font-medium">{skill.name}</p>
                      {skill.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {skill.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ROI */}
            {hasRoi && (
              <div className="flex items-center gap-4 bg-secondary/30 rounded-lg p-4">
                <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  {sol.avgRoi && (
                    <span>
                      <span className="font-bold text-emerald-700">
                        {sol.avgRoi}% ROI
                      </span>
                    </span>
                  )}
                  {sol.roiMonths && (
                    <span className="text-muted-foreground">
                      Payback in{" "}
                      <span className="font-medium text-foreground">
                        {sol.roiMonths} months
                      </span>
                    </span>
                  )}
                  {sol.measurableOutcome && (
                    <span className="text-muted-foreground">
                      {sol.measurableOutcome}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* FAQ */}
            {faq.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  FAQ
                </h4>
                <div className="space-y-2">
                  {faq.slice(0, 3).map((item, i) => (
                    <details key={i} className="group">
                      <summary className="flex items-center justify-between cursor-pointer text-sm font-medium py-2 px-3 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                        {item.question}
                        <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="text-sm text-muted-foreground px-3 py-2">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* View full solution link */}
            <div className="pt-2">
              <Link
                href={`/solutions/${sol.slug}`}
                className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
              >
                View full solution details &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
