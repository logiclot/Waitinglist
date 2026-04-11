import { createRouter } from "../../init";
import { expertProfileRouter } from "./profile";

export const expertRouter = createRouter({
    profile: expertProfileRouter
})