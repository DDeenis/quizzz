import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { getTestsAsOptions } from "@/server/database/test";
import { getTestResultsForAdmin } from "@/server/database/testResult";
import { deleteUser, getAllUsers, restoreUser } from "@/server/database/user";

export const adminRouter = createTRPCRouter({
  getTestOptions: adminProcedure.query(async () => {
    return await getTestsAsOptions();
  }),

  getResultsForTest: adminProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ input }) => {
      return await getTestResultsForAdmin(input.testId);
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
