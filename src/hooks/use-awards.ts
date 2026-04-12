import { trpc } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useCoupons() {
    return useQuery(trpc.common.rewards.getCoupons.queryOptions())
}

export function useReferals() {
    return useQuery(trpc.common.rewards.getReferalStats.queryOptions())
}

