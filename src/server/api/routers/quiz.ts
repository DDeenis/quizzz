import { z } from "zod";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createQuiz,
  deleteQuiz,
  getAllQuizesPreview,
  getAllQuizesPreviewWithDeleted,
  getQuizById,
  getQuizPreviewById,
  restoreQuiz,
  updateQuiz,
} from "@/server/database/quiz";
import { QuestionType, QuestionComplexity } from "@/types/question";
import { TRPCError } from "@trpc/server";

const questionsScheme = z.array(
  z.object({
    id: z.string().optional().nullable(),
    questionType: z.enum([
      QuestionType.SingleVariant,
      QuestionType.MultipleVariants,
    ]),
    complexity: z.enum([
      QuestionComplexity.Low,
      QuestionComplexity.High,
      QuestionComplexity.Medium,
    ]),
    questionData: z.object({
      question: z.string().trim().nonempty(),
      description: z.string().optional().nullable(),
      variants: z
        .object({
          variant: z.string().trim().nonempty(),
          isCorrect: z.boolean(),
        })
        .array(),
    }),
  })
);

const quizCreateScheme = z.object({
  name: z.string().trim().nonempty(),
  time: z.number().min(1),
  questionsCount: z.number().min(1),
  minimumScore: z.number().min(1),
  description: z.string().optional().nullable(),
  attempts: z.number().min(1).or(z.nan()).optional().nullable(),
  questions: questionsScheme,
});

const quizUpdateScheme = z.object({
  name: z.string().trim().nonempty(),
  time: z.number().min(1),
  questionsCount: z.number().min(1),
  minimumScore: z.number().min(1),
  description: z.string().optional().nullable(),
  attempts: z.number().min(1).or(z.nan()).optional().nullable(),
  questions: questionsScheme,
});

export const quizesRouter = createTRPCRouter({
  createQuiz: adminProcedure
    .input(
      z.object({
        quizCreateObject: quizCreateScheme,
      })
    )
    .mutation(async ({ input, ctx }) => {
      // @ts-ignore
      return await createQuiz({
        ...input.quizCreateObject,
        authorId: ctx.session.user.id,
      });
    }),

  updateQuiz: adminProcedure
    .input(
      z.object({
        quizId: z.string(),
        quizUpdateObject: quizUpdateScheme,
        deletedQuestionIds: z.array(z.string()).optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await updateQuiz(
        input.quizId,
        // @ts-expect-error
        {
          ...input.quizUpdateObject,
          authorId: ctx.session.user.id,
        },
        input.deletedQuestionIds
      );
    }),

  deleteQuiz: adminProcedure
    .input(
      z.object({
        quizId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await deleteQuiz(input.quizId);
    }),

  restoreQuiz: adminProcedure
    .input(
      z.object({
        quizId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await restoreQuiz(input.quizId);
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.isAdmin) return await getAllQuizesPreviewWithDeleted();
    return await getAllQuizesPreview();
  }),

  getPreviewById: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const quiz = await getQuizPreviewById(input.quizId);

      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return quiz;
    }),

  getById: protectedProcedure
    .input(
      z.object({
        quizId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const quiz = await getQuizById(input.quizId);

      if (!quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return quiz;
    }),
});
