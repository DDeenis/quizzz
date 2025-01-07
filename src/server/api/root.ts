import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { authRouter } from "./routers/auth";
import { quizzesRouter } from "./routers/quiz";
import { studentQuizzesRouter } from "./routers/studentQuiz";
import { quizResultRouter } from "./routers/quizResult";
import { userRouter } from "./routers/user";
import { adminRouter } from "./routers/admin";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  quizzes: quizzesRouter,
  studentQuizzes: studentQuizzesRouter,
  quizResults: quizResultRouter,
  users: userRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
