"use client";

import Link from "next/link";
import { 
  Zap, 
  Search, 
  ArrowRight, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Briefcase,
  DollarSign
} from "lucide-react";

export function ExpertOverview() {
  // Mock State
  const isFirstTime = false;
  
  if (isFirstTime) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-bold">Welcome to the Expert Network</h1>
        <p className="text-xl text-muted-foreground">Get started in 3 steps to unlock your first earnings.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 font-bold">1</div>
            <h3 className="font-bold mb-2">Complete Profile</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your skills and portfolio.</p>
            <Link href="/dashboard/profile" className="text-sm font-bold text-primary hover:underline">Start now &rarr;</Link>
          </div>
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 font-bold">2</div>
            <h3 className="font-bold mb-2">Add Solution or Bid</h3>
            <p className="text-sm text-muted-foreground mb-4">Productize your service or find a request.</p>
            <Link href="/solutions/new" className="text-sm font-bold text-primary hover:underline">Create Listing &rarr;</Link>
          </div>
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 font-bold">3</div>
            <h3 className="font-bold mb-2">Win & Deliver</h3>
            <p className="text-sm text-muted-foreground mb-4">Get paid securely via escrow.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      
      {/* 🔝 Top section: Welcome + Earnings */}
      <section className="flex flex-col md:flex-row justify-between gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Let’s get you paid.</h1>
          <p className="text-muted-foreground">High-intent businesses are looking for experts like you.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-card border border-border rounded-xl p-4 min-w-[140px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">This Month</p>
            <p className="text-2xl font-bold">$2,450</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 min-w-[140px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Pending</p>
            <p className="text-2xl font-bold text-muted-foreground">$800</p>
          </div>
        </div>
      </section>

      {/* ⚡ Next Best Actions */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold">Priority Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-bold text-sm">New request matches "Make.com"</p>
                <p className="text-xs text-muted-foreground">Posted 2 hours ago • High Budget</p>
              </div>
            </div>
            <Link href="/jobs" className="px-3 py-1.5 bg-background border border-border rounded-md text-xs font-bold hover:bg-secondary transition-colors">View</Link>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-bold text-sm">Submit Milestone for "CRM Sync"</p>
                <p className="text-xs text-muted-foreground">Due Today</p>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-background border border-border rounded-md text-xs font-bold hover:bg-secondary transition-colors">Submit</button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col (2/3) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* 🔍 New Opportunities */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">New Opportunities</h2>
              </div>
              <Link href="/jobs/discovery" className="text-sm text-primary hover:underline">View Feed &rarr;</Link>
            </div>
            
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="group bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">Automate Inventory Updates to Shopify</h3>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span className="bg-secondary px-1.5 py-0.5 rounded">eCommerce</span>
                      <span className="bg-secondary px-1.5 py-0.5 rounded">Shopify</span>
                      <span className="text-green-500 font-medium">$500 - $1k</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-1 rounded">New</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 📦 Active Work */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Active Projects</h2>
            </div>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Project</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 font-medium">HubSpot Data Clean</td>
                    <td className="px-4 py-3 text-muted-foreground">Acme Corp</td>
                    <td className="px-4 py-3"><span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full font-bold">In Progress</span></td>
                    <td className="px-4 py-3 text-right"><button className="text-xs font-bold hover:underline">Manage</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* Right Col (1/3) */}
        <div className="space-y-8">
          
          {/* 🧠 Solution Performance */}
          <section className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" /> Top Solution
            </h3>
            <div className="mb-4">
              <p className="font-medium text-sm">Lead Scoring System</p>
              <p className="text-xs text-muted-foreground">Sales Automation</p>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="text-center p-2 bg-secondary/30 rounded">
                <p className="text-xs text-muted-foreground">Views</p>
                <p className="font-bold">1.2k</p>
              </div>
              <div className="text-center p-2 bg-secondary/30 rounded">
                <p className="text-xs text-muted-foreground">Sales</p>
                <p className="font-bold">8</p>
              </div>
              <div className="text-center p-2 bg-secondary/30 rounded">
                <p className="text-xs text-muted-foreground">Rev</p>
                <p className="font-bold">$4k</p>
              </div>
            </div>
            <button className="w-full py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-bold transition-colors">Optimize Listing</button>
          </section>

          {/* 📊 Performance Snapshot */}
          <section className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold mb-4">Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <span className="font-bold text-green-500">24%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Response</span>
                <span className="font-bold">2h 15m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rating</span>
                <span className="font-bold flex items-center gap-1">5.0 <span className="text-yellow-500">★</span></span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
