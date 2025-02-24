import type { Question, QuestionCreateObject } from "@/types/question";
import { db } from ".";
import { eq } from "drizzle-orm";
import { questions } from "./schema";

type QuestionCreateObjectFull = QuestionCreateObject & { quizId: string };

export const getQuestionsByQuiz = async (
  quizId: string
): Promise<Question[]> => {
  return await db.query.questions.findMany({
    where: eq(questions.quizId, quizId),
  });
};

export const getQuestionById = async (
  id: string
): Promise<Question | undefined> => {
  return await db.query.questions.findFirst({ where: eq(questions.id, id) });
};

export const createQuestion = async (
  questionCreateObj: QuestionCreateObjectFull
): Promise<Question | undefined> => {
  const results = await db
    .insert(questions)
    .values(questionCreateObj)
    .returning();
  return results[0];
};

export const updateQuestion = async (
  id: string,
  questionUpdateObj: Partial<QuestionCreateObjectFull>
): Promise<Question | undefined> => {
  const results = await db
    .update(questions)
    .set(questionUpdateObj)
    .where(eq(questions.id, id))
    .returning();
  return results[0];
};
