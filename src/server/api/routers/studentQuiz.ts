import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getQuizWithSession } from "@/server/database/quiz";
import {
  createQuizSession,
  getQuizSession,
  getQuizSessionById,
  removeQuizSession,
} from "@/server/database/quizSession";
import { TRPCError } from "@trpc/server";
import { createQuizResult } from "@/server/database/quizResult";

export const studentQuizesRouter = createTRPCRouter({
  createQuizSession: protectedProcedure
    .input(z.object({ quizId: z.string(), timeInMinutes: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const existingSession = await getQuizSession(
        input.quizId,
        ctx.session.user.id
      );

      if (existingSession) {
        await removeQuizSession(existingSession.id);
      }

      return await createQuizSession(
        input.quizId,
        ctx.session.user.id,
        input.timeInMinutes
      );
    }),

  getQuizWithSession: protectedProcedure
    .input(z.object({ quizId: z.string(), quizSessionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await getQuizWithSession(
        input.quizId,
        input.quizSessionId
      );

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (result.quizSession.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      return result;
    }),

  removeQuizSession: protectedProcedure
    .input(z.object({ quizSessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const quizSession = await getQuizSessionById(input.quizSessionId);

      if (!quizSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (quizSession.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      return await removeQuizSession(input.quizSessionId);
    }),

  submitQuiz: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
        userId: z.string(),
        quizSessionId: z.string(),
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
      const quizSession = await getQuizSessionById(input.quizSessionId);

      if (!quizSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      if (quizSession.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      const quizResult = await createQuizResult(input);

      if (quizResult) {
        await removeQuizSession(input.quizSessionId);
      }

      return quizResult;
    }),
});
