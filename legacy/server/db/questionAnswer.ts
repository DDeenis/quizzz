import type { QuestionAnswer } from "@/types/questionAnswer";
import { db } from ".";
import { eq } from "drizzle-orm";
import { questionAnswers } from "./schema";

export const getQuestionAnswers = async (
  questionId: string
): Promise<QuestionAnswer[]> => {
  return await db.query.questionAnswers.findMany({
    where: eq(questionAnswers.questionId, questionId),
  });
};

export const createQuestionAnswer = async (
  questionAnswerCreateObj: Exclude<QuestionAnswer, "id">
): Promise<QuestionAnswer | undefined> => {
  const results = await db
    .insert(questionAnswers)
    .values([questionAnswerCreateObj])
    .returning();
  return results[0];
};

export const updateQuestionAnswer = async (
  id: string,
  questionAnswerUpdateObj: Partial<Exclude<QuestionAnswer, "id">>
): Promise<QuestionAnswer | undefined> => {
  const results = await db
    .update(questionAnswers)
    .set(questionAnswerUpdateObj)
    .where(eq(questionAnswers.id, id))
    .returning();
  return results[0];
};
