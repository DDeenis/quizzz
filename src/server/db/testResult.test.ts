import fixtures from "@/utils/test/fixtures";
import { describe, expect, it } from "vitest";
import { createTestResult } from "./testResult";
import { QuestionType } from "@/types/question";
import { ResultType, type TestResultCreateObject } from "@/types/testResult";

describe("Test Results DAL", () => {
  const mockQuestions = [
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

  describe("createTestResult", () => {
    it(`should create a test result with the '${ResultType.Passed}' status`, async () => {
      const teacher = await fixtures.createTeacher();
      const student = await fixtures.createStudent();

      const test1 = await fixtures.createTestWithSession(teacher.id, {
        questionsCount: mockQuestions.length,
        minimumCorrectAnswers: 2,
        questions: mockQuestions,
      });
      const testResultCreateObject1: TestResultCreateObject = {
        testId: test1.test.id,
        userId: student.id,
        testSessionId: test1.session.id,
        answers: [
          {
            questionId: test1.test.questions[0]!.id,
            userId: student.id,
            answerIds: ["A1"],
          },
          {
            questionId: test1.test.questions[1]!.id,
            userId: student.id,
            answerIds: ["B1", "B2"],
          },
        ],
      };
      const testResult1 = await createTestResult(testResultCreateObject1);

      expect(testResult1.suggestedResultType).toBe(ResultType.Passed);
      expect(testResult1.countCorrect).toBe(2);
      expect(testResult1.countIncorrect).toBe(0);
      expect(testResult1.answers.length).toBe(
        testResultCreateObject1.answers.length
      );

      const test2 = await fixtures.createTestWithSession(teacher.id, {
        questionsCount: mockQuestions.length,
        minimumCorrectAnswers: 1,
        questions: mockQuestions,
      });
      const testResultCreateObject2: TestResultCreateObject = {
        testId: test2.test.id,
        userId: student.id,
        testSessionId: test2.session.id,
        answers: [
          {
            questionId: test2.test.questions[0]!.id,
            userId: student.id,
            answerIds: ["A1"],
          },
          {
            questionId: test2.test.questions[1]!.id,
            userId: student.id,
            answerIds: ["B1", "B3"],
          },
        ],
      };
      const testResult2 = await createTestResult(testResultCreateObject2);

      expect(testResult2.suggestedResultType).toBe(ResultType.Passed);
      expect(testResult2.countCorrect).toBe(1);
      expect(testResult2.countIncorrect).toBe(1);
      expect(testResult2.answers.length).toBe(
        testResultCreateObject2.answers.length
      );
    });

    it(`should create a test result with the '${ResultType.Failed}' status`, async () => {
      const teacher = await fixtures.createTeacher();
      const student = await fixtures.createStudent();

      const test1 = await fixtures.createTestWithSession(teacher.id, {
        questionsCount: mockQuestions.length,
        minimumCorrectAnswers: 2,
        questions: mockQuestions,
      });
      const testResultCreateObject1: TestResultCreateObject = {
        testId: test1.test.id,
        userId: student.id,
        testSessionId: test1.session.id,
        answers: [
          {
            questionId: test1.test.questions[0]!.id,
            userId: student.id,
            answerIds: ["A2"],
          },
          {
            questionId: test1.test.questions[1]!.id,
            userId: student.id,
            answerIds: ["B3", "B4"],
          },
        ],
      };
      const testResult1 = await createTestResult(testResultCreateObject1);

      expect(testResult1.suggestedResultType).toBe(ResultType.Failed);
      expect(testResult1.countCorrect).toBe(0);
      expect(testResult1.countIncorrect).toBe(2);
      expect(testResult1.answers.length).toBe(
        testResultCreateObject1.answers.length
      );

      const test2 = await fixtures.createTestWithSession(teacher.id, {
        questionsCount: mockQuestions.length,
        minimumCorrectAnswers: 2,
        questions: mockQuestions,
      });
      const testResultCreateObject2: TestResultCreateObject = {
        testId: test2.test.id,
        userId: student.id,
        testSessionId: test2.session.id,
        answers: [
          {
            questionId: test2.test.questions[0]!.id,
            userId: student.id,
            answerIds: ["A1"],
          },
          {
            questionId: test2.test.questions[1]!.id,
            userId: student.id,
            answerIds: ["B2", "B3"],
          },
        ],
      };
      const testResult2 = await createTestResult(testResultCreateObject2);

      expect(testResult2.suggestedResultType).toBe(ResultType.Failed);
      expect(testResult2.countCorrect).toBe(1);
      expect(testResult2.countIncorrect).toBe(1);
      expect(testResult2.answers.length).toBe(
        testResultCreateObject2.answers.length
      );
    });

    it(`should account for autoScore option`, async () => {
      const teacher = await fixtures.createTeacher();

      const test1 = await fixtures.createTestWithSession(teacher.id, {
        questionsCount: mockQuestions.length,
        minimumCorrectAnswers: 2,
        questions: mockQuestions,
        autoScore: true,
      });
      const testResult1 = await createTestResult(
        fixtures.testResultCreateObject(
          test1.test,
          test1.session,
          ResultType.Passed
        )
      );

      expect(testResult1.suggestedResultType).toBe(ResultType.Passed);
      expect(testResult1.resultType).toBe(ResultType.Passed);

      const test2 = await fixtures.createTestWithSession(teacher.id, {
        questionsCount: mockQuestions.length,
        minimumCorrectAnswers: 2,
        questions: mockQuestions,
        autoScore: false,
      });
      const testResult2 = await createTestResult(
        fixtures.testResultCreateObject(
          test2.test,
          test2.session,
          ResultType.Failed
        )
      );

      expect(testResult2.suggestedResultType).toBe(ResultType.Failed);
      expect(testResult2.resultType).toBe(ResultType.Pending);
    });
  });
});
