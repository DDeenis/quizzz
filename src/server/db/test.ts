import "server-only";
import { testFormSchema, type TestFormType } from "@/utils/forms/test-form";
import { db } from ".";
import { questions, tests } from "./schema";
import { slugify } from "./utils";
import { getRandomPattern } from "@/utils/patterns";
import { type Test } from "@/types/test";

export async function createTest(
  values: TestFormType,
  userId: string
): Promise<Test> {
  const validatedValues = testFormSchema.parse(values);

  const result = await db.transaction(async (tx) => {
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

  return result;
}
