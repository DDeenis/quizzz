import { describe, expect, it } from "vitest";
import { createTest, deleteTest, restoreTest, updateTest } from "./test";
import fixtures from "@/utils/test/fixtures";
import type { TestFormType } from "@/utils/forms/test-form";
import { type TestUpdateObject } from "@/types/test";
import { shuffleArray } from "@/utils/general";
import { db } from ".";
import { questions, tests } from "./schema";
import { eq, inArray } from "drizzle-orm";
import { QuestionType } from "@/types/question";

describe("Tests DAL", { retry: 2 }, () => {
  it("createTest should create test", async () => {
    const userId = (await fixtures.createUser()).id;
    const formValues = fixtures.testFormValues();
    const test = await createTest(formValues, userId);

    for (const prop in formValues) {
      if (prop === "image" || prop === "questions") continue;
      const propTyped = prop as Exclude<keyof TestFormType, "image">;
      expect(test[propTyped]).toBe(formValues[propTyped]);
    }

    expect(test.slug).toMatch(/^javascript-test-\d{4}$/);

    // compare only properties that were present in form values
    expect(
      test.questions.map((q) =>
        q.description
          ? {
              name: q.name,
              description: q.description,
              questionType: q.questionType,
              answers: q.answers,
            }
          : {
              name: q.name,
              questionType: q.questionType,
              answers: q.answers,
            }
      )
    ).toStrictEqual(formValues.questions);
  });

  it("createTest should create two tests with the same name but different slugs", async () => {
    const userId = (await fixtures.createUser()).id;
    const formValues = fixtures.testFormValues();

    const test1 = await createTest(formValues, userId);
    const test2 = await createTest(formValues, userId);

    expect(test1.name).toBe(test2.name);
    expect(test1.slug).not.toBe(test2.slug);
  });

  it("updateTest should update a test", async () => {
    const userId = (await fixtures.createUser()).id;
    const test = await fixtures.createTest(userId);

    const values = {
      name: "Updated Name",
      description: "Updated Description",
      autoScore: true,
      minimumCorrectAnswers: 1,
      questionsCount: 2,
      questions: test.questions,
      attempts: 1,
      timeInMinutes: 35,
    };
    const updatedTest = await updateTest(test.id, values);

    for (const prop in values) {
      if (prop === "image" || prop === "questions") continue;
      const propTyped = prop as Exclude<
        keyof TestUpdateObject,
        "image" | "questions"
      >;
      expect(updatedTest[propTyped]).toBe(values[propTyped]);
    }

    expect(updatedTest.slug).toMatch(/updated-name-\d{4}/);
  });

  it("updateTest should update test questions", async () => {
    const userId = (await fixtures.createUser()).id;
    const test = await fixtures.createTest(userId);

    const updatedQuestions = test.questions.map((q) => ({
      ...q,
      name: "Updated Name",
      description: "Updated Description",
      answers: shuffleArray(q.answers),
    }));
    const values = {
      name: "Updated Name",
      description: "Updated Description",
      autoScore: true,
      minimumCorrectAnswers: 1,
      questionsCount: 2,
      questions: updatedQuestions,
    };
    const updatedTest = await updateTest(test.id, values);

    expect(updatedTest.questions).toStrictEqual(updatedQuestions);
  });

  it("updateTest should delete removed questions", async () => {
    const userId = (await fixtures.createUser()).id;
    const test = await fixtures.createTest(userId);

    const updatedQuestions = [test.questions[0]!];
    const removedQuestionId = test.questions[1]!.id;
    const values = {
      name: "Updated Name",
      description: "Updated Description",
      autoScore: true,
      minimumCorrectAnswers: 1,
      questionsCount: 2,
      questions: updatedQuestions,
    };
    const updatedTest = await updateTest(test.id, values);
    const removedQuestionPromise = db
      .select()
      .from(questions)
      .where(eq(questions.id, removedQuestionId))
      .then((r) => r.length);

    expect(updatedTest.questions).toStrictEqual(updatedQuestions);
    await expect(removedQuestionPromise).resolves.toBe(0);
  });

  it("updateTest should delete removed questions and upsert new questions", async () => {
    const userId = (await fixtures.createUser()).id;
    const test = await fixtures.createTest(userId);

    const updatedQuestions = [
      {
        name: "A",
        questionType: QuestionType.SingleVariant,
        answers: [
          { id: "A1", name: "A1", isCorrect: true },
          { id: "A2", name: "A2", isCorrect: false },
        ],
      },
      {
        name: "B",
        questionType: QuestionType.MultipleVariants,
        answers: [
          { id: "B1", name: "B1", isCorrect: true },
          { id: "B2", name: "B2", isCorrect: true },
          { id: "B3", name: "B3", isCorrect: false },
          { id: "B4", name: "B4", isCorrect: false },
        ],
      },
    ];
    const removedQuestionsIds = test.questions.map((q) => q.id);
    const values = {
      name: "Updated Name",
      description: "Updated Description",
      autoScore: true,
      minimumCorrectAnswers: 1,
      questionsCount: 2,
      questions: updatedQuestions,
    };
    const updatedTest = await updateTest(test.id, values);
    const removedQuestionPromise = db
      .select()
      .from(questions)
      .where(inArray(questions.id, removedQuestionsIds))
      .then((r) => r.length);

    expect(
      updatedTest.questions.map((q) => ({
        name: q.name,
        questionType: q.questionType,
        answers: q.answers,
      }))
    ).toStrictEqual(updatedQuestions);
    await expect(removedQuestionPromise).resolves.toBe(0);
  });

  it("deleteTest should soft delete test", async () => {
    const userId = (await fixtures.createUser()).id;
    const test = await fixtures.createTest(userId);

    const result = await deleteTest(test.id);

    expect(result).toBe(true);
    await expect(
      db
        .select()
        .from(tests)
        .where(eq(tests.id, test.id))
        .limit(1)
        .then((r) => r[0]!.deletedAt)
    ).resolves.not.toBeNull();
  });

  it("restoreTest should restore soft deleted test", async () => {
    const userId = (await fixtures.createUser()).id;
    const test = await fixtures.createTest(userId);

    await deleteTest(test.id);
    const result = await restoreTest(test.id);

    expect(result).toBe(true);
    await expect(
      db
        .select()
        .from(tests)
        .where(eq(tests.id, test.id))
        .limit(1)
        .then((r) => r[0]!.deletedAt)
    ).resolves.toBeNull();
  });
});
