// src/server/db/question.test.ts
import { describe, it, expect } from "vitest";
import {
  createEmptyQuestion,
  emptyQuestionValues,
  updateQuestion,
  userCanCreateTestQuestion,
  userCanModifyTestQuestion,
} from "./question";
import { db } from ".";
import { QuestionType, type QuestionCreateObject } from "@/types/question";
import { questions } from "./schema";
import { TEST_MAX_QUESTIONS } from "@/utils/constants";
import fixtures from "@/utils/test/fixtures";

describe("Questions DAL", () => {
  describe("createEmptyQuestion", () => {
    it("should create an empty question an return it", async () => {
      const teacher = await fixtures.createTeacher();
      const test = await fixtures.createTest(teacher.id);
      const values = emptyQuestionValues(test.id);
      const question = await createEmptyQuestion(test.id);

      expect(question.testId).toBe(values.testId);
      expect(question.name).toBe(values.name);
      expect(question.description).toBe(values.description);
      expect(question.questionType).toBe(values.questionType);
      expect(question.answers.length).toBe(values.answers.length);
    });
  });

  describe("updateQuestion", () => {
    it("should update a question and return it", async () => {
      const teacher = await fixtures.createTeacher();
      const test = await fixtures.createTest(teacher.id);
      const question = await createEmptyQuestion(test.id);

      const values = {
        name: "Updated Question",
        description: "Updated Description",
        questionType: QuestionType.MultipleVariants,
        answers: [
          {
            id: crypto.randomUUID(),
            name: "Question 1",
            isCorrect: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Question 2",
            isCorrect: false,
          },
          {
            id: crypto.randomUUID(),
            name: "Question 3",
            isCorrect: true,
          },
        ],
      };
      const updatedQuestion = await updateQuestion(question.id, values);

      expect(updatedQuestion.name).toBe(values.name);
      expect(updatedQuestion.description).toBe(values.description);
      expect(updatedQuestion.questionType).toBe(values.questionType);
      expect(updatedQuestion.answers).toStrictEqual(values.answers);
    });

    it("should throw error if question is not found", async () => {
      const values = {
        name: "Updated Question",
        description: "Updated Description",
        questionType: QuestionType.MultipleVariants,
        answers: [
          {
            id: crypto.randomUUID(),
            name: "Question 1",
            isCorrect: true,
          },
          {
            id: crypto.randomUUID(),
            name: "Question 2",
            isCorrect: false,
          },
          {
            id: crypto.randomUUID(),
            name: "Question 3",
            isCorrect: true,
          },
        ],
      };

      await expect(updateQuestion("none-existent", values)).rejects.toThrow(
        "Question not found"
      );
    });
  });

  describe("userCanCreateTestQuestion", () => {
    it("should return true if the user can create a test question", async () => {
      const teacher = await fixtures.createTeacher();
      const admin = await fixtures.createAdmin();
      const test = await fixtures.createTest(teacher.id);

      await expect(
        userCanCreateTestQuestion(teacher.id, test.id)
      ).resolves.toBe(true);
      await expect(userCanCreateTestQuestion(admin.id, test.id)).resolves.toBe(
        true
      );
    });

    it("should return false if the user can't create a test question", async () => {
      const teacher = await fixtures.createTeacher();
      const teacher2 = await fixtures.createTeacher({
        email: "teacher2@test.com",
      });
      const student = await fixtures.createStudent();
      const test = await fixtures.createTest(teacher.id);

      await expect(
        userCanCreateTestQuestion(teacher2.id, test.id)
      ).resolves.toBe(false);
      await expect(
        userCanCreateTestQuestion(student.id, test.id)
      ).resolves.toBe(false);

      await db
        .insert(questions)
        .values(
          Array.from({ length: TEST_MAX_QUESTIONS }).fill(
            emptyQuestionValues(test.id)
          ) as QuestionCreateObject[]
        );

      await expect(
        userCanCreateTestQuestion(teacher.id, test.id)
      ).resolves.toBe(false);
    });
  });

  describe("userCanModifyTestQuestion", () => {
    it("userCanModifyTestQuestion should return true if the user can update a test question", async () => {
      const teacher = await fixtures.createTeacher();
      const admin = await fixtures.createAdmin();
      const test = await fixtures.createTest(teacher.id);
      const question = await fixtures.createEmptyQuestion(test.id);

      await expect(
        userCanModifyTestQuestion(teacher.id, test.id, question.id)
      ).resolves.toBe(true);
      await expect(
        userCanModifyTestQuestion(admin.id, test.id, question.id)
      ).resolves.toBe(true);
    });

    it("userCanModifyTestQuestion should return false if the user can't update a test question", async () => {
      const teacher = await fixtures.createTeacher();
      const teacher2 = await fixtures.createTeacher({
        email: "teacher2@test.com",
      });
      const student = await fixtures.createStudent();
      const test = await fixtures.createTest(teacher.id);
      const question = await fixtures.createEmptyQuestion(test.id);

      await expect(
        userCanModifyTestQuestion(teacher2.id, test.id, question.id)
      ).resolves.toBe(false);
      await expect(
        userCanModifyTestQuestion(student.id, test.id, question.id)
      ).resolves.toBe(false);
    });
  });
});
