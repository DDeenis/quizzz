import { createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "./routers/auth";
import { testsRouter } from "./routers/tests";
import { studentTestsRouter } from "./routers/studentTest";
import { testResultRouter } from "./routers/testResult";
import { userRouter } from "./routers/user";
import { adminRouter } from "./routers/admin";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  tests: testsRouter,
  studentTests: studentTestsRouter,
  testResults: testResultRouter,
  users: userRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
