import { db } from ".";
import { questionAnswers, questions, testResults, tests } from "./schema";
import {
  AnswerType,
  type QuestionAnswer,
  type DetailedAnswerData,
} from "@/types/questionAnswer";
import { ResultType, type TestResultCreateObject } from "@/types/testResult";
import { eq } from "drizzle-orm";
import { QuestionType } from "@/types/question";

export async function createTestResult(values: TestResultCreateObject) {
  const testFromDb = await db.query.tests.findFirst({
    columns: {
      autoScore: true,
      minimumCorrectAnswers: true,
    },
    where: eq(tests.id, values.testId),
  });

  if (!testFromDb) throw new Error("Test not found");

  const questionsFromDb = await db.query.questions.findMany({
    where: eq(questions.testId, values.testId),
  });

  const answersToCreate: Omit<QuestionAnswer, "id" | "testResultId">[] = [];
  let countCorrect = 0;
  let countIncorrect = 0;

  for (const answer of values.answers) {
    const question = questionsFromDb.find((q) => q.id === answer.questionId);
    if (!question)
      throw new Error(`Question with id ${answer.questionId} not found`);

    if (
      question.questionType === QuestionType.SingleVariant &&
      answer.answerIds.length > 1
    )
      throw new Error("Only one answer permitted");

    const detailedAnswers: DetailedAnswerData[] = question.answers.map((a) => {
      return {
        ...a,
        answerType: answer.answerIds.includes(a.id)
          ? a.isCorrect
            ? AnswerType.Correct
            : AnswerType.Incorrect
          : AnswerType.None,
      };
    });

    const isCorrect =
      question.questionType === QuestionType.SingleVariant
        ? detailedAnswers.some((a) => a.answerType === AnswerType.Correct)
        : detailedAnswers
            .filter((a) => a.isCorrect)
            .every((a) => a.answerType === AnswerType.Correct);

    countCorrect += +isCorrect;
    countIncorrect += +!isCorrect;

    answersToCreate.push({
      questionId: question.id,
      userId: values.userId,
      name: question.name,
      description: question.description,
      image: question.image,
      questionType: question.questionType,
      answerType: isCorrect ? AnswerType.Correct : AnswerType.Incorrect,
      answers: detailedAnswers,
    });
  }

  const suggestedResultType =
    countCorrect >= testFromDb.minimumCorrectAnswers
      ? ResultType.Passed
      : ResultType.Failed;
  const resultType = testFromDb.autoScore
    ? suggestedResultType
    : ResultType.Pending;

  return await db.transaction(async (tx) => {
    const testResultCreateResult = await tx
      .insert(testResults)
      .values({
        userId: values.userId,
        testId: values.testId,
        testSessionId: values.testSessionId,
        countCorrect,
        countIncorrect,
        suggestedResultType,
        resultType,
      })
      .returning();
    const createdTestResult = testResultCreateResult[0];

    if (!createdTestResult) {
      return tx.rollback();
    }

    const answersResult = await tx
      .insert(questionAnswers)
      .values(
        answersToCreate.map((a) => ({
          ...a,
          testResultId: createdTestResult.id,
        }))
      )
      .returning();

    return { ...createdTestResult, answers: answersResult };
  });
}
