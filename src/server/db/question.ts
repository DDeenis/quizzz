import {
  type QuestionCreateObject,
  QuestionType,
  type QuestionUpdateObject,
} from "@/types/question";
import { db } from ".";
import { questions, tests } from "./schema";
import { and, count, eq } from "drizzle-orm";
import { getUserFromDb } from "./user";
import { isAdmin, isStudent } from "@/utils/user/authorization";
import { TEST_MAX_QUESTIONS } from "@/utils/constants";
import { questionUpdateSchema } from "@/utils/forms/question-form";

export function createEmptyQuestion(testId: string) {
  return db
    .insert(questions)
    .values(emptyQuestionValues(testId))
    .returning()
    .then((r) => {
      const res = r[0];
      if (!res) throw new Error("Failed to create an empty question");
      return res;
    });
}

export function emptyQuestionValues(testId: string): QuestionCreateObject {
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

export function updateQuestion(
  questionId: string,
  values: QuestionUpdateObject
) {
  const validatedValues = questionUpdateSchema.parse(values);

  return db
    .update(questions)
    .set(validatedValues)
    .where(eq(questions.id, questionId))
    .returning()
    .then((r) => {
      const q = r[0];
      if (!q) throw new Error("Question not found");
      return q;
    });
}

export function userCanCreateTestQuestion(userId: string, testId: string) {
  return Promise.all([
    db
      .select({ ownerId: tests.authorId, count: count(questions.id) })
      .from(tests)
      .leftJoin(questions, eq(questions.testId, tests.id))
      .where(eq(tests.id, testId))
      .limit(1)
      .then((r) => r[0]),
    getUserFromDb(userId),
  ]).then(([data, user]) => {
    if (!data || !user || isStudent(user)) return false;
    return (
      (data.ownerId === userId || isAdmin(user)) &&
      data.count < TEST_MAX_QUESTIONS
    );
  });
}

export function userCanModifyTestQuestion(
  userId: string,
  testId: string,
  questionId: string
) {
  return Promise.all([
    db
      .select({ ownerId: tests.authorId })
      .from(tests)
      .leftJoin(questions, eq(questions.testId, tests.id))
      .where(and(eq(tests.id, testId), eq(questions.id, questionId)))
      .limit(1)
      .then((r) => r[0]),
    getUserFromDb(userId),
  ]).then(([data, user]) => {
    if (!data || !user || isStudent(user)) return false;
    return data.ownerId === userId || isAdmin(user);
  });
}
