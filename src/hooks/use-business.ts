import { trpc } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useFreeDiscoveryScans() {
    return useQuery(trpc.business.profile.getFreeScans.queryOptions())
}

export function useCompletedProjectCount() {
    return useQuery(trpc.business.orders.completedProjectCount.queryOptions())
}

export function useActiveOrders() {
    return useQuery(trpc.business.orders.activeOrders.queryOptions())
}