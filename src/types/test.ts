import {
  Question,
  QuestionCreateObject,
  QuestionUpdateObject,
} from "./question";

export interface Test {
  id: string;
  name: string;
  description?: string;
  authorId: string;
  createdAt?: string;
  time: number;
  questionsCount: number;
  minimumScore: number;
  maximumScore: number;
  deletedAt?: string;
  questions?: Question[];
}

export interface TestCreateObject {
  name: string;
  authorId: string;
  time: number;
  questionsCount: number;
  minimumScore: number;
  description?: string;
  questions: QuestionCreateObject[];
}

export interface TestUpdateObject {
  name: string;
  authorId: string;
  time: number;
  questionsCount: number;
  minimumScore: number;
  description?: string;
  questions: QuestionUpdateObject[];
}
