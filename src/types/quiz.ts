import type {
  Question,
  QuestionClient,
  QuestionCreateObject,
  QuestionUpdateObject,
} from "./question";

export interface Quiz {
  id: string;
  name: string;
  description: string | null;
  authorId: string;
  time: number;
  questionsCount: number;
  minimumScore: number;
  maximumScore: number;
  attempts: number | null;
  createdAt: Date | null;
  deletedAt: Date | null;
  questions: Question[];
}

export interface QuizPreview {
  id: string;
  name: string;
  time: number;
  description: string | null;
  questionsCount: number;
  minimumScore: number;
  attempts: number | null;
  deletedAt: Date | null;
}

export type QuizClient = Omit<Quiz, "questions"> & {
  questions?: QuestionClient[];
};

export interface QuizCreateObject {
  name: string;
  authorId: string;
  time: number;
  questionsCount: number;
  minimumScore: number;
  attempts: number | null;
  description: string | null;
  questions: QuestionCreateObject[];
}

export interface QuizUpdateObject {
  name: string;
  authorId: string;
  time: number;
  questionsCount: number;
  minimumScore: number;
  attempts: number | null;
  description: string | null;
  questions: QuestionUpdateObject[];
}

export interface QuizOption {
  id: string;
  name: string;
}
