import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  getTestResultWithTest,
  getTestResults,
  getTestResultsByTest,
  getTestResultsByUser,
} from "@/server/database/testResult";

export const testResultRouter = createTRPCRouter({
  getWithTest: protectedProcedure
    .input(z.object({ testResultId: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await getTestResultWithTest(input.testResultId);

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (
        result?.testResult.userId !== ctx.session.user.id &&
        !ctx.session.user.isAdmin
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      return result;
    }),

  getAllForTest: adminProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ input }) => {
      return await getTestResultsByTest(input.testId);
    }),

  getAllForTestByUser: protectedProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await getTestResults(input.testId, ctx.session.user.id);

      if (
        result?.some((tr) => tr.userId !== ctx.session.user.id) &&
        !ctx.session.user.isAdmin
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      return result;
    }),

  getAllByUser: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (ctx.session.user.id !== input.userId && !ctx.session.user.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      const result = await getTestResultsByUser(input.userId);
      return result;
    }),
});
