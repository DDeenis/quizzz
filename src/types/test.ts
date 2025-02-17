import type {
  Question,
  QuestionClient,
  QuestionCreateObject,
  QuestionUpdateObject,
} from "./question";
import { type TestSession } from "./testSession";

export interface Test {
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

export interface TestPreview {
  id: string;
  name: string;
  slug: string;
  imageOrPattern: ImageOrPattern;
  time: number | null;
  questionsCount: number;
  sessions: TestSession[];
}

export type TestClient = Omit<Test, "questions"> & {
  questions?: QuestionClient[];
};

export interface TestCreateObject {
  name: string;
  authorId: string;
  time: number | null;
  questionsCount: number;
  minimumScore: number;
  attempts: number | null;
  description: string | null;
  questions: QuestionCreateObject[];
}

export interface TestUpdateObject {
  name: string;
  authorId: string;
  time: number | null;
  questionsCount: number;
  minimumScore: number;
  attempts: number | null;
  description: string | null;
  questions: QuestionUpdateObject[];
}

export interface TestOption {
  id: string;
  name: string;
}

export interface ImageOrPattern {
  type: "image" | "pattern";
  url: string;
}

export type QiuzStatus = "none" | "started" | "passed" | "failed";
