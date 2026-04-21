"use client";

import { BidManagement } from "@/components/admin/BidManagement";
import { BusinessManagement } from "@/components/admin/BusinessManagement";
import { ExpertManagement } from "@/components/admin/ExpertManagement";
import { SolutionManagement } from "@/components/admin/SolutionManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStats } from "@/hooks/use-admin";
import { BRAND_NAME } from "@/lib/branding";
import { Briefcase, LayoutGrid, ShoppingBag, Users } from "lucide-react";

export default function AdminDashboard() {
  const stats = useStats();

  return (
    <div className="mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{BRAND_NAME} Admin</h1>
        {!stats.isPending && stats.data && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Founding:{" "}
              <span className="font-bold text-foreground">
                {stats.data.expertsByTier.FOUNDING ?? 0}/20
              </span>
            </span>
            <span>
              Elite:{" "}
              <span className="font-bold text-foreground">
                {stats.data.expertsByTier.ELITE ?? 0}
              </span>
            </span>
            <span className="text-border">|</span>
            <span>
              Proven:{" "}
              <span className="font-bold text-foreground">
                {stats.data.expertsByTier.PROVEN ?? 0}
              </span>
            </span>
            <span className="text-border">|</span>
            <span>
              Standard:{" "}
              <span className="font-bold text-foreground">
                {stats.data.expertsByTier.STANDARD ?? 0}
              </span>
            </span>
          </div>
        )}
      </div>

      {stats.isPending ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total Users", value: stats.data?.users ?? 0, icon: Users },
            { label: "Experts", value: stats.data?.experts ?? 0, icon: Briefcase },
            {
              label: "Businesses",
              value: stats.data?.businesses ?? 0,
              icon: LayoutGrid,
            },
            {
              label: "Solutions",
              value: stats.data?.solutions ?? 0,
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


      <Tabs defaultValue="experts" className="flex-col" orientation="horizontal">
        <TabsList className="mb-6 h-auto gap-1 rounded-lg border border-border bg-secondary/50 p-1">
          <TabsTrigger
            value="experts"
            className="rounded-md px-4 py-2 text-sm font-medium capitalize text-muted-foreground transition-all hover:text-foreground data-active:border-border data-active:bg-card data-active:text-foreground data-active:shadow-sm"
          >
            Experts
          </TabsTrigger>
          <TabsTrigger
            value="businesses"
            className="rounded-md px-4 py-2 text-sm font-medium capitalize text-muted-foreground transition-all hover:text-foreground data-active:border-border data-active:bg-card data-active:text-foreground data-active:shadow-sm"
          >
            Businesses
          </TabsTrigger>
          <TabsTrigger
            value="solutions"
            className="rounded-md px-4 py-2 text-sm font-medium capitalize text-muted-foreground transition-all hover:text-foreground data-active:border-border data-active:bg-card data-active:text-foreground data-active:shadow-sm"
          >
            Solutions
          </TabsTrigger>
          <TabsTrigger
            value="bids"
            className="rounded-md px-4 py-2 text-sm font-medium capitalize text-muted-foreground transition-all hover:text-foreground data-active:border-border data-active:bg-card data-active:text-foreground data-active:shadow-sm"
          >
            Bids
          </TabsTrigger>
          {/* Coming soon */}
          {/* <TabsTrigger value="orders" className="px-4 py-2 capitalize">
            Orders
          </TabsTrigger>
          <TabsTrigger value="disputes" className="px-4 py-2 capitalize">
            Disputes
          </TabsTrigger> */}
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
        <TabsContent value="bids">
          <BidManagement />
        </TabsContent>
        {/* <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>
        <TabsContent value="disputes">
          <DisputeManagement />
        </TabsContent> */}
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
