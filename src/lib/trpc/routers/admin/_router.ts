// entries to all admin routers

import { createRouter } from "../../init";
import { adminAnalyticsRouter } from "./analytics";
import { adminBusinessRouter } from "./business";
import { adminExpertRouter } from "./expert";

// single entity that represents admin router
export const adminRouter = createRouter({
    analytics: adminAnalyticsRouter,
    business: adminBusinessRouter,
    expert: adminExpertRouter
})