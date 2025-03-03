import { z } from "zod";
import { validateImageSize, validateImageType } from "../test";
import { QuestionType } from "@/types/question";

const imageSchema = z
  .custom<File | undefined>()
  .refine(
    (f) => (f ? validateImageSize(f) : true),
    "Maximum image size is 10MB"
  )
  .refine((f) => (f ? validateImageType(f) : true), "Only images are accepted");

export const testFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name should not be empty")
      .max(255, "Name should not be longer than 255 characters")
      .trim(),
    description: z
      .string()
      .max(4096, "Description should not be longer than 4096 characters")
      .optional(),
    image: imageSchema,
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
    questions: z
      .array(
        z
          .object({
            name: z
              .string()
              .min(1, "Name should not be empty")
              .max(1024, "Name should not be longer than 1024 characters")
              .trim(),
            description: z
              .string()
              .max(
                4096,
                "Description should not be longer than 4096 characters"
              )
              .optional(),
            image: imageSchema,
            questionType: z
              .nativeEnum(QuestionType)
              .default(QuestionType.SingleVariant),
            answers: z
              .array(
                z.object({
                  id: z.string(),
                  name: z
                    .string()
                    .min(1, "Answer should not be empty")
                    .max(
                      2048,
                      "Answer should not be longer than 2048 characters"
                    )
                    .trim(),
                  isCorrect: z.boolean().default(false),
                })
              )
              .refine(
                (a) => a.some((v) => v.isCorrect),
                "Select at least one correct answer"
              ),
          })
          .refine(
            (q) =>
              q.questionType === QuestionType.SingleVariant
                ? q.answers.filter((a) => a.isCorrect).length === 1
                : true,
            "Single answer questions can have only one answer"
          )
      )
      .min(2, "Add minimum two questions"),
  })
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
