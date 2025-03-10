import { QuestionType } from "@/types/question";
import { type TestFormType } from "../forms/test-form";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { createTest as createTestBase } from "@/server/db/test";
import type { Test } from "@/types/test";
import { ResultType, type TestResultCreateObject } from "@/types/testResult";
import { createTestSession as createTestSessionBase } from "@/server/db/testSession";
import { type TestSession } from "@/types/testSession";
import { type QuestionAnswerCreateObject } from "@/types/questionAnswer";
import { shuffleArray } from "../general";
import { createTestResult as createTestResultBase } from "@/server/db/testResult";
import { UserRole } from "@/types/user";
import { createEmptyQuestion as createEmptyQuestionBase } from "@/server/db/question";

function testFormValues(overrides?: Partial<TestFormType>): TestFormType {
  return Object.assign(
    {
      name: "JavaScript Test",
      description: "Test your JavaScript knowledge",
      image: undefined,
      autoScore: true,
      minimumCorrectAnswers: 2,
      questionsCount: 3,
      attempts: 1,
      timeInMinutes: 30,
      questions: [
        {
          name: "Which keywords are used to create a variable in JavaScript?",
          description: "Hint: there is more than one",
          questionType: QuestionType.MultipleVariants,
          answers: [
            { id: crypto.randomUUID(), name: "var", isCorrect: true },
            { id: crypto.randomUUID(), name: "let", isCorrect: true },
            { id: crypto.randomUUID(), name: "variable", isCorrect: false },
            { id: crypto.randomUUID(), name: "const", isCorrect: true },
          ],
        },
        {
          name: "How to access the second letter of the string?",
          description: 'const str = "abcd"',
          questionType: QuestionType.SingleVariant,
          answers: [
            { id: crypto.randomUUID(), name: "str[1]", isCorrect: false },
            { id: crypto.randomUUID(), name: "str[0]", isCorrect: true },
            { id: crypto.randomUUID(), name: "str[-1]", isCorrect: false },
            { id: crypto.randomUUID(), name: "str[2]", isCorrect: false },
          ],
        },
        {
          name: "What is the most optimal way to create an object with a property?",
          questionType: QuestionType.SingleVariant,
          answers: [
            {
              id: crypto.randomUUID(),
              name: 'const object = { property: "value" }',
              isCorrect: false,
            },
            {
              id: crypto.randomUUID(),
              name: 'const object = Object.assign({}, { property: "value" })',
              isCorrect: false,
            },
            {
              id: crypto.randomUUID(),
              name: 'const object = Object.create(); obj.property = "value";',
              isCorrect: false,
            },
            {
              id: crypto.randomUUID(),
              name: 'const object = JSON.parse({ property: "value" })',
              isCorrect: true,
            },
            {
              id: crypto.randomUUID(),
              name: 'const object = new Object(); obj.property = "value";',
              isCorrect: false,
            },
          ],
        },
      ],
    },
    overrides
  );
}

function testResultCreateObject(
  test: Test,
  testSession: TestSession,
  expectedResult: ResultType.Passed | ResultType.Failed | "random"
): TestResultCreateObject {
  const answers: QuestionAnswerCreateObject[] = [];

  if (
    expectedResult === ResultType.Passed ||
    expectedResult === ResultType.Failed
  ) {
    for (const question of test.questions) {
      const questionAnswers = question.answers
        .filter((a) =>
          expectedResult === ResultType.Passed ? a.isCorrect : !a.isCorrect
        )
        .map((a) => a.id);

      answers.push({
        questionId: question.id,
        userId: testSession.userId,
        answerIds:
          question.questionType === QuestionType.SingleVariant
            ? questionAnswers.slice(0, 1)
            : questionAnswers,
      });
    }
  } else {
    for (const question of test.questions) {
      const shuffledAnswers = shuffleArray(question.answers);
      const answersToCheckCount =
        question.questionType === QuestionType.SingleVariant
          ? 1
          : Math.floor(shuffledAnswers.length / 2);
      answers.push({
        questionId: question.id,
        userId: testSession.userId,
        answerIds: shuffledAnswers
          .slice(0, answersToCheckCount)
          .map((a) => a.id),
      });
    }
  }

  return {
    testId: test.id,
    testSessionId: testSession.id,
    userId: testSession.userId,
    answers,
  };
}

async function createUser(overrides: {
  name?: string;
  email?: string;
  emailVerified?: boolean;
  role: UserRole;
}) {
  return await db
    .insert(users)
    .values(
      Object.assign(
        {
          name: "test user",
          email: "user@test.com",
          emailVerified: true,
        },
        overrides
      )
    )
    .returning()
    .then((r) => r[0]!);
}

function createStudent(overrides?: {
  name?: string;
  email?: string;
  emailVerified?: boolean;
}) {
  return createUser(
    overrides
      ? { email: "student@test.com", ...overrides, role: UserRole.Student }
      : { email: "student@test.com", role: UserRole.Student }
  );
}

function createTeacher(overrides?: {
  name?: string;
  email?: string;
  emailVerified?: boolean;
}) {
  return createUser(
    overrides
      ? { email: "teacher@test.com", ...overrides, role: UserRole.Teacher }
      : { email: "teacher@test.com", role: UserRole.Teacher }
  );
}

function createAdmin(overrides?: {
  name?: string;
  email?: string;
  emailVerified?: boolean;
}) {
  return createUser(
    overrides
      ? { email: "admin@test.com", ...overrides, role: UserRole.Admin }
      : { email: "admin@test.com", role: UserRole.Admin }
  );
}

function createTest(userId: string, overrides?: Partial<TestFormType>) {
  return createTestBase(testFormValues(overrides), userId);
}

function createEmptyQuestion(testId: string) {
  return createEmptyQuestionBase(testId);
}

function createTestSession(testId: string, userId: string) {
  return createTestSessionBase(testId, userId);
}

async function createTestWithSession(
  userId: string,
  overrides?: Partial<TestFormType>
) {
  const test = await createTest(userId, overrides);
  const session = await createTestSession(test.id, userId);
  return { test, session };
}

function createTestResult(values: TestResultCreateObject) {
  return createTestResultBase(values);
}

const fixtures = {
  testFormValues,
  testResultCreateObject,
  createUser,
  createStudent,
  createTeacher,
  createAdmin,
  createTest,
  createEmptyQuestion,
  createTestSession,
  createTestWithSession,
  createTestResult,
};
export default fixtures;
