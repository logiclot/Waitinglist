import { createRouter } from "../../init";
import { favouritesRouter } from "./favourites";
import { rewardsRouter } from "./rewards";

export const commonRouter = createRouter({
    rewards: rewardsRouter,
    fovourites: favouritesRouter
})