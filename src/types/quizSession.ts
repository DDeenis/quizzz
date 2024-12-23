import { type User } from "./user";

export interface QuizSession {
  id: string;
  quizId: string;
  userId: string;
  createdAt: Date;
  expires: Date;
}

export interface QuizSessionWithQuiz extends QuizSession {
  quiz: {
    name: string;
  };
}

export interface QuizSessionFull extends QuizSessionWithQuiz {
  user: User;
}

export type QuizSessionCreateObject = Exclude<QuizSession, "id">;
