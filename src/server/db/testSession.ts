import { and, count, eq, sql } from "drizzle-orm";
import { db } from ".";
import {
  questions,
  tests,
  testSessions,
  testSessionsToQuestions,
} from "./schema";
import { getISONow, shuffleArray } from "@/utils/questions";

export async function createTestSession(testId: string, userId: string) {
  const testPromise = db
    .select({
      questionsCount: tests.questionsCount,
      timeInMinutes: tests.timeInMinutes,
      attempts: tests.attempts,
      questionsIds: sql`json_group_array(${questions.id})`.mapWith<
        (val: string) => string[]
      >(JSON.parse),
    })
    .from(tests)
    .where(eq(tests.id, testId))
    .leftJoin(questions, eq(questions.testId, testId))
    .limit(1)
    .execute()
    .then((r) => r[0]);
  const existingSessionsPromise = db
    .select({ count: count() })
    .from(testSessions)
    .where(
      and(eq(testSessions.testId, testId), eq(testSessions.userId, userId))
    )
    .execute();

  const [test, existingSessions] = await Promise.all([
    testPromise,
    existingSessionsPromise,
  ]);

  if (!test) throw new Error("Test not found");

  console.log(test);

  if (test.attempts && existingSessions[0]!.count >= test.attempts)
    throw new Error("All attempts were used");

  const sessionQuestions = shuffleArray(test.questionsIds).slice(
    0,
    test.questionsCount
  );
  const createdAt = new Date(getISONow());
  let expiresAt: Date | null = null;

  if (test.timeInMinutes) {
    expiresAt = new Date(createdAt);
    expiresAt.setMinutes(expiresAt.getMinutes() + test.timeInMinutes);
  }

  return await db.transaction(async (tx) => {
    const createSessionResult = await tx
      .insert(testSessions)
      .values({ testId, userId, createdAt, expiresAt })
      .returning();
    const createdSession = createSessionResult[0];

    if (!createdSession) {
      return tx.rollback();
    }

    await tx.insert(testSessionsToQuestions).values(
      sessionQuestions.map((questionId, i) => ({
        questionId,
        testSessionId: createdSession.id,
        order: i + 1,
      }))
    );

    return createdSession;
  });
}
