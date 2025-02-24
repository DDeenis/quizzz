import { type User } from "./user";

export interface TestSession {
  id: string;
  testId: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date | null;
}

export interface TestSessionWithTest extends TestSession {
  test: {
    name: string;
  };
}

export interface TestSessionFull extends TestSessionWithTest {
  user: User;
}

export type TestSessionCreateObject = Exclude<TestSession, "id">;
