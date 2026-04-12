import { createRouter } from "../../init";
import { rewardsRouter } from "./rewards";

export const commonRouter = createRouter({
    rewards: rewardsRouter,
})