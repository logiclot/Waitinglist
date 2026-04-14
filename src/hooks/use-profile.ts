import { trpc } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";

export function useProfile(enabled: boolean = true) {
    return useQuery({
        ...trpc.common.profile.getProfile.queryOptions(),
        enabled,
    })
}
