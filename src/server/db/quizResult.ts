import type {
  QuizResult,
  QuizResultAdminData,
  QuizResultCreateObject,
  QuizResultFull,
  QuizResultUpdateObject,
  QuizResultWithQuizPreview,
} from "@/types/quizResult";
import {
  complexityToScoreMap,
  shuffleQuestionsForQuiz,
} from "@/utils/questions";
import {
  AnswerType,
  type DetailedAnswerData,
  type QuestionAnswer,
} from "@/types/questionAnswer";
import { db } from ".";
import { and, eq, inArray } from "drizzle-orm";
import {
  questions as questionsTable,
  questionAnswers as questionAnswersTable,
  quizResults,
} from "./schema";
import { conflictUpdateAllExcept } from "./utils";

export const getQuizResults = async (
  quizId: string,
  userId: string
): Promise<QuizResult[]> => {
  return db.query.quizResults.findMany({
    where: and(eq(quizResults.quizId, quizId), eq(quizResults.userId, userId)),
    with: {
      answers: true,
    },
  });
};

export const getQuizResultsByQuiz = async (
  quizId: string
): Promise<QuizResult[]> => {
  return db.query.quizResults.findMany({
    where: eq(quizResults.quizId, quizId),
    with: {
      answers: true,
    },
  });
};

export const getQuizResultsByUser = async (
  userId: string
): Promise<QuizResultWithQuizPreview[]> => {
  return db.query.quizResults.findMany({
    where: eq(quizResults.userId, userId),
    with: {
      answers: true,
      quiz: true,
    },
  });
};

export const getQuizResultBySession = async (
  quizSessionId: string
): Promise<QuizResultWithQuizPreview | undefined> => {
  return db.query.quizResults.findFirst({
    where: eq(quizResults.quizSessionId, quizSessionId),
    with: {
      answers: true,
      quiz: true,
    },
  });
};

export const getQuizResultById = async (
  id: string
): Promise<QuizResultFull | undefined> => {
  return db.query.quizResults.findFirst({
    where: eq(quizResults.id, id),
    with: {
      answers: true,
      quiz: {
        with: { questions: true },
      },
    },
  });
};

export const getQuizResultWithQuiz = async (
  id: string
): Promise<QuizResultFull | undefined> => {
  const quizResult = await getQuizResultById(id);
  if (!quizResult) return;

  const { questions, minimumScore, questionsCount } = quizResult.quiz;

  const questionShuffled = shuffleQuestionsForQuiz({
    questions,
    minimumScore,
    questionsCount,
    quizSessionId: quizResult.quizSessionId,
  });

  return {
    ...quizResult,
    quiz: {
      ...quizResult.quiz,
      questions: questionShuffled,
    },
  };
};

export const getQuizResultsForAdmin = async (
  quizId: string
): Promise<QuizResultAdminData[]> => {
  return await db.query.quizResults.findMany({
    where: eq(quizResults.quizId, quizId),
    with: {
      quiz: {
        columns: {
          id: true,
          name: true,
          authorId: true,
          questionsCount: true,
          minimumScore: true,
        },
      },
      user: true,
    },
  });
};

export const createQuizResult = async (
  quizResultCreateObj: QuizResultCreateObject
): Promise<QuizResult | undefined> => {
  const { answers } = quizResultCreateObj;

  try {
    const questionIdsToFind = [...new Set(answers.map((a) => a.questionId))];
    const questions = await db.query.questions.findMany({
      where: inArray(questionsTable.id, questionIdsToFind),
    });

    const questionAnswers: Omit<QuestionAnswer, "id" | "quizResultId">[] = [];
    let totalMaxScore = 0;

    for (const question of questions) {
      const answer = answers.find((a) => a.questionId === question.id);
      if (!answer) throw new Error(`No answer for question ${question.id}`);

      const detailedAnswer: DetailedAnswerData[] = [];
      let countCorrect = 0;
      let countIncorrect = 0;
      const correctAnswers = question.questionData.variants.filter(
        (v) => v.isCorrect
      );
      const totalAnswers = correctAnswers.length;

      for (const variant of answer.answerData.variants) {
        const type = correctAnswers.some((v) => v.variant === variant)
          ? AnswerType.Correct
          : AnswerType.Incorrect;
        detailedAnswer.push({
          variant,
          answerType: type,
        });

        if (type === AnswerType.Correct) {
          countCorrect += 1;
        } else {
          countIncorrect += 1;
        }
      }

      const questionAnswerType =
        countIncorrect >= totalAnswers || countCorrect < totalAnswers / 2
          ? AnswerType.Incorrect
          : countCorrect === totalAnswers && countIncorrect === 0
          ? AnswerType.Correct
          : AnswerType.PartiallyCorrect;
      const maxScore = complexityToScoreMap[question.complexity];
      const score =
        questionAnswerType === AnswerType.Correct
          ? maxScore
          : questionAnswerType === AnswerType.Incorrect
          ? 0
          : maxScore / 2;
      totalMaxScore += maxScore;
      questionAnswers.push({
        userId: answer.userId,
        questionId: question.id,
        answerData: detailedAnswer,
        answerType: questionAnswerType,
        score,
      });
    }

    const countCorrect = questionAnswers.filter(
      (qa) => qa.answerType === AnswerType.Correct
    ).length;
    const countIncorrect = questionAnswers.filter(
      (qa) => qa.answerType === AnswerType.Incorrect
    ).length;
    const countPartiallyCorrect =
      questions.length - countCorrect - countIncorrect;

    const quizResult = await db.transaction(async (tx) => {
      const results = await tx
        .insert(quizResults)
        .values([
          {
            quizId: quizResultCreateObj.quizId,
            userId: quizResultCreateObj.userId,
            quizSessionId: quizResultCreateObj.quizSessionId,
            score: questionAnswers.reduce((acc, qa) => acc + qa.score, 0),
            maxScore: totalMaxScore,
            countCorrect,
            countIncorrect,
            countPartiallyCorrect,
          },
        ])
        .returning();
      const quizResult = results[0];

      if (!quizResult) return tx.rollback();

      const answers = await tx
        .insert(questionAnswersTable)
        .values(
          questionAnswers.map((a) => ({ ...a, quizResultId: quizResult.id }))
        )
        .returning();

      return { ...quizResult, answers };
    });

    return quizResult;
  } catch (err) {
    console.error(err);
    return;
  }
};

export const updateQuizResult = async (
  id: string,
  quizResultUpdateObj: Partial<QuizResultUpdateObject>
): Promise<QuizResult | undefined> => {
  const result = await db.transaction(async (tx) => {
    const results = await db
      .update(quizResults)
      .set(quizResultUpdateObj)
      .where(eq(quizResults.id, id))
      .returning();
    const quizResult = results[0];

    if (!quizResult) return tx.rollback();

    let answers: QuestionAnswer[] = [];
    if (quizResultUpdateObj.answers?.length) {
      answers = await tx
        .insert(questionAnswersTable)
        .values(quizResultUpdateObj.answers)
        .onConflictDoUpdate({
          target: questionAnswersTable.id,
          set: conflictUpdateAllExcept(questionAnswersTable, ["id"]),
        })
        .returning();
    }

    return {
      ...quizResult,
      answers,
    };
  });

  return result;
};
