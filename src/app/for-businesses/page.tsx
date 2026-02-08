import Link from "next/link";
import { Search, Crown, Lightbulb, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";

export const metadata = {
  title: `For Businesses | ${BRAND_NAME}`,
  description: "Three ways to automate your business: Browse the gallery, get ideas with a Discovery Scan, or build custom.",
};

export default function ForBusinessesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="py-20 text-center px-4 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent -z-10" />
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Three ways to automate your business.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Whether you know exactly what you need or just know something is broken, we have a path for you.
        </p>
      </section>

      {/* The 3 Paths */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Path 1: The Gallery */}
          <div className="group rounded-2xl border border-white/10 bg-card p-8 hover:border-primary/50 transition-all flex flex-col relative overflow-hidden">
            <div className="mb-6 h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-2">The Gallery</h3>
            <div className="text-xs font-bold uppercase tracking-wider text-green-400 mb-4">Instant Access</div>
            <p className="text-muted-foreground mb-8 flex-grow">
              Explore ready-made automations with fixed pricing and clear deliverables. No guessing games. Best for standard workflows.
            </p>
            <div className="mt-auto">
              <Link 
                href="/solutions" 
                className="w-full py-3 rounded-lg border border-white/10 bg-secondary/50 hover:bg-secondary text-center block font-medium transition-colors"
              >
                Browse Solutions
              </Link>
            </div>
          </div>

          {/* Path 2: Discovery Scan */}
          <div className="group rounded-2xl border border-[#FF8C00]/30 bg-card p-8 hover:border-[#FF8C00] transition-all flex flex-col relative shadow-lg shadow-orange-500/5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF8C00] to-yellow-500" />
            <div className="mb-6 h-12 w-12 rounded-full bg-[#FF8C00]/10 flex items-center justify-center text-[#FF8C00]">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Discovery Scan</h3>
            <div className="text-xs font-bold uppercase tracking-wider text-[#FF8C00] mb-4">Most Popular • €50 one-time</div>
            <p className="text-muted-foreground mb-6 flex-grow">
              Not sure what to automate? Describe your business in our guided scan — specialists identify opportunities and send bids.
            </p>
            <ul className="text-sm text-muted-foreground space-y-3 mb-8">
              <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-[#FF8C00] shrink-0 mt-0.5" /> Guided business + stack intake (wizard)</li>
              <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-[#FF8C00] shrink-0 mt-0.5" /> Multiple bids with clear recommendations</li>
              <li className="flex items-start gap-2"><Zap className="w-4 h-4 text-[#FF8C00] shrink-0 mt-0.5" /> Compare options and pick what fits</li>
            </ul>
            <div className="mt-auto">
              <Link 
                href="/jobs/discovery" 
                className="w-full py-3 rounded-lg bg-[#FF8C00] hover:bg-[#E67E00] text-white text-center block font-bold transition-colors shadow-md shadow-orange-500/20"
              >
                Start Discovery Wizard
              </Link>
              <p className="text-xs text-muted-foreground text-center mt-3">Receive bids in 24–72h</p>
            </div>
          </div>

          {/* Path 3: Custom Project */}
          <div className="group rounded-2xl border border-white/10 bg-card p-8 hover:border-purple-500/50 transition-all flex flex-col relative">
            <div className="mb-6 h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Crown className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Custom Project</h3>
            <div className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-4">Most Efficient • €100 one-time</div>
            <p className="text-muted-foreground mb-6 flex-grow">
              Know the bottleneck? Submit one specific problem — Elite experts respond with tailored bids and a clear plan.
            </p>
            <ul className="text-sm text-muted-foreground space-y-3 mb-8">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Elite / Founding experts only</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Multiple bids with scope + outcome</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Includes AI/API cost estimate</li>
            </ul>
            <div className="mt-auto">
              <Link 
                href="/jobs/new" 
                className="w-full py-3 rounded-lg border border-white/10 bg-secondary/50 hover:bg-secondary text-center block font-medium transition-colors"
              >
                Post Custom Project
              </Link>
              <p className="text-xs text-muted-foreground text-center mt-3">75% refund if unresolved</p>
            </div>
          </div>

        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 bg-card border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl shadow-blue-900/10">
           <div className="bg-blue-500/10 p-6 rounded-full shrink-0 border border-blue-500/20">
              <ShieldCheck className="w-12 h-12 text-blue-400" />
           </div>
           <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-bold text-foreground">Built-In Protection</h2>
              <p className="text-lg text-muted-foreground max-w-2xl">
                 Every Expert is vetted and bound by a Mutual NDA. We enforce strict professional standards for implementation quality and punctuality, so your projects stay on track.
              </p>
           </div>
        </div>
      </section>

      {/* Trust Strip */}
      <section className="py-12 border-t border-white/10 bg-white/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground mb-6 uppercase tracking-widest font-semibold">Trusted by businesses for</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-lg font-medium text-muted-foreground">
             <span>Lead Automation</span>
             <span>Financial Reporting</span>
             <span>Customer Support</span>
             <span>Inventory Ops</span>
          </div>
        </div>
      </section>
    </div>
  );
}
