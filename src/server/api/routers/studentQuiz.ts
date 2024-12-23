import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getQuizAttempts, getQuizWithSession } from "@/server/db/quiz";
import {
  createQuizSession,
  getQuizSessions,
  getQuizSessionById,
  removeQuizSession,
  getQuizSessionsCount,
  markQuizSessionAsExpired,
} from "@/server/db/quizSession";
import { TRPCError } from "@trpc/server";
import { createQuizResult } from "@/server/db/quizResult";
import { isQuizSessionExpired } from "@/utils/questions";

export const studentQuizesRouter = createTRPCRouter({
  createQuizSession: protectedProcedure
    .input(z.object({ quizId: z.string(), timeInMinutes: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const quizAttempts = await getQuizAttempts(input.quizId);
      const quizSessions = await getQuizSessions(
        input.quizId,
        ctx.session.user.id
      );

      if (quizSessions) {
        if (quizAttempts && quizSessions.length >= quizAttempts) {
          throw new TRPCError({
            code: "FORBIDDEN",
          });
        }

        const latestSession = quizSessions[0];

        if (latestSession && !isQuizSessionExpired(latestSession)) {
          return latestSession;
        }
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

  getAttempts: protectedProcedure
    .input(z.object({ quizId: z.string() }))
    .query(async ({ input }) => {
      return await getQuizAttempts(input.quizId);
    }),

  canStartQuiz: protectedProcedure
    .input(z.object({ quizId: z.string() }))
    .query(async ({ input, ctx }) => {
      const attempts = await getQuizAttempts(input.quizId);

      if (!attempts)
        return { attempts, currentAttemptsCount: null, canStart: true };

      const currentAttemptsCount = await getQuizSessionsCount(
        input.quizId,
        ctx.session.user.id
      );

      if (!currentAttemptsCount || currentAttemptsCount < attempts)
        return { attempts, currentAttemptsCount, canStart: true };

      return { attempts, currentAttemptsCount, canStart: false };
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

      if (
        quizSession.userId !== ctx.session.user.id &&
        !ctx.session.user.isAdmin
      ) {
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

      if (
        quizSession.userId !== ctx.session.user.id ||
        isQuizSessionExpired(quizSession)
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      const quizResult = await createQuizResult(input);
      await markQuizSessionAsExpired(quizSession.id);

      return quizResult;
    }),
});
