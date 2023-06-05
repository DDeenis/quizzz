import { QuestionAnswer, QuestionAnswerCreateObject } from "./questionAnswer";
import { Test } from "./test";

export interface TestResult {
  id: string;
  testId: string;
  userId: string;
  testSessionId: string;
  score: number;
  maxScore?: number;
  countCorrect: number;
  countIncorrect: number;
  createdAt: string;
  answers?: QuestionAnswer[];
}

export interface TestResultCreateObject {
  testId: string;
  userId: string;
  testSessionId: string;
  answers: QuestionAnswerCreateObject[];
}

export interface TestResultPreview {
  id: string;
  testId: string;
  userId: string;
  testSessionId: string;
  score: number;
  maxScore?: number;
  countCorrect: number;
  countIncorrect: number;
  createdAt: string;
  tests: Omit<Test, "questions">;
}
