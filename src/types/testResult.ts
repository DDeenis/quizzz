import type {
  QuestionAnswer,
  QuestionAnswerCreateObject,
  QuestionAnswerUpdateObject,
} from "./questionAnswer";
import type { Test } from "./test";
import type { User } from "./user";

interface TestResultBase {
  id: string;
  testId: string;
  userId: string;
  testSessionId: string;
  score: number;
  maxScore?: number;
  countCorrect: number;
  countIncorrect: number;
  resultType: ResultType;
  createdAt: Date;
}

export interface TestResult extends TestResultBase {
  answers: QuestionAnswer[];
}

export interface TestResultCreateObject {
  testId: string;
  userId: string;
  testSessionId: string;
  answers: QuestionAnswerCreateObject[];
}

export interface TestResultUpdateObject {
  testId: string;
  userId: string;
  testSessionId: string;
  answers: QuestionAnswerUpdateObject[];
}

export interface TestResultWithTestPreview extends TestResultBase {
  test: Omit<Test, "questions">;
}

export interface TestResultFull extends TestResultBase {
  answers: QuestionAnswer[];
  test: Test;
}

export interface TestResultAdminData extends TestResultBase {
  test: {
    id: string;
    name: string;
    authorId: string;
    questionsCount: number;
    minimumScore: number;
  };
  user: User;
}

export enum ResultType {
  Incorrect = "incorrect",
  Correct = "correct",
}
