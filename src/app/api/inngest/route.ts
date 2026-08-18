import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";

// TODO: Serve Inngest functions from this route.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [],
});
