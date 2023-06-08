import { QuestionAnswer, QuestionAnswerCreateObject } from "./questionAnswer";
import { Quiz } from "./quiz";
import { User } from "./user";

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  quizSessionId: string;
  score: number;
  maxScore?: number;
  countCorrect: number;
  countIncorrect: number;
  createdAt: string;
  answers?: QuestionAnswer[];
}

export interface QuizResultCreateObject {
  quizId: string;
  userId: string;
  quizSessionId: string;
  answers: QuestionAnswerCreateObject[];
}

export interface QuizResultPreview {
  id: string;
  quizId: string;
  userId: string;
  quizSessionId: string;
  score: number;
  maxScore?: number;
  countCorrect: number;
  countIncorrect: number;
  createdAt: string;
  quizes: Omit<Quiz, "questions">;
}

export interface QuizResultAdminData extends Omit<QuizResult, "answers"> {
  quizes: {
    id: string;
    name: string;
    authorId: string;
    questionsCount: number;
    minimumScore: number;
  };
  users: User;
}
