import { getTrafficAnalytics } from "@/actions/admin";
import { redirect } from "next/navigation";
import { Eye, LogIn, LogOut, Globe, BarChart3, Users } from "lucide-react";
import { BRAND_NAME } from "@/lib/branding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Traffic Analytics | ${BRAND_NAME}`,
};

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: string | number; sub?: string; icon: React.ElementType }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function RankedList({ title, icon: Icon, items }: { title: string; icon: React.ElementType; items: { name: string; count: number }[] }) {
  const max = items[0]?.count || 1;
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" /> {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const pct = Math.round((item.count / max) * 100);
            return (
              <div key={item.name + i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-foreground font-medium truncate max-w-[70%]">{item.name}</span>
                  <span className="text-muted-foreground tabular-nums">{item.count}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default async function TrafficPage() {
  const data = await getTrafficAnalytics();
  if (!data) redirect("/auth/sign-in");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Traffic Analytics</h1>
        <p className="text-sm text-muted-foreground">Last {data.periodDays} days — all visitors (including anonymous)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon={Eye} label="Page Views" value={data.totalViews.toLocaleString()} />
        <StatCard icon={Users} label="Sessions" value={data.totalSessions.toLocaleString()} />
        <StatCard icon={BarChart3} label="Pages / Session" value={data.avgPagesPerSession} />
      </div>

      {/* Daily trend */}
      {data.dailyViews.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Daily Page Views</h3>
          <div className="flex items-end gap-[2px] h-32">
            {(() => {
              const maxDay = Math.max(...data.dailyViews.map(d => d.count), 1);
              return data.dailyViews.map((d) => {
                const heightPct = Math.max((d.count / maxDay) * 100, 2);
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {d.date}: {d.count}
                    </div>
                    <div
                      className="w-full bg-primary/70 hover:bg-primary rounded-t transition-colors min-w-[3px]"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                );
              });
            })()}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>{data.dailyViews[0]?.date}</span>
            <span>{data.dailyViews[data.dailyViews.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Entry / Exit / Top Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <RankedList title="Top Entry Pages" icon={LogIn} items={data.topEntryPages} />
        <RankedList title="Top Exit Pages" icon={LogOut} items={data.topExitPages} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <RankedList title="Most Visited Pages" icon={Eye} items={data.topPages} />
        <RankedList title="Top Referrers" icon={Globe} items={data.topReferrers} />
      </div>
    </div>
  );
}
