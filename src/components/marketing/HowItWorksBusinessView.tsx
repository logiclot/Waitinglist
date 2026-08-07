"use client";

import { CheckCircle2, Lock, Crown, Sparkles, Search, ArrowRight, Zap, Eye, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useMorseCode } from "@/hooks/useMorseCode";
import { DISCOVERY_SCAN_COPY, DISCOVERY_SCAN_BULLETS, CUSTOM_PROJECT_COPY, CUSTOM_PROJECT_BULLETS } from "@/lib/copy/requestCards";

const ESCROW_STEPS = [
  {
    icon: <Lock className="size-5" />,
    step: "Step 1",
    title: "You fund the milestone",
    body: "Pay via Stripe. Funds are safely held in LogicLot escrow.",
  },
  {
    icon: <Zap className="size-5" />,
    step: "Step 2",
    title: "Expert starts work",
    body: "The expert begins work while your payment stays locked.",
  },
  {
    icon: <Eye className="size-5" />,
    step: "Step 3",
    title: "You review the delivery",
    body: "Inspect the work. Payment is released only with your approval.",
  },
  {
    icon: <ShieldCheck className="size-5" />,
    step: "Step 4",
    title: "Dispute? LogicLot rules",
    body: "Our team reviews the case and issues a binding decision within 10 days.",
  },
  {
    icon: <CheckCircle2 className="size-5" />,
    step: "Step 5",
    title: "You approve, funds release",
    body: "Approve to transfer funds (minus platform fee) and start the next milestone.",
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
        <div className="text-center relative">
          <span className="text-[70px] font-extrabold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-t from-25% from-transparent to-ash-400 flex justify-center absolute -top-[50px] inset-x-0 md:text-[100px] md:-top-[75px]">business</span>
          <h3 className="max-w-xl text-2xl text-ash-800 text-balance font-noto font-semibold tracking-tight mx-auto md:text-4xl">
            Your money stays protected at every step
          </h3>
          <p className="max-w-xl text-balance mx-auto mt-2 md:text-lg md:mt-4">
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
            className="bg-ash-900 absolute flex flex-col items-center justify-center text-center rounded-full"
            style={{
              width: hubR * 2,
              height: hubR * 2,
              left: cx - hubR,
              top: cy - hubR,
              boxShadow: morseOn
                ? "0 0 14px 3px rgba(141, 198, 63, 0.18), 0 0 28px 6px rgba(141, 198, 63, 0.06)"
                : "0 4px 16px rgba(0, 0, 0, 0.06)",
              transition: "box-shadow 120ms ease",
            }}
          >
            <ShieldCheck
              className="h-8 w-8 mb-1"
              style={{
                color: morseOn ? "#ffffff" : "#ffffff",
                filter: morseOn
                  ? "drop-shadow(0 0 3px rgba(141,198,63,0.3))"
                  : "none",
                transition: "color 120ms ease, filter 120ms ease",
              }}
            />
            <p
              className="text-sm font-bold leading-tight px-2"
              style={{
                color: "#ffffff",
              }}
            >
              Fully<br/>Secured
            </p>
          </div>

          {/* 5 steps positioned around the circle */}
          {ESCROW_STEPS.map((item, i) => {
            const pos = nodePositions[i];
            const cardW = 200;
            return (
              <div
                key={i}
                className="absolute text-center"
                style={{ width: cardW, left: pos.x - cardW / 2, top: pos.y - 60 }}
              >
                <div
                  className="size-11 bg-white flex items-center justify-center mx-auto mb-2 border border-ash-300 shadow-2xl shadow-ash-200 ring-[3px] ring-ash-100 rounded-full"
                >
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold text-[#8DC63F] uppercase tracking-wider">{item.step}</span>
                <h4 className="text-ash-800 font-noto font-semibold tracking-tight">{item.title}</h4>
                <p className="text-sm text-ash-500 mt-1">{item.body}</p>
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
                <span className="text-xs text-lime-500 font-semibold uppercase tracking-wider">{item.step}</span>
                <h4 className="font-bold text-sm text-foreground leading-snug">{item.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Not sure which path? — compact analogy block */}
      <div className="hidden mb-14">
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
            <p className="text-foreground font-semibold mb-2">&ldquo;Like Hiring an Expert&rdquo;</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You know exactly what you want built. Experts submit scoped proposals with a clear timeline and price. You pick the one that fits.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Tier Cards — same size */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Tier 1 — Browse Solutions */}
        <div className="bg-white relative border border-ash-300 shadow-2xl shadow-ash-200 rounded-3xl group overflow-hidden p-6 z-10 md:p-8 flex flex-col min-h-[420px]">
          <Search className="size-60 text-ash-100 absolute -top-20 -right-20 stroke-[0.25] -rotate-45 transition-[color] -z-10 group-hover:text-ash-200" />
          <div className="">
            <div className="text-sm font-semibold bg-ash-200 inline-flex mb-4 py-1.5 px-3 r rounded-md">
              Tier 1
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="size-11 bg-ash-100 flex items-center justify-center border border-ash-300 ring-[3px] ring-ash-100 rounded-xl">
                <Search className="size-5" />
              </div>
            </div>
            <p className="text-xs text-ash-500 font-medium uppercase tracking-widest">Ready to deploy</p>
            <h4 className="text-3xl text-ash-800 font-noto font-semibold tracking-tight mt-2">Browse Solutions</h4>
          </div>
          <div className="flex-grow mb-8">
            <p className="text-ash-500 mt-2">
              Pick a proven automation, see it working live, and have it running in your tools within days.
            </p>
            <ul className="space-y-2 mt-6">
              <li className="text-sm flex items-start gap-2">
                <svg className="size-5 text-emerald-600 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                Watch a live demo before you commit
              </li>
              <li className="text-sm flex items-start gap-2">
                <svg className="size-5 text-emerald-600 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                Deployed inside your existing tools
              </li>
              <li className="text-sm flex items-start gap-2">
                <svg className="size-5 text-emerald-600 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                You approve the result before funds release
              </li>
            </ul>
          </div>
          <div className="mt-auto">
            <Link
              href="/solutions"
              className="text-white font-semibold font-noto tracking-tight bg-ash-900 py-3 px-6 rounded-xl transition-colors flex flex-1 items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ash-800"
            >
              Browse solutions
            </Link>
            <p className="text-sm text-ash-500 text-center mt-2">Explore our full library of solutions</p>
          </div>
        </div>

        {/* Tier 2 — Discovery Scan */}
        <div className="bg-ash-900 relative shadow-2xl shadow-ash-200 rounded-3xl group overflow-hidden p-6 z-10 md:p-8 flex flex-col min-h-[420px]">
          <Sparkles className="size-60 text-ash-800 absolute -top-20 -right-20 stroke-[0.25] -rotate-45 transition-[color] -z-10 group-hover:text-ash-700" />
          <div className="">
            <div className="text-sm text-lime-950 font-semibold bg-lime-500 inline-flex mb-4 py-1.5 px-3 rounded-md">
              {DISCOVERY_SCAN_COPY.badge}
            </div>
            <div className="flex items-start justify-between mb-3">
              <div className="size-11 text-ash-400 bg-ash-800 flex items-center justify-center border border-ash-700 ring-[3px] ring-ash-800/50 rounded-xl">
                <Sparkles className="size-5" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-noto font-bold text-white">{DISCOVERY_SCAN_COPY.price}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">{DISCOVERY_SCAN_COPY.priceNote}</div>
              </div>
            </div>
            <p className="text-xs text-ash-500 font-medium uppercase tracking-widest">{DISCOVERY_SCAN_COPY.proposalNote.replace("Discovery Scan · ", "")}</p>
            <h4 className="text-3xl text-ash-50 font-noto font-semibold tracking-tight mt-2">Discovery Scan</h4>
          </div>
          <div className="flex-grow mb-8">
            <p className="text-ash-400 mt-2">
              {DISCOVERY_SCAN_COPY.description}
            </p>
            <ul className="space-y-2 mt-6">
              {DISCOVERY_SCAN_BULLETS.map((item) => (
                <li key={item} className="text-sm text-ash-300 flex items-start gap-2">
                  <svg className="size-5 text-emerald-600 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto">
            <Link
              href="/jobs/discovery"
              className="text-ash-800 font-semibold font-noto tracking-tight bg-white py-3 px-6 rounded-xl transition-[colors,background] flex flex-1 items-center justify-center cursor-pointer hover:bg-ash-100"
            >
              {DISCOVERY_SCAN_COPY.cta}
            </Link>
            <p className="text-sm text-ash-500 text-center mt-2">{DISCOVERY_SCAN_COPY.footer}</p>
          </div>
        </div>

        {/* Tier 3 — Custom Project */}
        <div className="bg-ash-900 relative shadow-2xl shadow-ash-200 rounded-3xl group overflow-hidden p-6 z-10 md:p-8 flex flex-col min-h-[420px]">
          <Crown className="size-60 text-ash-800 absolute -top-20 -right-20 stroke-[0.25] -rotate-45 transition-[color] -z-10 group-hover:text-ash-700" />
          <div className="">
            <div className="text-sm text-lime-950 font-semibold bg-lime-500 inline-flex mb-4 py-1.5 px-3 rounded-md">
              {CUSTOM_PROJECT_COPY.badge}
            </div>
            <div className="flex items-start justify-between mb-3">
              <div className="size-11 text-ash-400 bg-ash-800 flex items-center justify-center border border-ash-700 ring-[3px] ring-ash-800/50 rounded-xl">
                <Crown className="size-5" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-noto font-bold text-white">{CUSTOM_PROJECT_COPY.price}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">{CUSTOM_PROJECT_COPY.priceNote}</div>
              </div>
            </div>
            <p className="text-xs text-ash-500 font-medium uppercase tracking-widest">{CUSTOM_PROJECT_COPY.proposalNote.replace("Custom Project · ", "")}</p>
            <h4 className="text-3xl text-ash-50 font-noto font-semibold tracking-tight mt-2">Custom Project</h4>
          </div>
          <div className="flex-grow mb-8">
            <p className="text-ash-400 mt-2">
              {CUSTOM_PROJECT_COPY.description}
            </p>
            <ul className="space-y-2 mt-6">
              {CUSTOM_PROJECT_BULLETS.map((item) => (
                <li key={item} className="text-sm text-ash-300 flex items-start gap-2">
                  <svg className="size-5 text-emerald-600 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-auto">
            <Link
              href="/jobs/new"
              className="text-ash-800 font-semibold font-noto tracking-tight bg-white py-3 px-6 rounded-xl transition-[colors,background] flex flex-1 items-center justify-center cursor-pointer hover:bg-ash-100"
            >
              {CUSTOM_PROJECT_COPY.cta}
            </Link>
            <p className="text-sm text-ash-500 text-center mt-2">{CUSTOM_PROJECT_COPY.footer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
