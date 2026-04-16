import { trpc } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useExpertProfile() {
    return useQuery(trpc.expert.profile.getExpert.queryOptions())
}

export function useExpertStats() {
    return useQuery(trpc.expert.profile.getStats.queryOptions())
}