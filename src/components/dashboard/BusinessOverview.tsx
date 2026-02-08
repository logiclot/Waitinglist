"use client";

import Link from "next/link";
import { Zap, CheckCircle2, Search, Clock } from "lucide-react";

export function BusinessOverview() {
  const hasActiveWork = false; // Mock state

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      
      {/* 🔝 Top section: Welcome + intent */}
      <section className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground tracking-tight">
            Let’s automate your business without technical headaches.
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Tell us what you need or pick a ready-made solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/business/solutions" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Browse Solutions
            </Link>
            <Link 
              href="/business/add-request" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-border bg-background hover:bg-secondary transition-colors font-medium"
            >
              Request Custom Automation
            </Link>
          </div>
        </div>
        <div className="hidden md:block">
           {/* Abstract visual or illustration placeholder */}
           <div className="w-48 h-48 bg-secondary/30 rounded-full flex items-center justify-center border border-border/50">
              <Zap className="w-20 h-20 text-primary/20" />
           </div>
        </div>
      </section>

      {/* 🧠 Middle section: “Recommended for you” */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold">Recommended for you</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Link href="/business/solutions" className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded">Fast Deploy</span>
            </div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Lead Qualification & Sync</h3>
            <p className="text-sm text-muted-foreground mb-4">Auto-score leads from Typeform and sync to HubSpot instantly.</p>
            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-sm">
              <span className="font-bold">$2,500</span>
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> 5 days</span>
            </div>
          </Link>

          {/* Card 2 */}
          <Link href="/business/solutions" className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase font-bold bg-blue-500/10 text-blue-500 px-2 py-1 rounded">Popular</span>
            </div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">AI Invoice Processing</h3>
            <p className="text-sm text-muted-foreground mb-4">Extract data from PDF invoices and push to Xero/Quickbooks.</p>
            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-sm">
              <span className="font-bold">$3,200</span>
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> 7 days</span>
            </div>
          </Link>

          {/* Card 3 */}
          <Link href="/business/solutions" className="block bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors group cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] uppercase font-bold bg-purple-500/10 text-purple-500 px-2 py-1 rounded">No Code</span>
            </div>
            <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Customer Support Triaging</h3>
            <p className="text-sm text-muted-foreground mb-4">Route tickets to the right agent based on sentiment analysis.</p>
            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-sm">
              <span className="font-bold">$1,800</span>
              <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> 3 days</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 📦 Next section: “How it works” (mini) OR “Your current work” */}
      {hasActiveWork ? (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <h2 className="text-xl font-bold">Your current work</h2>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
             <p className="text-muted-foreground">No active projects yet.</p>
          </div>
        </section>
      ) : (
        <section className="bg-secondary/20 rounded-2xl p-8 border border-border">
          <div className="flex items-center gap-2 mb-8">
            <Search className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">How it works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <h3 className="font-bold mb-1">Choose or request</h3>
                <p className="text-sm text-muted-foreground">Browse vetted solutions or describe your unique problem.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <h3 className="font-bold mb-1">Expert builds & deploys</h3>
                <p className="text-sm text-muted-foreground">Vetted experts implement the automation in your own tools.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <h3 className="font-bold mb-1">You review & go live</h3>
                <p className="text-sm text-muted-foreground">Approve the work before funds are released. No lock-in.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
