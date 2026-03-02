"use client";

import { CheckCircle2, Lock, Crown, Sparkles, Search, ArrowRight, Zap, Eye, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useMorseCode } from "@/hooks/useMorseCode";

const ESCROW_STEPS = [
  {
    icon: <Lock className="h-4 w-4" />,
    step: "Step 1",
    title: "You fund the milestone",
    body: "Before any work begins, you pay via Stripe. Funds are held in escrow by LogicLot and the expert cannot access them.",
  },
  {
    icon: <Zap className="h-4 w-4" />,
    step: "Step 2",
    title: "Expert starts work",
    body: "The expert sees funds are secured and begins delivery. Your money stays locked until you decide to release it.",
  },
  {
    icon: <Eye className="h-4 w-4" />,
    step: "Step 3",
    title: "You review the delivery",
    body: "The expert marks work as delivered. You inspect it and only your explicit approval can release funds. Not satisfied? Don't approve.",
  },
  {
    icon: <ShieldCheck className="h-4 w-4" />,
    step: "Step 4",
    title: "Dispute? LogicLot rules",
    body: "Raise a dispute and our team reviews all messages, scope, and deliverables. We rule within 10 days, binding on both sides.",
  },
  {
    icon: <CheckCircle2 className="h-4 w-4" />,
    step: "Step 5",
    title: "You approve, funds release",
    body: "Happy with the result? Approve the milestone. Funds transfer to the expert minus the platform fee. Repeat for the next milestone.",
  },
];

export function HowItWorksBusinessView() {
  const { on: morseOn } = useMorseCode();

  /* Orbit math — 5 steps around a circle */
  const size = 700;
  const cx = size / 2;
  const cy = size / 2;
  const orbitR = 250;
  const nodeR = 22;       // radius of each step's icon circle
  const hubR = 70;        // radius of center hub

  const nodePositions = ESCROW_STEPS.map((_, i) => {
    const angleDeg = i * 72 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + orbitR * Math.cos(angleRad),
      y: cy + orbitR * Math.sin(angleRad),
    };
  });

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── HERO: Protection Scheme ── */}
      <div className="mb-20">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/8 text-foreground text-xs font-bold uppercase tracking-wider border border-foreground/10">
              <ShieldCheck className="h-3.5 w-3.5" /> Zero-Risk Guarantee
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/8 text-foreground text-xs font-bold uppercase tracking-wider border border-foreground/10">
              0% Platform Fee for Businesses
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight">
            Your money stays protected at every step
          </h3>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Every euro is locked before an expert starts work and only moves when you say so. You keep 100% of your budget.
          </p>
        </div>

        {/* ── Desktop: circular orbit ── */}
        <div className="hidden lg:block relative mx-auto" style={{ width: size, height: size }}>

          {/* SVG layer — orbit ring + spoke lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Orbit circle */}
            <circle
              cx={cx}
              cy={cy}
              r={orbitR}
              stroke="#E5E7EB"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              fill="none"
            />

            {/* Spoke lines — from hub edge to node edge */}
            {nodePositions.map((pos, i) => {
              const angle = Math.atan2(pos.y - cy, pos.x - cx);
              // Start from hub edge
              const x1 = cx + hubR * Math.cos(angle);
              const y1 = cy + hubR * Math.sin(angle);
              // End at node edge
              const x2 = pos.x - nodeR * Math.cos(angle);
              const y2 = pos.y - nodeR * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#D1D5DB"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Animated dots traveling along spokes */}
            {nodePositions.map((pos, i) => {
              const angle = Math.atan2(pos.y - cy, pos.x - cx);
              const x1 = cx + hubR * Math.cos(angle);
              const y1 = cy + hubR * Math.sin(angle);
              const x2 = pos.x - nodeR * Math.cos(angle);
              const y2 = pos.y - nodeR * Math.sin(angle);
              return (
                <circle key={`dot-${i}`} r="3" fill="#8DC63F" opacity="0.8">
                  <animate
                    attributeName="cx"
                    values={`${x1};${x2};${x1}`}
                    dur={`${3 + i * 0.5}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cy"
                    values={`${y1};${y2};${y1}`}
                    dur={`${3 + i * 0.5}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;0.8;0.8;0"
                    dur={`${3 + i * 0.5}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              );
            })}
          </svg>

          {/* Center hub — subtle light bulb effect */}
          <div
            className="absolute flex flex-col items-center justify-center text-center rounded-full bg-white"
            style={{
              width: hubR * 2,
              height: hubR * 2,
              left: cx - hubR,
              top: cy - hubR,
              border: "2px solid #E5E7EB",
              boxShadow: morseOn
                ? "0 0 14px 3px rgba(141, 198, 63, 0.18), 0 0 28px 6px rgba(141, 198, 63, 0.06)"
                : "0 4px 16px rgba(0, 0, 0, 0.06)",
              transition: "box-shadow 120ms ease",
            }}
          >
            <ShieldCheck
              className="h-8 w-8 mb-1"
              style={{
                color: morseOn ? "#8DC63F" : "#111827",
                filter: morseOn
                  ? "drop-shadow(0 0 3px rgba(141,198,63,0.3))"
                  : "none",
                transition: "color 120ms ease, filter 120ms ease",
              }}
            />
            <p
              className="text-sm font-bold leading-tight px-2"
              style={{
                color: "#111827",
              }}
            >
              Fully<br/>Secured
            </p>
          </div>

          {/* 5 steps positioned around the circle */}
          {ESCROW_STEPS.map((item, i) => {
            const pos = nodePositions[i];
            const cardW = 160;
            return (
              <div
                key={i}
                className="absolute text-center"
                style={{ width: cardW, left: pos.x - cardW / 2, top: pos.y - 60 }}
              >
                <div
                  className="w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-2 text-foreground"
                  style={{ border: "2px solid #E5E7EB" }}
                >
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold text-[#8DC63F] uppercase tracking-wider">{item.step}</span>
                <h4 className="font-bold text-sm mt-1 text-foreground leading-snug">{item.title}</h4>
                <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{item.body}</p>
              </div>
            );
          })}
        </div>

        {/* ── Mobile / tablet: numbered card list ── */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
          {ESCROW_STEPS.map((item, i) => (
            <div key={i} className="flex gap-3 p-4 bg-background rounded-xl border border-border">
              <div className="shrink-0 w-9 h-9 rounded-full bg-foreground/8 border border-foreground/10 flex items-center justify-center text-foreground">
                {item.icon}
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{item.step}</span>
                <h4 className="font-bold text-sm text-foreground leading-snug">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Not sure which path? — compact analogy block */}
      <div className="mb-14">
        <div className="text-center mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Not sure which path to take?</p>
          <h3 className="text-lg font-bold text-foreground mt-2">Discovery Scan vs. Custom Project</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-border shadow-sm">
            <div className="text-primary font-bold mb-3 flex items-center gap-2 bg-primary/8 px-3 py-1 rounded-full text-sm">
              <Sparkles className="h-4 w-4" /> Discovery Scan
            </div>
            <p className="text-foreground font-semibold mb-2">&ldquo;Like a Strategy Session&rdquo;</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You sense there&rsquo;s a better way to run things, but you&rsquo;re not sure where to start. Experts map your processes and come back with a clear, ranked plan.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-border shadow-sm">
            <div className="text-primary font-bold mb-3 flex items-center gap-2 bg-primary/8 px-3 py-1 rounded-full text-sm">
              <Crown className="h-4 w-4" /> Custom Project
            </div>
            <p className="text-foreground font-semibold mb-2">&ldquo;Like Hiring a Specialist&rdquo;</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You know exactly what you want built. Experts submit scoped proposals with a clear timeline and price. You pick the one that fits.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Tier Cards — same size */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 items-stretch">
        {/* Tier 1 — Browse Solutions */}
        <div className="relative p-8 rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-all flex flex-col min-h-[420px]">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-bold text-muted-foreground mb-4">
              Tier 1
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/8 text-primary rounded-xl">
                <Search className="h-6 w-6" />
              </div>
            </div>
            <h4 className="text-2xl font-bold text-foreground mb-2">Browse Solutions</h4>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Ready to deploy</p>
          </div>
          <div className="flex-grow mb-8">
            <p className="text-muted-foreground leading-relaxed text-sm mb-6">
              Pick a proven automation, see it working live, and have it running in your tools within days.
            </p>
            <ul className="space-y-3">
              <li className="text-sm text-foreground flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Watch a live demo before you commit
              </li>
              <li className="text-sm text-foreground flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> Deployed inside your existing tools
              </li>
              <li className="text-sm text-foreground flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> You approve the result before funds release
              </li>
            </ul>
          </div>
          <div className="mt-auto pt-6 border-t border-border">
            <Link
              href="/solutions"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white text-sm font-bold transition-all duration-200 hover:shadow-md active:scale-[0.98]"
            >
              Browse solutions <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Tier 2 — Discovery Scan */}
        <div className="relative p-8 rounded-2xl bg-[#111827] border border-white/8 shadow-xl flex flex-col min-h-[420px]">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-bold mb-4 border border-white/10">
              Most Popular
            </div>
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-white/8 text-white/80 rounded-xl border border-white/10">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">&euro;50</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">one-time posting fee</div>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-white mb-1">Discovery Scan</h4>
            <p className="text-xs text-white/40 uppercase tracking-wide font-medium mt-2">Up to 5 expert proposals</p>
          </div>
          <div className="flex-grow mb-8">
            <p className="text-white/60 leading-relaxed text-sm mb-6">
              Tell us how your business runs. Experts analyse your workflows and come back with a concrete plan to save you time and money.
            </p>
            <ul className="space-y-3">
              {[
                "Know exactly where you\u2019re bleeding hours and what to fix first",
                "Get a clear ROI estimate before spending a cent on implementation",
                "See a live demo of the proposed solution before you commit",
                "Walk away with an actionable roadmap, even if you don\u2019t proceed",
              ].map((item) => (
                <li key={item} className="text-sm text-white/80 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-white/40 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto pt-6 border-t border-white/10">
            <Link
              href="/jobs/discovery"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
            >
              Get My Automation Roadmap <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-white/30 text-center mt-3">First proposals arrive within 24 hours</p>
          </div>
        </div>

        {/* Tier 3 — Custom Project */}
        <div className="relative p-8 rounded-2xl bg-[#111827] border border-white/8 shadow-xl flex flex-col min-h-[420px]">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/60 rounded-t-2xl" />
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-bold mb-4 border border-white/10">
              For Complex Workflows
            </div>
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-white/8 text-white/80 rounded-xl border border-white/10">
                <Crown className="h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">&euro;100</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">one-time posting fee</div>
              </div>
            </div>
            <h4 className="text-2xl font-bold text-white mb-1">Custom Project</h4>
            <p className="text-xs text-white/40 uppercase tracking-wide font-medium mt-2">Max 3 tailored proposals</p>
          </div>
          <div className="flex-grow mb-8">
            <p className="text-white/60 leading-relaxed text-sm mb-6">
              You know what needs to be built. Post your brief and vetted experts compete with proposals scoped to your exact tools and process.
            </p>
            <ul className="space-y-3">
              {[
                "Your team stops doing repetitive work that should have been automated years ago",
                "You get a live, working automation, not a plan or a prototype",
                "Full cost transparency upfront: build cost and monthly running costs, itemised",
                "Every proposal is tailored to your stack, not a generic template",
                "Nothing goes live without your sign-off at every milestone",
              ].map((item) => (
                <li key={item} className="text-sm text-white/80 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-white/40 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto pt-6 border-t border-white/10">
            <Link
              href="/jobs/new"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
            >
              Post My Custom Project <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-white/30 text-center mt-3">75% refund if no proposal meets your criteria</p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/solutions"
          className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.98]"
        >
          Browse Solutions
        </Link>
      </div>
    </div>
  );
}
