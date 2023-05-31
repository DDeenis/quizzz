import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getTestForStudent, getTestWithSession } from "@/server/database/test";
import {
  createTestSession,
  getTestSession,
} from "@/server/database/testSession";

export const studentTestsRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(
      z.object({
        testId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getTestForStudent(input.testId);
    }),

  createTestSession: protectedProcedure
    .input(z.object({ testId: z.string(), timeInMinutes: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await createTestSession(
        input.testId,
        ctx.session.user.id,
        input.timeInMinutes
      );
    }),

  getTestSession: protectedProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await getTestSession(input.testId, ctx.session.user.id);
    }),

  getTestWithSession: protectedProcedure
    .input(z.object({ testId: z.string(), testSessionId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await getTestWithSession(input.testId, input.testSessionId);
    }),
});
