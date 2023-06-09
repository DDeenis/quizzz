import { User } from "./user";

export interface QuizSession {
  id: string;
  quizId: string;
  userId: string;
  createdAt: string;
  expires: string;
}

export interface QuizSessionWithQuiz {
  id: string;
  quizId: string;
  userId: string;
  createdAt: string;
  expires: string;
  quizes: {
    name: string;
  };
}

export interface QuizSessionFull {
  id: string;
  quizId: string;
  userId: string;
  createdAt: string;
  expires: string;
  quizes: {
    name: string;
  };
  users: User;
}

export interface QuizSessionCreateObject {
  quizId: string;
  userId: string;
  createdAt: string;
  expires: string;
}
