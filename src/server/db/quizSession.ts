import type {
  QuizSession,
  QuizSessionCreateObject,
  QuizSessionFull,
  QuizSessionWithQuiz,
} from "@/types/quizSession";
import { db } from ".";
import { and, count, desc, eq } from "drizzle-orm";
import { quizSessions } from "./schema";

export const getQuizSessions = async (
  quizId: string,
  userId: string
): Promise<QuizSession[]> => {
  return db.query.quizSessions.findMany({
    where: and(
      eq(quizSessions.quizId, quizId),
      eq(quizSessions.userId, userId)
    ),
    orderBy: [desc(quizSessions.createdAt)],
  });
};

export const getFullQuizSessions = async (
  quizId: string,
  userId?: string
): Promise<QuizSessionFull[]> => {
  return await db.query.quizSessions.findMany({
    where: userId
      ? and(eq(quizSessions.quizId, quizId), eq(quizSessions.userId, userId))
      : eq(quizSessions.quizId, quizId),
    with: {
      quiz: {
        columns: {
          name: true,
        },
      },
      user: true,
    },
    orderBy: [desc(quizSessions.createdAt)],
  });
};

export const getUserQuizSessions = async (
  userId: string
): Promise<QuizSessionWithQuiz[]> => {
  return await db.query.quizSessions.findMany({
    where: eq(quizSessions.userId, userId),
    with: {
      quiz: {
        columns: {
          name: true,
        },
      },
    },
    orderBy: [desc(quizSessions.createdAt)],
  });
};

export const getQuizSessionsCount = async (
  quizId: string,
  userId: string
): Promise<number> => {
  const result = await db
    .select({ count: count() })
    .from(quizSessions)
    .where(
      and(eq(quizSessions.quizId, quizId), eq(quizSessions.userId, userId))
    );
  return result[0]?.count ?? 0;
};

export const getLatestQuizSession = async (
  quizId: string,
  userId: string
): Promise<QuizSession | undefined> => {
  return db.query.quizSessions.findFirst({
    where: and(
      eq(quizSessions.quizId, quizId),
      eq(quizSessions.userId, userId)
    ),
    orderBy: [desc(quizSessions.createdAt)],
  });
};

export const getQuizSessionById = async (
  id: string
): Promise<QuizSession | undefined> => {
  return db.query.quizSessions.findFirst({
    where: eq(quizSessions.id, id),
  });
};

export const createQuizSession = async (
  quizId: string,
  userId: string,
  timeInMinutes: number
): Promise<QuizSession | undefined> => {
  const utcString = new Date().toUTCString();

  const createdAt = new Date(utcString);
  const expires = new Date(utcString);
  expires.setMinutes(expires.getMinutes() + timeInMinutes);

  const result = await db
    .insert(quizSessions)
    .values([
      {
        quizId,
        userId,
        createdAt,
        expires,
      },
    ])
    .returning();

  return result[0];
};

export const updateQuizSession = async (
  id: string,
  quizSessionUpdateObj: Partial<QuizSessionCreateObject>
): Promise<QuizSession | undefined> => {
  const result = await db
    .update(quizSessions)
    .set(quizSessionUpdateObj)
    .where(eq(quizSessions.id, id))
    .returning();
  return result[0];
};

export const removeQuizSession = async (id: string): Promise<boolean> => {
  try {
    await db.delete(quizSessions).where(eq(quizSessions.id, id));
    return true;
  } catch {
    return false;
  }
};

export const markQuizSessionAsExpired = async (
  id: string
): Promise<QuizSession | undefined> => {
  const utcString = new Date().toUTCString();
  const expires = new Date(utcString);

  const result = await db
    .update(quizSessions)
    .set({ expires })
    .where(eq(quizSessions.id, id))
    .returning();

  return result[0];
};
