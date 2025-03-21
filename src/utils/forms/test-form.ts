import { z } from "zod";
import { validateImageSize, validateImageType } from "../test";
import { questionUpdateSchema } from "./question-form";

export const imageSchema = z
  .custom<File | undefined>()
  .refine(
    (f) => (f ? validateImageSize(f) : true),
    "Maximum image size is 10MB"
  )
  .refine((f) => (f ? validateImageType(f) : true), "Only images are accepted");

export const testGeneralFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name should not be empty")
    .max(255, "Name should not be longer than 255 characters")
    .trim(),
  description: z
    .string()
    .max(4096, "Description should not be longer than 4096 characters")
    .optional(),
  image: z.string().optional(),
  timeInMinutes: z
    .number()
    .min(5, "Minimum value is 5 minutes")
    .max(60 * 6, "Maximum value is 6 hours")
    .optional()
    .transform((v) => (v && isNaN(v) ? undefined : v)),
  autoScore: z.boolean().default(false),
  minimumCorrectAnswers: z
    .number()
    .min(1, "Minimum one question")
    .optional()
    .transform((v) => (isNaN(v!) ? 0 : v!)),
  attempts: z
    .number()
    .min(1, "Minimum one attempt")
    .optional()
    .transform((v) => (v && isNaN(v) ? undefined : v)),
  questionsCount: z.number().min(1, "Minimum one question"),
});

export const testQuestionsFormSchema = z.object({
  questions: z.array(questionUpdateSchema).min(2, "Add minimum two questions"),
});

export const testFormSchema = testGeneralFormSchema
  .merge(testQuestionsFormSchema)
  .superRefine((fields, ctx) => {
    if (fields.questionsCount > fields.questions.length) {
      ctx.addIssue({
        path: ["questionsCount"],
        code: z.ZodIssueCode.too_big,
        type: "number",
        inclusive: true,
        maximum: fields.questions.length,
        message: `Maximum questions count is ${fields.questions.length}`,
      });
    }

    if (fields.minimumCorrectAnswers > fields.questions.length) {
      ctx.addIssue({
        path: ["minimumCorrectAnswers"],
        code: z.ZodIssueCode.too_big,
        type: "number",
        inclusive: true,
        maximum: fields.questions.length,
        message: `Maximum correct questions count is ${fields.questions.length}`,
      });
    }

    if (fields.minimumCorrectAnswers > fields.questionsCount) {
      ctx.addIssue({
        path: ["minimumCorrectAnswers"],
        code: z.ZodIssueCode.too_big,
        type: "number",
        inclusive: true,
        maximum: fields.questions.length,
        message: `Minimum correct questions number should not be greater than questions count`,
      });
    }

    return z.NEVER;
  });

export type TestFormType = z.infer<typeof testFormSchema>;
export type GeneralTestFormType = z.infer<typeof testGeneralFormSchema>;
export type QuestionsTestFormType = z.infer<typeof testQuestionsFormSchema>;
