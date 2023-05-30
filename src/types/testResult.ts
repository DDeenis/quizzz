export interface TestResult {
  id: string;
  testId: string;
  userId: string;
  testSessionId: string;
  score: number;
  countCorrect: number;
  countIncorrect: number;
}

export interface TestResultCreateObject {
  testId: string;
  userId: string;
  score: number;
  countCorrect: number;
  countIncorrect: number;
}
