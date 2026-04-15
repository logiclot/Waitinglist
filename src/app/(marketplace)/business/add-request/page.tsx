"use client";

import Link from "next/link";
import { Crown, Sparkles, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { DISCOVERY_SCAN_COPY, DISCOVERY_SCAN_BULLETS, CUSTOM_PROJECT_COPY, CUSTOM_PROJECT_BULLETS } from "@/lib/copy/requestCards";
import { useFreeCustomProjects, useFreeDiscoveryScans } from "@/hooks/use-business";

export default function AddRequestPage() {
  const freeDiscoveryScans = useFreeDiscoveryScans()
  const freeCustomProjects = useFreeCustomProjects()

  const hasFreeScans = freeDiscoveryScans?.data != null && freeDiscoveryScans.data > 0
  const hasFreeCustomProjects = freeCustomProjects.data != null && freeCustomProjects.data > 0

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold mb-2">Post a Request</h1>
        <p className="text-muted-foreground text-sm">
          Not sure which to choose?{" "}
          <Link href="/how-it-works" className="underline hover:text-foreground transition-colors">
            See how each option works.
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

        {/* Discovery Scan */}
        <div className="relative p-8 rounded-2xl bg-[#1E293B] border border-white/10 shadow-xl flex flex-col ring-1 ring-white/5">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-4 border border-blue-500/30">
              {DISCOVERY_SCAN_COPY.badge}
            </div>
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="text-right">
                {freeDiscoveryScans.isPending ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Checking price…</span>
                  </div>
                ) : hasFreeScans ? (
                  <>
                    <div className="flex items-baseline gap-2 justify-end">
                      <span className="text-lg font-bold text-slate-500 line-through">{DISCOVERY_SCAN_COPY.price}</span>
                      <span className="text-3xl font-bold text-emerald-400">FREE</span>
                    </div>
                    <div className="text-[10px] text-emerald-300/70 uppercase tracking-wide font-medium">Your first scan is free</div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-white">{DISCOVERY_SCAN_COPY.price}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{DISCOVERY_SCAN_COPY.priceNote}</div>
                  </>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{DISCOVERY_SCAN_COPY.headline.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</h2>
            <p className="text-xs text-blue-300/70 uppercase tracking-wide font-medium mt-2">{DISCOVERY_SCAN_COPY.proposalNote}</p>
          </div>

          <div className="flex-grow mb-8">
            <p className="text-slate-300 leading-relaxed text-sm mb-6">
              {DISCOVERY_SCAN_COPY.description}
            </p>
            <ul className="space-y-3">
              {DISCOVERY_SCAN_BULLETS.map((item) => (
                <li key={item} className="text-sm text-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <Link
              href="/jobs/discovery"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors shadow-lg shadow-blue-500/10"
            >
              {DISCOVERY_SCAN_COPY.cta} <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-slate-500 text-center mt-3">{DISCOVERY_SCAN_COPY.footer}</p>
          </div>
        </div>

        {/* Custom Project */}
        <div className="relative p-8 rounded-2xl bg-[#0F172A] border border-purple-500/20 shadow-2xl flex flex-col ring-1 ring-purple-500/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 to-blue-500/50 rounded-t-2xl opacity-50" />
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-4 border border-purple-500/30">
              {CUSTOM_PROJECT_COPY.badge}
            </div>
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                <Crown className="h-6 w-6" />
              </div>
              <div className="text-right">
                {freeCustomProjects.isPending ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Checking price…</span>
                  </div>
                ) : hasFreeCustomProjects ? (
                  <>
                    <div className="flex items-baseline gap-2 justify-end">
                      <span className="text-lg font-bold text-slate-500 line-through">{CUSTOM_PROJECT_COPY.price}</span>
                      <span className="text-3xl font-bold text-emerald-400">FREE</span>
                    </div>
                    <div className="text-[10px] text-emerald-300/70 uppercase tracking-wide font-medium">Your first project is free</div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-white">{CUSTOM_PROJECT_COPY.price}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{CUSTOM_PROJECT_COPY.priceNote}</div>
                  </>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{CUSTOM_PROJECT_COPY.headline.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</h2>
            <p className="text-xs text-purple-300/70 uppercase tracking-wide font-medium mt-2">{CUSTOM_PROJECT_COPY.proposalNote}</p>
          </div>

          <div className="flex-grow mb-8">
            <p className="text-slate-300 leading-relaxed text-sm mb-6">
              {CUSTOM_PROJECT_COPY.description}
            </p>
            <ul className="space-y-3">
              {CUSTOM_PROJECT_BULLETS.map((item) => (
                <li key={item} className="text-sm text-slate-200 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto pt-6 border-t border-white/10">
            <Link
              href="/jobs/new"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors shadow-lg shadow-purple-500/10"
            >
              {CUSTOM_PROJECT_COPY.cta} <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-slate-500 text-center mt-3">{CUSTOM_PROJECT_COPY.footer}</p>
          </div>
        </div>

      </div>

      {/* Decision helper */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        Not sure yet? Start with a Discovery Scan &mdash; lower commitment, higher clarity.
      </p>
    </div>
  );
}
