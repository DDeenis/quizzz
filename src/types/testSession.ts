import { Test } from "./test";
import { TestResult } from "./testResult";

export interface TestSession {
  id: string;
  testId: string;
  userId: string;
  createdAt: string;
  expires: string;
  isFinished: boolean;
  // test: Test;
  // testResults: TestResult;
}

export interface TestSessionCreateObject {
  testId: string;
  userId: string;
  createdAt: string;
  expires: string;
}
