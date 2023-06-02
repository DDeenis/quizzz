import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getTestWithSession } from "@/server/database/test";
import {
  createTestSession,
  getTestSession,
  getTestSessionById,
  removeTestSession,
} from "@/server/database/testSession";
import { TRPCError } from "@trpc/server";
import { createTestResult } from "@/server/database/testResult";

export const studentTestsRouter = createTRPCRouter({
  createTestSession: protectedProcedure
    .input(z.object({ testId: z.string(), timeInMinutes: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const existingSession = await getTestSession(
        input.testId,
        ctx.session.user.id
      );

      if (existingSession) {
        await removeTestSession(existingSession.id);
      }

      return await createTestSession(
        input.testId,
        ctx.session.user.id,
        input.timeInMinutes
      );
    }),

  // getTestSession: protectedProcedure
  //   .input(z.object({ testId: z.string() }))
  //   .query(async ({ input, ctx }) => {
  //     return await getTestSession(input.testId, ctx.session.user.id);
  //   }),

  getTestWithSession: protectedProcedure
    .input(z.object({ testId: z.string(), testSessionId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await getTestWithSession(input.testId, input.testSessionId);
    }),

  remove: protectedProcedure
    .input(z.object({ testSessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const testSession = await getTestSessionById(input.testSessionId);

      if (!testSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      } else if (testSession.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      return await removeTestSession(input.testSessionId);
    }),

  submitTest: protectedProcedure
    .input(
      z.object({
        testId: z.string(),
        userId: z.string(),
        testSessionId: z.string(),
        answers: z.array(
          z.object({
            questionId: z.string(),
            userId: z.string(),
            answerData: z.object({
              variants: z.array(z.string()),
            }),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const testSession = await getTestSessionById(input.testSessionId);

      if (!testSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      } else if (testSession.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      const testResult = await createTestResult(input);

      if (testResult) {
        await removeTestSession(input.testSessionId);
      }

      return testResult;
    }),
});
