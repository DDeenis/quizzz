import {
  Question,
  QuestionClient,
  QuestionCreateObject,
  QuestionUpdateObject,
} from "./question";

export interface Quiz {
  id: string;
  name: string;
  description?: string;
  authorId: string;
  createdAt?: string;
  time: number;
  questionsCount: number;
  minimumScore: number;
  maximumScore: number;
  attempts?: number;
  deletedAt?: string;
  questions?: Question[];
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
  attempts?: number;
  description?: string;
  questions: QuestionCreateObject[];
}

export interface QuizUpdateObject {
  name: string;
  authorId: string;
  time: number;
  questionsCount: number;
  minimumScore: number;
  attempts?: number;
  description?: string;
  questions: QuestionUpdateObject[];
}

export interface QuizOption {
  id: string;
  name: string;
}
