import { createRouter } from "../../init";
import { favouritesRouter } from "./favourites";
import { rewardsRouter } from "./rewards";
import { solutionsRouter } from "./solutions";
import { suitesRouter } from "./suites";

export const commonRouter = createRouter({
    rewards: rewardsRouter,
    favourites: favouritesRouter,
    solutions: solutionsRouter,
    suites: suitesRouter
})