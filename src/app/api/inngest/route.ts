import { inngest } from "@/lib/inngest";
import { trackLogin } from "@/lib/inngest/tasks/track-login";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [trackLogin],
});