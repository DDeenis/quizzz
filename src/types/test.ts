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
  slug: string;
  description: string | null;
  imageOrPattern: ImageOrPattern;
  timeInMinutes: number | null;
  questionsCount: number;
  minimumCorrectAnswers: number;
  attempts: number | null;
  createdAt: Date | null;
  deletedAt: Date | null;
  questions: Question[];
}

export type TestPreview = Pick<
  Test,
  "id" | "name" | "slug" | "imageOrPattern" | "timeInMinutes" | "questionsCount"
> & {
  sessions: TestSession[];
};

export type TestClient = Omit<Test, "questions"> & {
  questions: QuestionClient[];
};

export interface TestCreateObject {
  authorId: string;
  name: string;
  description?: string;
  image?: string;
  timeInMinutes?: number;
  questionsCount: number;
  autoScore: boolean;
  minimumCorrectAnswers: number;
  attempts?: number;
  questions: QuestionCreateObject[];
}

export type TestUpdateObject = Omit<TestCreateObject, "questions"> & {
  questions: QuestionUpdateObject[];
};

export interface TestOption {
  id: string;
  name: string;
}

export interface ImageOrPattern {
  type: "image" | "pattern";
  url: string;
}

export enum TestStatus {
  None = "none",
  Started = "started",
  Passed = "passed",
  Failed = "failed",
}
