/**
 * For storing all the admin related hooks at once place
 */
import { trpc } from "@/lib/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useStats() {
    return useQuery(trpc.admin.analytics.getStats.queryOptions())
}

export function useBusinesses() {
    return useQuery(trpc.admin.business.getBusinesses.queryOptions())
}

export function useBusinessDelete() {
    return useMutation(trpc.admin.business.deleteBusinessById.mutationOptions())
}