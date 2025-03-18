import { QuestionType } from "@/types/question";
import { z } from "zod";

export const questionUpdateSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name should not be empty")
      .max(1024, "Name should not be longer than 1024 characters")
      .trim(),
    description: z
      .string()
      .max(4096, "Description should not be longer than 4096 characters")
      .optional(),
    questionType: z
      .nativeEnum(QuestionType)
      .default(QuestionType.SingleVariant),
    answers: z
      .array(
        z.object({
          id: z.string().min(1).max(36),
          name: z
            .string()
            .min(1, "Answer should not be empty")
            .max(2048, "Answer should not be longer than 2048 characters")
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
  );

export type QuestionFormType = z.infer<typeof questionUpdateSchema>;
