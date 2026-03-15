import Link from "next/link";
import { Crown, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export default function AddRequestPage() {
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
              Most Popular
            </div>
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">&euro;50</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">one-time posting fee</div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Stop guessing.<br />Start automating.</h2>
            <p className="text-xs text-blue-300/70 uppercase tracking-wide font-medium mt-2">Discovery Scan &middot; Up to 5 expert proposals</p>
          </div>

          <div className="flex-grow mb-8">
            <p className="text-slate-300 leading-relaxed text-sm mb-6">
              Describe how your business runs. Automation experts identify your biggest wins and send you concrete proposals — no access required, no commitment.
            </p>
            <ul className="space-y-3">
              {[
                "Find your 3 biggest time or cost leaks — identified by real experts",
                "Get 2–5 proposals with full scope, timeline, and ROI estimate",
                "Live demo before any commitment or access is granted",
                "Walk away with clarity — even if you don\u2019t proceed",
              ].map((item) => (
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
              Get My Automation Roadmap <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-slate-500 text-center mt-3">First proposals arrive within 24 hours</p>
          </div>
        </div>

        {/* Custom Project */}
        <div className="relative p-8 rounded-2xl bg-[#0F172A] border border-purple-500/20 shadow-2xl flex flex-col ring-1 ring-purple-500/10">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500/50 to-blue-500/50 rounded-t-2xl opacity-50" />
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-4 border border-purple-500/30">
              For Complex Workflows
            </div>
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                <Crown className="h-6 w-6" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">&euro;100</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">one-time posting fee</div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Describe it once.<br />Get it built right.</h2>
            <p className="text-xs text-purple-300/70 uppercase tracking-wide font-medium mt-2">Custom Project &middot; Max 3 tailored proposals</p>
          </div>

          <div className="flex-grow mb-8">
            <p className="text-slate-300 leading-relaxed text-sm mb-6">
              You know what needs to change. Post your requirement — Elite experts compete for the job with tailored proposals, not generic advice.
            </p>
            <ul className="space-y-3">
              {[
                "Your team stops doing manually what should have been automated a long time ago.",
                "The problem you describe is the exact problem that gets solved",
                "You leave with a live, working automation \u2014 not a plan or a prototype",
                "Know your total cost upfront \u2014 implementation and monthly running costs, itemised",
                "Nothing ships without your sign-off \u2014 you stay in control at every step",
                "Every proposal you receive is built for your tools and process.",
              ].map((item) => (
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
              Post My Custom Project <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-slate-500 text-center mt-3">50% refund if no proposal meets your criteria</p>
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
