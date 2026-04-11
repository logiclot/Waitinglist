import { createRouter } from "../init";
import { adminRouter } from "./admin/_router";
import { businessRouter } from "./business/_router";
import { expertRouter } from "./expert/_router";

export const appRouter = createRouter({
    admin: adminRouter,
    business: businessRouter,
    expert: expertRouter
})

export type AppRouter = typeof appRouter;