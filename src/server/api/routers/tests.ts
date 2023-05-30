import { z } from "zod";
import { adminProcedure, createTRPCRouter, protectedProcedure } from "../trpc";
import {
  createTest,
  deleteTest,
  getAllTests,
  getTestById,
  updateTest,
} from "@/server/database/test";
import { QuestionType, QuestionComplexity } from "@/types/question";

const testCreateScheme = z.object({
  name: z.string(),
  time: z.number().min(1),
  questionsCount: z.number().min(1),
  minimumScore: z.number().min(1),
  description: z.string().optional().nullable(),
  questions: z.array(
    z.object({
      questionType: z.enum([
        QuestionType.SingleVariant,
        QuestionType.MultipleVariants,
      ]),
      complexity: z.enum([
        QuestionComplexity.Low,
        QuestionComplexity.High,
        QuestionComplexity.Medium,
      ]),
      questionData: z.any(),
      answerData: z.any(),
      image: z.string().optional().nullable(),
    })
  ),
});

const testUpdateScheme = z.object({
  name: z.string(),
  time: z.number().min(1),
  questionsCount: z.number().min(1),
  minimumScore: z.number().min(1),
  description: z.string().optional().nullable(),
  questions: z.array(
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
      questionData: z.any(),
      answerData: z.any(),
      image: z.string().optional().nullable(),
    })
  ),
});

export const testsRouter = createTRPCRouter({
  createTest: adminProcedure
    .input(
      z.object({
        testCreateObject: testCreateScheme,
      })
    )
    .mutation(async ({ input, ctx }) => {
      // @ts-ignore
      return await createTest({
        ...input.testCreateObject,
        authorId: ctx.session.user.id,
      });
    }),

  updateTest: adminProcedure
    .input(
      z.object({
        testId: z.string(),
        testUpdateObject: testUpdateScheme,
        deletedQuestionIds: z.array(z.string()).optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await updateTest(
        input.testId,
        // @ts-expect-error
        {
          ...input.testUpdateObject,
          authorId: ctx.session.user.id,
        },
        input.deletedQuestionIds
      );
    }),

  deleteTest: adminProcedure
    .input(
      z.object({
        testId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await deleteTest(input.testId);
    }),

  getAll: protectedProcedure.query(async () => {
    return await getAllTests();
  }),

  getById: protectedProcedure
    .input(
      z.object({
        testId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getTestById(input.testId);
    }),
});
