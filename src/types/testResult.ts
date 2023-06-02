import { QuestionAnswer, QuestionAnswerCreateObject } from "./questionAnswer";

export interface TestResult {
  id: string;
  testId: string;
  userId: string;
  testSessionId: string;
  score: number;
  maxScore?: number;
  countCorrect: number;
  countIncorrect: number;
  answers?: QuestionAnswer[];
}

export interface TestResultCreateObject {
  testId: string;
  userId: string;
  testSessionId: string;
  answers: QuestionAnswerCreateObject[];
}
