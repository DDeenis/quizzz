import { QuestionType } from "@/types/question";
import { db } from ".";
import { questions } from "./schema";
import { count, eq } from "drizzle-orm";
import { getUserFromDb } from "./user";
import { isStudent } from "@/utils/user/authorization";
import { TEST_MAX_QUESTIONS } from "@/utils/constants";

export function createEmptyQuestion(testId: string) {
  return db
    .insert(questions)
    .values(emptyQuestionValues(testId))
    .returning()
    .then((r) => r[0]);
}

export function emptyQuestionValues(testId: string) {
  return {
    testId,
    name: "",
    description: "",
    questionType: QuestionType.SingleVariant,
    answers: [emptyQuestionAnswer(), emptyQuestionAnswer()],
  };
}

export const emptyQuestionAnswer = () => ({
  id: crypto.randomUUID(),
  name: "",
  isCorrect: false,
});

export function userCanCreateTestQuestion(userId: string, testId: string) {
  return Promise.all([
    db
      .select({ count: count(questions.id) })
      .from(questions)
      .where(eq(questions.testId, testId))
      .then((r) => r[0]),
    getUserFromDb(userId),
  ]).then(([questionsData, user]) => {
    if (!questionsData || !user || isStudent(user)) return false;
    return questionsData.count < TEST_MAX_QUESTIONS;
  });
}
