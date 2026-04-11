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

export function useExperts() {
    return useQuery(trpc.admin.expert.getExperts.queryOptions())
}

export function useBusinessDelete() {
    return useMutation(trpc.admin.business.deleteBusinessById.mutationOptions())
}

export function useSuspendExpert() {
    return useMutation(trpc.admin.expert.suspendExpert.mutationOptions())
}

export function useDeleteExpert() {
    return useMutation(trpc.admin.expert.deleteExpert.mutationOptions())
}

export function useSetExpertTier() {
    return useMutation(trpc.admin.expert.setTier.mutationOptions())
}

