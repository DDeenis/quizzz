import "server-only";
import { testFormSchema, type TestFormType } from "@/utils/forms/test-form";
import { db } from ".";
import { questions, tests } from "./schema";
import { conflictUpdateAllExcept, slugify, sqlNow } from "./utils";
import { getRandomPattern } from "@/utils/patterns";
import { type TestUpdateObject, type Test } from "@/types/test";
import { eq, inArray, sql } from "drizzle-orm";

export function createTest(
  values: TestFormType,
  userId: string
): Promise<Test> {
  const validatedValues = testFormSchema.parse(values);

  return db.transaction(async (tx) => {
    const testSlug = slugify(validatedValues.name, { maxChars: 255 });

    const testResult = await tx
      .insert(tests)
      .values({
        authorId: userId,
        name: validatedValues.name,
        slug: testSlug,
        description: validatedValues.description,
        //   TODO: implement image upload
        imageOrPattern: {
          type: "pattern",
          value: getRandomPattern(),
        },
        minimumCorrectAnswers: validatedValues.minimumCorrectAnswers,
        questionsCount: validatedValues.questionsCount,
        attempts: validatedValues.attempts,
        autoScore: validatedValues.autoScore,
        timeInMinutes: validatedValues.timeInMinutes,
      })
      .returning();
    const createdTest = testResult[0];

    if (!createdTest) {
      return tx.rollback();
    }

    const questionsResult = await tx
      .insert(questions)
      .values(
        validatedValues.questions.map((q) => ({
          testId: createdTest.id,
          name: q.name,
          description: q.description,
          questionType: q.questionType,
          answers: q.answers,
          //   TODO: implement image upload
          image: undefined,
        }))
      )
      .returning();

    return {
      ...createdTest,
      questions: questionsResult,
    };
  });
}

export async function updateTest(testId: string, values: TestUpdateObject) {
  const currentTestValues = await db
    .select({
      name: tests.name,
      slug: tests.slug,
      questionsIds: sql`json_group_array(${questions.id})`.mapWith<
        (value: string) => string[]
      >(JSON.parse),
    })
    .from(tests)
    .leftJoin(questions, eq(tests.id, questions.testId))
    .where(eq(tests.id, testId))
    .limit(1)
    .then((r) => r[0]);

  if (!currentTestValues) throw new Error("Test now found");

  const currentQuestionsIds = new Set(currentTestValues.questionsIds);
  const updatedQuestionsIds = new Set(
    values.questions.filter((q) => q.id !== undefined).map((q) => q.id)
  );
  const deletedQuestions = Array.from(
    currentQuestionsIds.difference(updatedQuestionsIds)
  );

  return db.transaction(async (tx) => {
    const testResult = await tx
      .update(tests)
      .set({
        name: values.name,
        slug:
          currentTestValues.name === values.name
            ? currentTestValues.slug
            : slugify(values.name, { maxChars: 255 }),
        description: values.description,
        minimumCorrectAnswers: values.minimumCorrectAnswers,
        questionsCount: values.questionsCount,
        attempts: values.attempts,
        autoScore: values.autoScore,
        timeInMinutes: values.timeInMinutes,
      })
      .returning();
    const updatedTest = testResult[0];

    if (!updatedTest) {
      return tx.rollback();
    }

    const questionsToUpsert = values.questions.map((q) => ({
      id: q.id,
      testId: updatedTest.id,
      name: q.name,
      description: q.description,
      questionType: q.questionType,
      answers: q.answers,
      //   TODO: implement image upload
      image: undefined,
    }));
    const questionsResult = await tx
      .insert(questions)
      .values(questionsToUpsert)
      .onConflictDoUpdate({
        target: questions.id,
        set: conflictUpdateAllExcept(questions, ["id"]),
      })
      .returning();

    if (deletedQuestions.length) {
      await tx.delete(questions).where(inArray(questions.id, deletedQuestions));
    }

    return {
      ...updatedTest,
      questions: questionsResult,
    };
  });
}

export const deleteTest = async (id: string): Promise<boolean> => {
  try {
    await db
      .update(tests)
      .set({
        deletedAt: sqlNow(),
      })
      .where(eq(tests.id, id));
  } catch (err) {
    console.error(err);
    return false;
  }

  return true;
};

export const restoreTest = async (id: string): Promise<boolean> => {
  try {
    await db
      .update(tests)
      .set({
        deletedAt: null,
      })
      .where(eq(tests.id, id));
  } catch (err) {
    console.error(err);
    return false;
  }

  return true;
};
