import fixtures from "@/utils/test/fixtures";
import { describe, expect, it } from "vitest";
import { createTestSession } from "./testSession";
import { db } from ".";
import { count, eq } from "drizzle-orm";
import { testSessionsToQuestions } from "./schema";

describe("Test Sessions DAL", () => {
  describe("createTestSession", () => {
    it("should create test session", async () => {
      const teacher = await fixtures.createTeacher();
      const student = await fixtures.createStudent();
      const test = await fixtures.createTest(teacher.id, { timeInMinutes: 30 });
      const testSession = await createTestSession(test.id, student.id);
      const { questionCount } = (
        await db
          .select({ questionCount: count() })
          .from(testSessionsToQuestions)
          .where(eq(testSessionsToQuestions.testSessionId, testSession.id))
      )[0]!;

      const expiresAt = new Date(testSession.createdAt);
      expiresAt.setMinutes(expiresAt.getMinutes() + test.timeInMinutes!);

      expect(testSession.testId).toBe(test.id);
      expect(testSession.userId).toBe(student.id);
      expect(testSession.expiresAt).toStrictEqual(expiresAt);
      expect(questionCount).toBe(test.questionsCount);
    });

    it("should not create test session if all attempts are exausted", async () => {
      const teacher = await fixtures.createTeacher();
      const student = await fixtures.createStudent();
      const test = await fixtures.createTest(teacher.id, { attempts: 1 });

      await createTestSession(test.id, student.id);

      await expect(
        createTestSession(test.id, student.id)
      ).rejects.toThrowError();
    });
  });
});
