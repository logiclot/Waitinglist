"use client";

import Link from "next/link";
import {
  Zap,
  Search,
  TrendingUp,
  Clock,
  AlertCircle,
  Briefcase,
  Info
} from "lucide-react";

interface ExpertOverviewData {
  isFirstTime: boolean;
  displayName: string | null;
  thisMonthEarnedCents: number;
  pendingCents: number;
  actions: Array<{ type: "warning" | "info" | "action"; title: string; description: string; href: string }>;
  activeOrders: Array<{ id: string; title: string; buyerEmail: string; status: string }>;
  jobPosts: Array<{ id: string; title: string; budgetRange: string; createdAt: string }>;
  topSolution: { id: string; title: string; category: string; orderCount: number } | null;
  solutionCount: number;
}

function formatEur(cents: number): string {
  return `€${(cents / 100).toLocaleString("en-IE", { maximumFractionDigits: 0 })}`;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  paid_pending_implementation: { label: "Pending Start", className: "bg-yellow-500/10 text-yellow-600" },
  in_progress: { label: "In Progress", className: "bg-blue-500/10 text-blue-500" },
  delivered: { label: "Delivered", className: "bg-green-500/10 text-green-600" },
  disputed: { label: "Disputed", className: "bg-red-500/10 text-red-600" },
};

export function ExpertOverview({ data }: { data: ExpertOverviewData }) {
  if (data.isFirstTime) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl font-bold">Welcome to the Expert Network</h1>
        <p className="text-xl text-muted-foreground">Get started in 3 steps to unlock your first earnings.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 font-bold">1</div>
            <h3 className="font-bold mb-2">Complete Profile</h3>
            <p className="text-sm text-muted-foreground mb-4">Add your skills and portfolio.</p>
            <Link href="/expert/settings" className="text-sm font-bold text-primary hover:underline">Start now &rarr;</Link>
          </div>
          <div className="p-6 bg-card border border-border rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 font-bold">2</div>
            <h3 className="font-bold mb-2">Add Solution or Bid</h3>
            <p className="text-sm text-muted-foreground mb-4">Productize your service or find a request.</p>
            <Link href="/expert/add-solution" className="text-sm font-bold text-primary hover:underline">Create Listing &rarr;</Link>
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

      {/* Top section: Welcome + Earnings */}
      <section className="flex flex-col md:flex-row justify-between gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Let&apos;s get you paid.</h1>
          <p className="text-muted-foreground">High-intent businesses are looking for experts like you.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-card border border-border rounded-xl p-4 min-w-[140px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">This Month</p>
            <p className="text-2xl font-bold">{formatEur(data.thisMonthEarnedCents)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 min-w-[140px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Pending</p>
            <p className="text-2xl font-bold text-muted-foreground">{formatEur(data.pendingCents)}</p>
          </div>
        </div>
      </section>

      {/* Priority Actions */}
      {data.actions.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold">Priority Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.actions.slice(0, 4).map((action, i) => {
              const colorMap = {
                warning: "bg-yellow-500/10 border-yellow-500/20",
                info: "bg-blue-500/10 border-blue-500/20",
                action: "bg-green-500/10 border-green-500/20",
              };
              const iconMap = {
                warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
                info: <Info className="w-5 h-5 text-blue-500" />,
                action: <Clock className="w-5 h-5 text-green-500" />,
              };
              return (
                <div key={i} className={`${colorMap[action.type]} border p-4 rounded-xl flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    {iconMap[action.type]}
                    <div>
                      <p className="font-bold text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <Link href={action.href} className="px-3 py-1.5 bg-background border border-border rounded-md text-xs font-bold hover:bg-secondary transition-colors shrink-0">
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col (2/3) */}
        <div className="lg:col-span-2 space-y-12">

          {/* New Opportunities */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">New Opportunities</h2>
              </div>
              <Link href="/expert/find-work" className="text-sm text-primary hover:underline">View Feed &rarr;</Link>
            </div>

            {data.jobPosts.length > 0 ? (
              <div className="space-y-3">
                {data.jobPosts.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="group bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer flex justify-between items-center block">
                    <div>
                      <h3 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {job.budgetRange && (
                          <span className="text-green-500 font-medium">
                            {job.budgetRange}
                          </span>
                        )}
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground bg-secondary px-2 py-1 rounded">New</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                <p className="text-sm">No open job posts right now. Check back soon!</p>
              </div>
            )}
          </section>

          {/* Active Work */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Active Projects</h2>
            </div>
            {data.activeOrders.length > 0 ? (
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
                    {data.activeOrders.map((order) => {
                      const statusInfo = STATUS_LABELS[order.status] || { label: order.status, className: "bg-secondary text-muted-foreground" };
                      return (
                        <tr key={order.id}>
                          <td className="px-4 py-3 font-medium">{order.title}</td>
                          <td className="px-4 py-3 text-muted-foreground">{order.buyerEmail.split("@")[0]}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${statusInfo.className}`}>{statusInfo.label}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link href="/expert/projects" className="text-xs font-bold hover:underline text-primary">Manage</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                <p className="text-sm">No active projects yet. Browse opportunities to find work.</p>
              </div>
            )}
          </section>

        </div>

        {/* Right Col (1/3) */}
        <div className="space-y-8">

          {/* Top Solution */}
          {data.topSolution ? (
            <section className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" /> Top Solution
              </h3>
              <div className="mb-4">
                <p className="font-medium text-sm">{data.topSolution.title}</p>
                <p className="text-xs text-muted-foreground">{data.topSolution.category}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="text-center p-2 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground">Sales</p>
                  <p className="font-bold">{data.topSolution.orderCount}</p>
                </div>
                <div className="text-center p-2 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground">Listed</p>
                  <p className="font-bold">{data.solutionCount}</p>
                </div>
              </div>
              <Link href={`/solutions/${data.topSolution.id}/edit`} className="block w-full py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-bold transition-colors text-center">
                Optimize Listing
              </Link>
            </section>
          ) : (
            <section className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" /> Your Solutions
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                You have {data.solutionCount} solution{data.solutionCount !== 1 ? "s" : ""} listed.
              </p>
              <Link href="/expert/add-solution" className="block w-full py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs font-bold transition-colors text-center">
                Add Solution
              </Link>
            </section>
          )}

          {/* Quick Stats */}
          <section className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold mb-4">Quick Links</h3>
            <div className="space-y-3">
              <Link href="/expert/earnings" className="flex justify-between items-center text-sm hover:text-primary transition-colors">
                <span className="text-muted-foreground">Earnings</span>
                <span className="font-bold">{formatEur(data.thisMonthEarnedCents)}</span>
              </Link>
              <Link href="/expert/my-solutions" className="flex justify-between items-center text-sm hover:text-primary transition-colors">
                <span className="text-muted-foreground">My Solutions</span>
                <span className="font-bold">{data.solutionCount}</span>
              </Link>
              <Link href="/expert/projects" className="flex justify-between items-center text-sm hover:text-primary transition-colors">
                <span className="text-muted-foreground">Active Projects</span>
                <span className="font-bold">{data.activeOrders.length}</span>
              </Link>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
