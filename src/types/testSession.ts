export interface TestSession {
  id: string;
  testId: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date | null;
  questionsData: TestSessionQuestionData;
  latestQuestionId?: string;
}

export type TestSessionQuestionData = PendingQuestion[];

interface PendingQuestion {
  questionId: string;
  answersIds: string[];
}

export type TestSessionCreateObject = Exclude<TestSession, "id">;
