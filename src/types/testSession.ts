import { Test } from "./test";
import { TestResult } from "./testResult";

export interface TestSession {
  id: string;
  testId: string;
  userId: string;
  createdAt: string;
  test: Test;
  testResults: TestResult;
}
