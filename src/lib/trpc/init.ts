import { initTRPC } from "@trpc/server";
import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import superjson from "superjson";


export async function createContext(req: NextRequest) {
    const session = await getServerSession()
    return {
        session,
    };
}

export type Context = Awaited<ReturnType<typeof createContext>>;


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