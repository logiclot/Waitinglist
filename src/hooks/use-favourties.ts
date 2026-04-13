import { trpc } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useFavouriteSolutions() {
    return useQuery(trpc.common.fovourites.getSavedSolutionsFull.queryOptions())
}

export function useFavouriteSuites() {
    return useQuery(trpc.common.fovourites.getPublishedSuites.queryOptions())
}