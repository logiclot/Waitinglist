"use client";

import { CheckCircle2, RefreshCw, Lock, Award, TrendingUp, Crown, Sparkles, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function HowItWorks() {
  const [view, setView] = useState<"business" | "expert">("business");

  return (
    <section className="py-24 bg-[#FBFAF8]" id="how-it-works">
      <div className="container mx-auto px-4">
        
        {/* Header & Toggle */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tight text-foreground">
            How {view === "business" ? "LogicLot" : "it"} works
          </h2>
          
          <div className="inline-flex bg-secondary p-1 rounded-full border border-border relative">
            <button
              onClick={() => setView("business")}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                view === "business" 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              I&apos;m a Business Owner
            </button>
            <button
              onClick={() => setView("expert")}
              className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 ${
                view === "expert" 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              I&apos;m an Expert
            </button>
          </div>
        </div>

        {/* BUSINESS VIEW */}
        {view === "business" && (
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Promise */}
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h3 className="text-2xl font-medium text-foreground mb-4">
                You never need to explain tech. We translate it for you.
              </h3>
              <p className="text-muted-foreground">
                We bridge the gap between your business goals and complex automation architecture.
              </p>
            </div>

            {/* 3 Steps - Crescendo Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 items-start">
              
              {/* Step 1: Browse Gallery (Tier 1 - Light) */}
              <div className="relative p-6 rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all group flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-2xl" />
                
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-bold text-muted-foreground mb-4">
                    Tier 1
                  </div>
                  <div className="flex items-center justify-between mb-4">
                     <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Search className="h-6 w-6" />
                     </div>
                  </div>
                  <h4 className="text-2xl font-bold text-foreground mb-2">Browse Gallery</h4>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Ready-made · Fixed price
                  </p>
                </div>

                <div className="flex-grow mb-8">
                  <p className="text-muted-foreground leading-relaxed text-sm mb-6">
                    Explore ready-made automations with fixed pricing and clear deliverables. No guessing games.
                  </p>
                  <ul className="space-y-3">
                    <li className="text-sm text-foreground flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      Instant deployment
                    </li>
                    <li className="text-sm text-foreground flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      Vetted implementation
                    </li>
                    <li className="text-sm text-foreground flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      Fixed one-time price
                    </li>
                  </ul>
                </div>

                <div className="mt-auto pt-6 border-t border-border">
                  <Link 
                    href="/solutions" 
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white text-sm font-bold transition-colors"
                  >
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="text-xs text-muted-foreground text-center mt-3">No posting fee</p>
                </div>
              </div>

              {/* Step 2: Discovery Scan (Tier 2 - Dark) */}
              <div className="relative p-8 rounded-2xl bg-[#1E293B] border border-white/10 shadow-xl transition-all group flex flex-col ring-1 ring-white/5">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-4 border border-blue-500/30">
                    Tier 2 · Most Popular
                  </div>
                  <div className="flex items-start justify-between mb-2">
                     <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                        <Sparkles className="h-6 w-6" />
                     </div>
                     <div className="text-right">
                        <div className="text-3xl font-bold text-white">€50</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">One-time posting fee</div>
                     </div>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">Discovery Scan</h4>
                </div>

                <div className="flex-grow mb-8">
                  <p className="text-slate-300 leading-relaxed text-sm mb-6">
                    Not sure what to automate? Describe your business in our guided scan — specialists identify opportunities.
                  </p>
                  <ul className="space-y-3">
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      Guided business + stack intake
                    </li>
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      Experts identify opportunities
                    </li>
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      Multiple bids with recommendations
                    </li>
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      Compare by ROI & effort
                    </li>
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      Clear scope + timeline per bid
                    </li>
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                      No obligation to hire
                    </li>
                  </ul>
                </div>

                <div className="mt-auto pt-6 border-t border-white/10">
                  <Link 
                    href="/jobs/discovery" 
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors shadow-lg shadow-blue-500/10"
                  >
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="text-xs text-slate-500 text-center mt-3">First qualified bid &lt; 24h • up to 5 bids in 72h</p>
                </div>
              </div>

              {/* Step 3: Custom Project (Tier 3 - Premium Dark) */}
              <div className="relative p-8 rounded-2xl bg-[#0F172A] border border-purple-500/20 shadow-2xl transition-all group flex flex-col ring-1 ring-purple-500/10">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 to-blue-500/50 rounded-t-2xl opacity-50" />
                
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-4 border border-purple-500/30">
                    Tier 3 · For Complex Workflows
                  </div>
                  <div className="flex items-start justify-between mb-2">
                     <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                        <Crown className="h-6 w-6" />
                     </div>
                     <div className="text-right">
                        <div className="text-3xl font-bold text-white">€100</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">One-time posting fee</div>
                     </div>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">Custom Project</h4>
                </div>

                <div className="flex-grow mb-8">
                  <p className="text-slate-300 leading-relaxed text-sm mb-6">
                    Know the bottleneck? Submit one specific problem — Elite experts respond with tailored bids and a clear plan.
                  </p>
                  <ul className="space-y-3">
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      For one specific problem
                    </li>
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      Elite / Founding experts only
                    </li>
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      Multiple tailored bids
                    </li>
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      Includes scope + deliverables
                    </li>
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      Detailed implementation plan
                    </li>
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      AI/API cost estimates included
                    </li>
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      Custom pricing by expert
                    </li>
                    <li className="text-sm text-slate-200 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                      Direct pre-hire Q&A
                    </li>
                  </ul>
                </div>

                <div className="mt-auto pt-6 border-t border-white/10">
                  <Link 
                    href="/jobs/new" 
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors shadow-lg shadow-purple-500/10"
                  >
                    Get started <ArrowRight className="h-4 w-4" />
                  </Link>
                  <p className="text-xs text-slate-500 text-center mt-3">75% refund if unresolved</p>
                </div>
              </div>
            </div>

            {/* Protection Block (Trust Strip) */}
            <div className="bg-white border border-border rounded-2xl p-8 md:p-12 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
              <h3 className="text-2xl font-bold mb-10 text-center md:text-left text-foreground">
                Your money stays protected at every step
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-2 text-foreground">Escrow protection</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Funds are locked and cannot be accessed until delivery is approved.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-2 text-foreground">Buyer approval required</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      You decide when the solution is complete — not the expert.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-2 text-foreground">75% refund on posting fee</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Discovery/Custom posting fee is 75% refundable if no acceptable proposal after the revision loop.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link
                href="/solutions"
                className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Browse Solutions
              </Link>
            </div>
          </div>
        )}

        {/* EXPERT VIEW */}
        {view === "expert" && (
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Promise */}
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h3 className="text-2xl font-medium text-foreground mb-4">
                You sell thinking, not hours.
              </h3>
              <p className="text-muted-foreground">
                Productize your expertise. Build once, sell repeatedly, and get paid for the value you create.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column: Accreditation Process (8/12) */}
              <div className="lg:col-span-8 flex flex-col gap-12">
                
                {/* Accreditation Steps */}
                <div>
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-2 text-foreground">
                    Accreditation Process
                  </h3>
                  <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex gap-6 p-6 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors shadow-sm">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                        01
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2 text-foreground">Identity Verification</h4>
                        <p className="text-muted-foreground">
                          We verify your professional identity to ensure trust. No anonymous sellers.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-6 p-6 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors shadow-sm">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-100">
                        02
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2 text-foreground">Stack Validation</h4>
                        <p className="text-muted-foreground">
                          Demonstrate proficiency in your core tools (Make, n8n, Python, etc.) via portfolio review.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-6 p-6 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors shadow-sm">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                        03
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-2 text-foreground">Architecture Challenge</h4>
                        <p className="text-muted-foreground">
                          Solve a sample business automation problem to prove your architectural thinking.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/for-experts"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-md bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                  >
                    Apply for Accreditation
                  </Link>
                </div>

                {/* Founder Note for Experts */}
                <div className="mt-8 p-8 bg-white border border-border rounded-xl flex flex-col md:flex-row items-center gap-6 shadow-sm">
                   <div className="shrink-0">
                      <div className="w-20 h-20 rounded-full overflow-hidden border border-border relative">
                         <Image 
                           src="/founder.png" 
                           alt="Claudiu" 
                           width={80} 
                           height={80} 
                           className="object-cover"
                         />
                      </div>
                   </div>
                   <div className="text-center md:text-left">
                      <h4 className="font-bold text-lg mb-2 text-foreground">Built for Builders</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                         &quot;I built LogicLot to verify real expertise. If you ship actual code and workflows, you&apos;ll thrive here. No fluff, just delivery.&quot;
                      </p>
                      <p className="text-xs font-bold text-foreground">— Claudiu, Founder</p>
                   </div>
                </div>
              </div>

              {/* Right Column: Founding Expert Tier (4/12) */}
              <div className="lg:col-span-4">
                <div className="bg-card border border-border rounded-xl p-8 shadow-sm sticky top-24">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-xl flex items-center gap-2 text-foreground">
                      <Crown className="h-5 w-5 text-primary" /> Founding Expert
                    </h4>
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded border border-primary/20">
                      Limited Spots
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                    Join the first cohort of accredited experts and lock in lifetime benefits.
                  </p>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm mb-1 text-foreground">Visibility Boost</h5>
                        <p className="text-xs text-muted-foreground">Featured placement in search results and category pages.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm mb-1 text-foreground">Lowest Lifetime Fees</h5>
                        <p className="text-xs text-muted-foreground">Maximize your earnings with a permanently locked 11% commission rate, significantly lower than our standard 12–15% tiered structure.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm mb-1 text-foreground">Permanent Badge</h5>
                        <p className="text-xs text-muted-foreground">Exclusive &quot;Founding Expert&quot; profile badge that never expires.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
