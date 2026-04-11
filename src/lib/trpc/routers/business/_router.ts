import { createRouter } from "../../init";
import { businessSolutionsRouter } from "./solutions";

export const businessRouter = createRouter({
    solutions: businessSolutionsRouter
})