import { trpc } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useFavouriteSolutions() {
    return useQuery(trpc.common.favourites.getSavedSolutionsFull.queryOptions())
}

export function useFavouriteSuites() {
    return useQuery(trpc.common.favourites.getPublishedSuites.queryOptions())
}