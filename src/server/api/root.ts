import { createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "./routers/auth";
import { testsRouter } from "./routers/tests";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  tests: testsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
