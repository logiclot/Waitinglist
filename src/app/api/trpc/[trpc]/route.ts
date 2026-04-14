import { createContext } from "@/lib/trpc/init";
import { appRouter } from "@/lib/trpc/routers/_app";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";


function handler(req: NextRequest) {
    return fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: () => createContext(req),
        onError({ error, path, type, input }) {
            // Avoid reporting expected app errors unless you want them in Sentry
            if (error.code !== "INTERNAL_SERVER_ERROR") return;

            Sentry.withScope((scope) => {
                scope.setTag("trpc.path", path ?? "unknown");
                scope.setTag("trpc.type", type);
                scope.setContext("trpc", {
                    path,
                    type,
                    input,
                });

                Sentry.captureException(error.cause ?? error);
            })
        }
    })
}
export { handler as GET, handler as POST };