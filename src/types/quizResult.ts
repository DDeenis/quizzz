import type {
  QuestionAnswer,
  QuestionAnswerCreateObject,
  QuestionAnswerUpdateObject,
} from "./questionAnswer";
import type { Quiz } from "./quiz";
import type { User } from "./user";

interface QuizResultBase {
  id: string;
  quizId: string;
  userId: string;
  quizSessionId: string;
  score: number;
  maxScore?: number;
  countCorrect: number;
  countIncorrect: number;
  createdAt: Date;
}

export interface QuizResult extends QuizResultBase {
  answers: QuestionAnswer[];
}

export interface QuizResultCreateObject {
  quizId: string;
  userId: string;
  quizSessionId: string;
  answers: QuestionAnswerCreateObject[];
}

export interface QuizResultUpdateObject {
  quizId: string;
  userId: string;
  quizSessionId: string;
  answers: QuestionAnswerUpdateObject[];
}

export interface QuizResultWithQuizPreview extends QuizResultBase {
  quiz: Omit<Quiz, "questions">;
}

export interface QuizResultFull extends QuizResultBase {
  answers: QuestionAnswer[];
  quiz: Quiz;
}

export interface QuizResultAdminData extends QuizResultBase {
  quiz: {
    id: string;
    name: string;
    authorId: string;
    questionsCount: number;
    minimumScore: number;
  };
  user: User;
}
