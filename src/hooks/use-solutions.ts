import { trpc } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";


export function useSolutions() {
    return useQuery(trpc.common.solutions.getPublishedSolutions.queryOptions())
}