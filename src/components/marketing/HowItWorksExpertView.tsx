"use client";

import { Award, TrendingUp, Crown, Sparkles, ArrowRight, UserCircle2, Search, FileText, Hammer, Banknote, Zap } from "lucide-react";
import Link from "next/link";
import { useMorseCode } from "@/hooks/useMorseCode";

const ORBIT_STEPS = [
  {
    icon: <UserCircle2 className="h-4 w-4" />,
    step: "Step 1",
    title: "Build your profile",
    body: "Add your tools, stack, and past work. Clients judge by what they see here, so make it specific.",
  },
  {
    icon: <Search className="h-4 w-4" />,
    step: "Step 2",
    title: "Find your first job",
    body: "Browse open Discovery Scans and Custom Projects, or list a packaged Solution in the marketplace.",
  },
  {
    icon: <FileText className="h-4 w-4" />,
    step: "Step 3",
    title: "Submit a proposal",
    body: "Send a scoped proposal with your timeline and price. Clients award based on fit, not lowest bid.",
  },
  {
    icon: <Hammer className="h-4 w-4" />,
    step: "Step 4",
    title: "Deliver the work",
    body: "Milestone-based delivery keeps both sides aligned. Build, document, and mark the milestone complete.",
  },
  {
    icon: <Banknote className="h-4 w-4" />,
    step: "Step 5",
    title: "Get paid",
    body: "Client approves the milestone and funds release instantly. No invoices, no chasing, no delays.",
  },
];

const EARN_PATHS = [
  {
    icon: <Zap className="h-5 w-5" />,
    label: "Solutions",
    title: "Build once, sell repeatedly",
    body: "Package your expertise into a ready-to-deploy automation. One build, multiple clients, recurring income.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    label: "Discovery Scans",
    title: "Diagnose and propose",
    body: "Businesses describe their workflows and challenges. You analyse, identify the biggest wins, and submit a concrete proposal.",
  },
  {
    icon: <Crown className="h-5 w-5" />,
    label: "Custom Projects",
    title: "Win the brief, own the build",
    body: "Clients with specific requirements invite proposals. Win on quality of thinking, deliver on a milestone structure, get paid on approval.",
  },
];

export function HowItWorksExpertView() {
  const { on: morseOn } = useMorseCode();

  /* Orbit math — 5 steps around a circle */
  const size = 700;
  const cx = size / 2;
  const cy = size / 2;
  const orbitR = 250;
  const nodeR = 22;
  const hubR = 70;

  const nodePositions = ORBIT_STEPS.map((_, i) => {
    const angleDeg = i * 72 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + orbitR * Math.cos(angleRad),
      y: cy + orbitR * Math.sin(angleRad),
    };
  });

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── HERO: Expert Orbit ── */}
      <div className="mb-20">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-3 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
              Open to All Experts
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground/8 text-foreground text-xs font-bold uppercase tracking-wider border border-foreground/10">
              Get Paid on Approval
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight leading-tight">
            You sell thinking, not hours
          </h3>
          <p className="text-sm text-muted-foreground mt-3 max-w-xl mx-auto leading-relaxed">
            Productize your expertise. Build once, sell repeatedly, and get paid for the value you create.
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
              const x1 = cx + hubR * Math.cos(angle);
              const y1 = cy + hubR * Math.sin(angle);
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

          {/* Center hub — subtle light bulb effect (green accent for expert) */}
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
            <Sparkles
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
              You<br/>Get Paid
            </p>
          </div>

          {/* 5 steps positioned around the circle */}
          {ORBIT_STEPS.map((item, i) => {
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

        {/* ── Mobile: numbered card list ── */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
          {ORBIT_STEPS.map((item, i) => (
            <div key={i} className="flex gap-3 p-4 bg-background rounded-xl border border-border">
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary/8 border border-primary/15 flex items-center justify-center text-primary">
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

      {/* ── 3 Ways to Earn + Founding Expert ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">

        {/* Left: 3 earn paths */}
        <div className="lg:col-span-8">
          <div className="text-center lg:text-left mb-6">
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Three ways to earn</p>
            <h3 className="text-xl font-bold text-foreground mt-1">Pick the model that fits how you work</h3>
          </div>
          <div className="space-y-4">
            {EARN_PATHS.map(({ icon, label, title, body }) => (
              <div key={label} className="flex gap-5 p-6 rounded-2xl border border-border bg-white shadow-sm">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center text-primary">
                  {icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">{label}</p>
                  <h4 className="text-base font-bold text-foreground mb-1">{title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/onboarding/expert"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Join as an Expert <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/solutions"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-border text-foreground font-bold text-base hover:bg-secondary transition-all duration-200 hover:border-primary/30 active:scale-[0.98]"
            >
              Browse Solutions
            </Link>
          </div>
        </div>

        {/* Right: Founding Expert */}
        <div className="lg:col-span-4">
          <div className="bg-[#111827] rounded-2xl p-7 shadow-xl sticky top-24 h-full">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg flex items-center gap-2 text-white">
                <Crown className="h-5 w-5 text-primary" /> Founding Expert
              </h4>
              <span className="bg-white text-[#111827] text-xs font-bold px-2.5 py-1 rounded-full">
                Limited Spots
              </span>
            </div>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">
              Be among the first experts on the platform and lock in lifetime benefits that will never be offered again.
            </p>
            <div className="space-y-5">
              {[
                {
                  icon: <TrendingUp className="h-4 w-4" />,
                  title: "Early Mover Advantage",
                  body: "First experts on the platform build reputation and reviews before the market gets competitive.",
                },
                {
                  icon: <Sparkles className="h-4 w-4" />,
                  title: "Lowest Lifetime Fee",
                  body: "Locked at 11% permanently, well below the standard tiered structure.",
                },
                {
                  icon: <Award className="h-4 w-4" />,
                  title: "Permanent Badge",
                  body: "Exclusive Founding Expert badge that never expires.",
                },
              ].map(({ icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/8 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
                    {icon}
                  </div>
                  <div>
                    <h5 className="font-bold text-sm mb-0.5 text-white">{title}</h5>
                    <p className="text-xs text-white/50 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/onboarding/expert"
              className="mt-7 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all duration-200 hover:shadow-md active:scale-[0.98]"
            >
              Claim Your Spot <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
