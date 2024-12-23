import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { getQuizesAsOptions } from "@/server/db/quiz";
import { getQuizResultsForAdmin } from "@/server/db/quizResult";
import { deleteUser, getAllUsers, restoreUser } from "@/server/db/user";
import { getFullQuizSessions } from "@/server/db/quizSession";

export const adminRouter = createTRPCRouter({
  getQuizOptions: adminProcedure.query(async () => {
    return await getQuizesAsOptions();
  }),

  getQuizSessions: adminProcedure
    .input(z.object({ quizId: z.string() }))
    .query(async ({ input }) => {
      return await getFullQuizSessions(input.quizId);
    }),

  getResultsForQuiz: adminProcedure
    .input(z.object({ quizId: z.string() }))
    .query(async ({ input }) => {
      return await getQuizResultsForAdmin(input.quizId);
    }),

  getAllUsers: adminProcedure.query(async ({ ctx }) => {
    return await getAllUsers(ctx.session.user.id);
  }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      return await deleteUser(input.userId);
    }),

  restoreUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      return await restoreUser(input.userId);
    }),
});
