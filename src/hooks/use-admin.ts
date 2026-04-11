/**
 * For storing all the admin related hooks at once place
 */
import { trpc } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useStats() {
    return useQuery(trpc.admin.analytics.getStats.queryOptions())
}