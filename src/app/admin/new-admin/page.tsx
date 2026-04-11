"use client";

import { useStats } from "@/hooks/use-admin";
import { BRAND_NAME } from "@/lib/branding";
import { Briefcase, LayoutGrid, ShoppingBag, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpertManagement } from "@/components/admin/new-admin/ExpertManagement";
import { BusinessManagement } from "@/components/admin/new-admin/BusinessManagement";
import { SolutionManagement } from "@/components/admin/new-admin/SolutionManagement";
import { OrderManagement } from "@/components/admin/new-admin/OrderManagement";
import { DisputeManagement } from "@/components/admin/new-admin/DisputeManagement";
import { InviteManagement } from "@/components/admin/new-admin/InviteManagement";
import { BizInviteManagement } from "@/components/admin/new-admin/BizInviteManagement";

export default function AdminDashboard() {
  const { data, isPending } = useStats();

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{BRAND_NAME} Admin</h1>
        {!isPending && data && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Founding:{" "}
              <span className="font-bold text-foreground">
                {data.expertsByTier.FOUNDING ?? 0}/20
              </span>
            </span>
            <span>
              Elite:{" "}
              <span className="font-bold text-foreground">
                {data.expertsByTier.ELITE ?? 0}
              </span>
            </span>
            <span className="text-border">|</span>
            <span>
              Proven:{" "}
              <span className="font-bold text-foreground">
                {data.expertsByTier.PROVEN ?? 0}
              </span>
            </span>
            <span className="text-border">|</span>
            <span>
              Standard:{" "}
              <span className="font-bold text-foreground">
                {data.expertsByTier.STANDARD ?? 0}
              </span>
            </span>
          </div>
        )}
      </div>

      {isPending ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total Users", value: data?.users ?? 0, icon: Users },
            { label: "Experts", value: data?.experts ?? 0, icon: Briefcase },
            {
              label: "Businesses",
              value: data?.businesses ?? 0,
              icon: LayoutGrid,
            },
            {
              label: "Solutions",
              value: data?.solutions ?? 0,
              icon: ShoppingBag,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <Icon className="w-3.5 h-3.5" /> {label}
              </div>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}

      <Tabs defaultValue="experts">
        <TabsList
          variant="line"
          className="gap-4 border-b border-border mb-6 overflow-x-auto"
        >
          <TabsTrigger value="experts" className="px-4 py-2 capitalize">
            Experts
          </TabsTrigger>
          <TabsTrigger value="businesses" className="px-4 py-2 capitalize">
            Businesses
          </TabsTrigger>
          <TabsTrigger value="solutions" className="px-4 py-2 capitalize">
            Solutions
          </TabsTrigger>
          <TabsTrigger value="orders" className="px-4 py-2 capitalize">
            Orders
          </TabsTrigger>
          <TabsTrigger value="disputes" className="px-4 py-2 capitalize">
            Disputes
          </TabsTrigger>
          <TabsTrigger value="invites" className="px-4 py-2 capitalize">
            Invites
          </TabsTrigger>
          <TabsTrigger value="biz-invites" className="px-4 py-2 capitalize">
            Biz Invites
          </TabsTrigger>
        </TabsList>
        <TabsContent value="experts">
          <ExpertManagement />
        </TabsContent>
        <TabsContent value="businesses">
          <BusinessManagement />
        </TabsContent>
        <TabsContent value="solutions">
          <SolutionManagement />
        </TabsContent>
        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>
        <TabsContent value="disputes">
          <DisputeManagement />
        </TabsContent>
        <TabsContent value="invites">
          <InviteManagement />
        </TabsContent>
        <TabsContent value="biz-invites">
          <BizInviteManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-card border border-border rounded-xl p-4 animate-pulse"
        >
          <div className="h-3 w-16 bg-secondary/60 rounded mb-3" />
          <div className="h-7 w-12 bg-secondary/60 rounded" />
        </div>
      ))}
    </div>
  );
}
