import fixtures from "@/utils/test/fixtures";
import { describe, expect, it } from "vitest";
import { createTestSession } from "./testSession";
import { db } from ".";
import { count, eq } from "drizzle-orm";
import { testSessionsToQuestions } from "./schema";

describe("Test Sessions DAL", () => {
  it("createTestSession should create test session", async () => {
    const user = await fixtures.createUser();
    const test = await fixtures.createTest(user.id);
    const testSession = await createTestSession(test.id, user.id);
    const { questionCount } = (
      await db
        .select({ questionCount: count() })
        .from(testSessionsToQuestions)
        .where(eq(testSessionsToQuestions.testSessionId, testSession.id))
    )[0]!;

    const expiresAt = new Date(testSession.createdAt);
    expiresAt.setMinutes(expiresAt.getMinutes() + test.timeInMinutes!);

    expect(testSession.testId).toBe(test.id);
    expect(testSession.userId).toBe(user.id);
    expect(testSession.expiresAt).toStrictEqual(expiresAt);
    expect(questionCount).toBe(test.questionsCount);
  });

  it("createTestSession should not create test session if all attempts are exausted", async () => {
    const user = await fixtures.createUser();
    // only one attempt
    const test = await fixtures.createTest(user.id);

    await createTestSession(test.id, user.id);

    await expect(createTestSession(test.id, user.id)).rejects.toThrowError();
  });
});
