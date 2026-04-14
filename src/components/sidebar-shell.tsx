"use client";

import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { useProfile } from "@/hooks/use-profile";

type SidebarRole = "EXPERT" | "BUSINESS" | "ADMIN";

function toSidebarRole(role?: string | null): SidebarRole | null {
    if (role === "EXPERT" || role === "BUSINESS" || role === "ADMIN") return role;
    return null;
}

export function SidebarShell() {
    const { data: session, status } = useSession();
    const role = toSidebarRole(session?.user?.role);

    const portfolio = useProfile();
    const portfolioData = portfolio.data

    if (status === "loading" || portfolio.isPending) return <SidebarSkeleton />;
    if (!session?.user || !role) return null;

    return (
        <Sidebar
            role={role}
            isFoundingExpert={portfolioData?.isFoundingExpert ?? false}
            portfolioSlug={portfolioData?.portfolioSlug ?? null}
        />
    );
}

function SidebarSkeleton() {
    return (
        <aside className="w-64 bg-card border-r border-border h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto hidden md:flex flex-col">
            <div className="p-4 space-y-1 flex-1">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                        <div
                            className="h-4 rounded bg-muted animate-pulse"
                            style={{ width: `${60 + ((i * 17) % 40)}%` }}
                        />
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-border space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                        <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                        <div
                            className="h-4 rounded bg-muted animate-pulse"
                            style={{ width: `${50 + ((i * 23) % 30)}%` }}
                        />
                    </div>
                ))}
            </div>
        </aside>
    );
}