// entries to all admin routers

import { createRouter } from "../../init";
import { adminAnalyticsRouter } from "./analytics";

// single entity that represents admin router
export const adminRouter = createRouter({
    analytics: adminAnalyticsRouter
})