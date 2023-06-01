import { QuestionAnswerCreateObject } from "./questionAnswer";

export interface TestResult {
  id: string;
  testId: string;
  userId: string;
  randomSeed: string;
  score: number;
  maxScore?: number;
  countCorrect: number;
  countIncorrect: number;
}

export interface TestResultCreateObject {
  testId: string;
  userId: string;
  randomSeed: string;
  answers: QuestionAnswerCreateObject[];
}
