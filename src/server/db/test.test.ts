import { describe, expect, it } from "vitest";
import { createTest } from "./test";
import fixtures from "@/utils/test/fixtures";
import type { TestFormType } from "@/utils/forms/test-form";

describe("Tests DAL", () => {
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
});
