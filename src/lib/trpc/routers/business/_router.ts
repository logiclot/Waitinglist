import { createRouter } from "../../init";
import { businessOrdersRouter } from "./orders";
import { businessProfileRouter } from "./profile";
import { businessSolutionsRouter } from "./solutions";

export const businessRouter = createRouter({
    solutions: businessSolutionsRouter,
    orders: businessOrdersRouter,
    profile: businessProfileRouter
})