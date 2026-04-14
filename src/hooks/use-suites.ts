import { trpc } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useSuites() {
    return useQuery(trpc.common.suites.getPublishedSuites.queryOptions())
}