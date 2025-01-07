import type {
  Quiz,
  QuizClient,
  QuizCreateObject,
  QuizOption,
  QuizPreview,
  QuizUpdateObject,
} from "@/types/quiz";
import { getTotalScore, shuffleQuestionsForQuiz } from "@/utils/questions";
import { db } from ".";
import { eq, inArray, isNull } from "drizzle-orm";
import { questions, quizzes, quizSessions } from "./schema";
import { conflictUpdateAllExcept, sqlNow } from "./utils";
import { type QuizSession } from "@/types/quizSession";

export const getAllQuizzesPreview = async (): Promise<QuizPreview[]> => {
  return await db.query.quizzes.findMany({
    columns: {
      id: true,
      name: true,
      time: true,
      description: true,
      minimumScore: true,
      questionsCount: true,
      attempts: true,
      deletedAt: true,
    },
    where: isNull(quizzes.deletedAt),
  });
};

export const getAllQuizzesPreviewWithDeleted = async (): Promise<
  QuizPreview[]
> => {
  return await db.query.quizzes.findMany({
    columns: {
      id: true,
      name: true,
      time: true,
      description: true,
      minimumScore: true,
      questionsCount: true,
      attempts: true,
      deletedAt: true,
    },
  });
};

export const getQuizzesByAuthor = async (authorId: string): Promise<Quiz[]> => {
  return await db.query.quizzes.findMany({
    where: eq(quizzes.authorId, authorId),
    with: {
      questions: true,
    },
  });
};

export const getQuizById = async (id: string): Promise<Quiz | undefined> => {
  return await db.query.quizzes.findFirst({
    where: eq(quizzes.id, id),
    with: { questions: true },
  });
};

export const getQuizPreviewById = async (
  id: string
): Promise<QuizPreview | undefined> => {
  return await db.query.quizzes.findFirst({
    columns: {
      id: true,
      name: true,
      time: true,
      description: true,
      minimumScore: true,
      questionsCount: true,
      attempts: true,
      deletedAt: true,
    },
    where: eq(quizzes.id, id),
  });
};

export const getQuizWithSession = async (
  id: string,
  quizSessionId: string
): Promise<{ quizSession: QuizSession; quiz: QuizClient } | undefined> => {
  const quizSession = await db.query.quizSessions.findFirst({
    where: eq(quizSessions.id, quizSessionId),
    with: {
      quiz: {
        with: {
          questions: true,
        },
      },
    },
  });

  if (!quizSession) return;

  const quiz = quizSession.quiz;
  const { questionsCount, minimumScore, questions } = quiz;
  const questionsForQuiz = shuffleQuestionsForQuiz({
    questions,
    minimumScore,
    questionsCount,
    quizSessionId,
  });

  return {
    quizSession,
    quiz: {
      ...quiz,
      questions: questionsForQuiz.map((q) => ({
        ...q,
        questionData: {
          ...q.questionData,
          variants: q.questionData.variants.map((v) => v.variant),
        },
      })),
    } satisfies QuizClient,
  };
};

export const getQuizzesAsOptions = async (): Promise<QuizOption[]> => {
  return await db.query.quizzes.findMany({
    columns: {
      id: true,
      name: true,
    },
  });
};

export const getQuizAttempts = async (
  quizId: string
): Promise<number | null> => {
  const result = await db.query.quizzes.findFirst({
    columns: {
      attempts: true,
    },
    where: eq(quizzes.id, quizId),
  });

  if (!result) return null;

  return result?.attempts;
};

export const getQuizTime = async (quizId: string): Promise<number | null> => {
  const result = await db.query.quizzes.findFirst({
    columns: {
      time: true,
    },
    where: eq(quizzes.id, quizId),
  });

  if (!result) return null;

  return result?.time;
};

export const createQuiz = async (
  quizCreateObj: QuizCreateObject
): Promise<boolean> => {
  try {
    await db.transaction(async (tx) => {
      const result = await tx
        .insert(quizzes)
        .values({
          name: quizCreateObj.name,
          description: quizCreateObj.description,
          authorId: quizCreateObj.authorId,
          time: quizCreateObj.time,
          questionsCount: quizCreateObj.questionsCount,
          minimumScore: quizCreateObj.minimumScore,
          maximumScore: getTotalScore(quizCreateObj.questions),
          attempts: quizCreateObj.attempts,
        })
        .returning();
      const createdQuiz = result[0];

      if (!createdQuiz) throw new Error("Failed to create quiz");

      await tx
        .insert(questions)
        .values(
          quizCreateObj.questions.map((q) => ({ ...q, quizId: createdQuiz.id }))
        );
    });
  } catch (err) {
    console.error(err);
    return false;
  }

  return true;
};

export const updateQuiz = async (
  id: string,
  quizUpdateObj: QuizUpdateObject,
  deletedQuestionIds?: string[] | null
): Promise<boolean> => {
  try {
    await db.transaction(async (tx) => {
      await tx
        .update(quizzes)
        .set({
          name: quizUpdateObj.name,
          description: quizUpdateObj.description,
          authorId: quizUpdateObj.authorId,
          time: quizUpdateObj.time,
          questionsCount: quizUpdateObj.questionsCount,
          minimumScore: quizUpdateObj.minimumScore,
          maximumScore: getTotalScore(quizUpdateObj.questions),
          attempts: quizUpdateObj.attempts,
        })
        .where(eq(quizzes.id, id));

      const questionsToUpsert = quizUpdateObj.questions.map((q) => ({
        ...q,
        quizId: id,
      }));

      await tx
        .insert(questions)
        .values(questionsToUpsert)
        .onConflictDoUpdate({
          target: questions.id,
          set: conflictUpdateAllExcept(questions, ["id"]),
        });

      if (deletedQuestionIds?.length) {
        await tx
          .delete(questions)
          .where(inArray(questions.id, deletedQuestionIds));
      }
    });
  } catch (err) {
    console.error(err);
    return false;
  }

  return true;
};

export const deleteQuiz = async (id: string): Promise<boolean> => {
  try {
    await db
      .update(quizzes)
      .set({
        deletedAt: sqlNow(),
      })
      .where(eq(quizzes.id, id));
  } catch (err) {
    console.error(err);
    return false;
  }

  return true;
};

export const restoreQuiz = async (id: string): Promise<boolean> => {
  try {
    await db
      .update(quizzes)
      .set({
        deletedAt: null,
      })
      .where(eq(quizzes.id, id));
  } catch (err) {
    console.error(err);
    return false;
  }

  return true;
};
