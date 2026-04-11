import { QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";
import { AppRouter } from "./routers/_app";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

/**
 * Init query client
 */
export const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => {
            toast.error(error.message, {
                action: {
                    label: "retry",
                    onClick: () => {
                        queryClient.invalidateQueries();
                    },
                },
            });
        }
    }),
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,
        },
    },
})


const trpcClient = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: "/api/trpc",
            fetch(url, options) {
                return fetch(url, {
                    ...options,
                    credentials: "include",
                });
            },
            transformer: superjson,
        }),
    ],
});

export async function createContext(req: NextRequest) {
    const session = await getServerSession()
    return {
        session,
    };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// trpc instance to use
export const trpc = createTRPCOptionsProxy<AppRouter>({
    client: trpcClient,
    queryClient,
});

// init trpc object
export const t = initTRPC.context<Context>().create({
    errorFormatter({ shape }) {
        return shape;
    },
    transformer: superjson,
});

export const createCallerFactory = t.createCallerFactory;

// method to create base routers
export const createRouter = t.router;