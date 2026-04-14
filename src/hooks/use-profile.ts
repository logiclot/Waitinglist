import { trpc } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useProfile() {
    return useQuery(trpc.common.profile.getProfile.queryOptions())
}
