import Link from "next/link";
import { Search, Crown, Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";

export const metadata = {
  title: `For Businesses | ${BRAND_NAME}`,
  description: "Three ways to automate your business: explore solutions, get an expert roadmap, or have something built exactly for you.",
};

export default function ForBusinessesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Hero */}
      <section className="py-20 text-center px-4 border-b border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          Three ways to automate your business.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Whether you know exactly what you need or just know something is broken, there&apos;s a path for you.
        </p>
      </section>

      {/* The 3 Paths */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Path 1: Browse Solutions */}
          <div className="relative p-8 rounded-2xl bg-white border border-gray-200 shadow-md hover:shadow-lg transition-all flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-2xl" />
            <div className="mb-6 h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-bold mb-1">Browse Solutions</h3>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-5">Ready to deploy</p>
            <p className="text-muted-foreground text-sm mb-6 flex-grow">
              Pick a proven automation, see it working live, and have it running in your tools within days.
            </p>
            <ul className="text-sm space-y-3 mb-8">
              {[
                "Watch a live demo before you commit",
                "Deployed inside your existing tools",
                "You approve the result before funds release",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              <Link
                href="/solutions"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold transition-colors"
              >
                Browse Solutions <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Path 2: Discovery Scan */}
          <div className="relative p-8 rounded-2xl bg-[#1E293B] border border-white/10 shadow-xl flex flex-col ring-1 ring-white/5">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-4 border border-blue-500/30">
                Most Popular
              </div>
              <div className="flex items-start justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">&euro;50</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">one-time posting fee</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Stop guessing.<br />Start automating.</h3>
              <p className="text-xs text-blue-300/70 uppercase tracking-wide font-medium mt-2">Discovery Scan &middot; Up to 5 expert proposals</p>
            </div>
            <p className="text-slate-300 text-sm mb-6 flex-grow">
              Describe how your business runs. Automation experts identify your biggest wins and send you concrete proposals — no access required, no commitment.
            </p>
            <ul className="text-sm space-y-3 mb-8">
              {[
                "Find your 3 biggest time or cost leaks — identified by real experts",
                "Get 2–5 proposals with full scope, timeline, and ROI estimate",
                "Live demo before any commitment or access is granted",
                "Walk away with clarity — even if you don\u2019t proceed",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6 border-t border-white/10">
              <Link
                href="/jobs/discovery"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-colors shadow-lg shadow-blue-500/10"
              >
                Get My Automation Roadmap <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-xs text-slate-500 text-center mt-3">First proposals arrive within 24 hours</p>
            </div>
          </div>

          {/* Path 3: Custom Project */}
          <div className="relative p-8 rounded-2xl bg-[#0F172A] border border-purple-500/20 shadow-2xl flex flex-col ring-1 ring-purple-500/10">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 to-blue-500/50 rounded-t-2xl opacity-50" />
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-4 border border-purple-500/30">
                For Complex Workflows
              </div>
              <div className="flex items-start justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Crown className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">&euro;100</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">one-time posting fee</div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">Describe it once.<br />Get it built right.</h3>
              <p className="text-xs text-purple-300/70 uppercase tracking-wide font-medium mt-2">Custom Project &middot; Max 3 tailored proposals</p>
            </div>
            <p className="text-slate-300 text-sm mb-6 flex-grow">
              You know what needs to change. Post your requirement — Elite experts compete for the job with tailored proposals, not generic advice.
            </p>
            <ul className="text-sm space-y-3 mb-8">
              {[
                "Your team stops doing manually what should have been automated a long time ago.",
                "The problem you describe is the exact problem that gets solved",
                "You leave with a live, working automation \u2014 not a plan or a prototype",
                "Nothing ships without your sign-off \u2014 you stay in control at every step",
                "Every proposal you receive is built for your tools and process.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-6 border-t border-white/10">
              <Link
                href="/jobs/new"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-colors shadow-lg shadow-purple-500/10"
              >
                Post My Custom Project <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-xs text-slate-500 text-center mt-3">75% refund if no proposal meets your criteria</p>
            </div>
          </div>

        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-8 bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm">
          <div className="bg-emerald-500/10 p-6 rounded-full shrink-0 border border-emerald-500/20">
            <ShieldCheck className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl font-bold text-foreground">Your money is protected at every step</h2>
            <p className="text-base text-muted-foreground max-w-2xl">
              Every expert is vetted and bound by a Mutual NDA. Funds are held in escrow and released only after you approve. If no proposal fits, 75% of your posting fee comes back.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
