import type {
  Question,
  QuestionClient,
  QuestionCreateObject,
  QuestionUpdateObject,
} from "./question";
import { type QuizSession } from "./quizSession";

export interface Quiz {
  id: string;
  authorId: string;
  name: string;
  description: string | null;
  imageOrPattern: ImageOrPattern;
  time: number | null;
  questionsCount: number;
  minimumScore: number;
  maximumScore: number;
  attempts: number | null;
  rating: number | null;
  createdAt: Date | null;
  deletedAt: Date | null;
  questions: Question[];
}

export interface QuizPreview {
  id: string;
  name: string;
  slug: string;
  imageOrPattern: ImageOrPattern;
  time: number | null;
  questionsCount: number;
  sessions: QuizSession[];
}

export type QuizClient = Omit<Quiz, "questions"> & {
  questions?: QuestionClient[];
};

export interface QuizCreateObject {
  name: string;
  authorId: string;
  time: number | null;
  questionsCount: number;
  minimumScore: number;
  attempts: number | null;
  description: string | null;
  questions: QuestionCreateObject[];
}

export interface QuizUpdateObject {
  name: string;
  authorId: string;
  time: number | null;
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

export interface ImageOrPattern {
  type: "image" | "pattern";
  url: string;
}

export type QiuzStatus = "none" | "started" | "passed" | "failed";
