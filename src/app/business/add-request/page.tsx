import Link from "next/link";
import { Compass, Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";

export default function AddRequestPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Add Request</h1>
        <p className="text-xl text-muted-foreground">
          Choose how you want to engage with experts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Discovery Scan Card */}
        <div className="group flex flex-col h-full bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all shadow-sm hover:shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
          
          <div className="mb-6">
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
              <Compass className="h-7 w-7 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Discovery Scan</h2>
            <p className="text-lg font-medium text-foreground/80 mb-4">Get expert thinking before you spend on building</p>
            <div className="text-3xl font-bold text-foreground mb-4">€50 <span className="text-sm font-normal text-muted-foreground">one-time</span></div>
            <p className="text-sm font-medium text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full mb-4">
              Best for: Early-stage clarity
            </p>
          </div>

          <div className="bg-secondary/30 rounded-xl p-6 mb-8 flex-1">
            <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-4">What you get</h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="text-foreground/90">Experts propose a clear automation approach</span>
              </li>
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="text-foreground/90">You compare ideas and pick the best</span>
              </li>
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="text-foreground/90">Perfect when you’re unsure what the right solution is</span>
              </li>
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="text-foreground/90">Live demo available on request — included at no extra cost</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
              Includes max 5 expert submissions. Qualified submissions rewarded.
            </div>
          </div>

          <Link 
            href="/jobs/discovery"
            className="w-full py-4 bg-background border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
          >
            Post Discovery Scan <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Custom Project Card */}
        <div className="group flex flex-col h-full bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all shadow-sm hover:shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
          
          <div className="mb-6">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
              <Briefcase className="h-7 w-7 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Custom Project</h2>
            <p className="text-lg font-medium text-foreground/80 mb-4">High-intent projects with fewer competing bids</p>
            <div className="text-3xl font-bold text-foreground mb-4">€100 <span className="text-sm font-normal text-muted-foreground">one-time</span></div>
            <p className="text-sm font-medium text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded-full mb-4">
              Best for: Bigger outcomes, higher confidence
            </p>
          </div>

          <div className="bg-secondary/30 rounded-xl p-6 mb-8 flex-1">
            <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground mb-4">What you get</h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-foreground/90">Stronger proposals, faster decision-making</span>
              </li>
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-foreground/90">Better fit for larger or more complex workflows</span>
              </li>
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-foreground/90">Ideal when you already know the goal</span>
              </li>
              <li className="flex gap-3 text-sm">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-foreground/90">Live demo available on request — included at no extra cost</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
              Max 3 expert bids. <span className="font-medium text-foreground">75% refund</span> if no solution selected.
            </div>
          </div>

          <Link 
            href="/jobs/new"
            className="w-full py-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20"
          >
            Post Custom Project <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
