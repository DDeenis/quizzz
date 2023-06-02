export interface TestSession {
  id: string;
  testId: string;
  userId: string;
  createdAt: string;
  expires: string;
  isFinished: boolean;
}

export interface TestSessionCreateObject {
  testId: string;
  userId: string;
  createdAt: string;
  expires: string;
}
