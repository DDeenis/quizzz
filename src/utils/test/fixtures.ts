import { QuestionType } from "@/types/question";
import { type TestFormType } from "../forms/test-form";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { createTest as createTestBase } from "@/server/db/test";
import type { Test } from "@/types/test";
import type { TestResultCreateObject } from "@/types/testResult";

function testFormValues(): TestFormType {
  return {
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
  };
}

async function createUser() {
  const res = await db
    .insert(users)
    .values({ name: "test user", email: "test@test.com", emailVerified: true })
    .returning();
  return res[0]!;
}

async function createTest(userId: string) {
  return await createTestBase(testFormValues(), userId);
}

const fixtures = { createUser, createTest, testFormValues };
export default fixtures;
