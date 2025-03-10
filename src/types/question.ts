import { type QuestionFormType } from "@/utils/forms/question-form";
import { type StrictOmit } from "./utility-types";

export interface Question {
  id: string;
  testId: string;
  name: string;
  description?: string | null;
  image?: string | null;
  questionType: QuestionType;
  answers: AnswerData;
  createdAt: Date;
}

export type QuestionClient = StrictOmit<Question, "answers"> & {
  answers: AnswerDataClient;
};

export type QuestionCreateObject = Pick<
  Question,
  "testId" | "name" | "description" | "image" | "questionType" | "answers"
>;

export type QuestionUpdateObject = QuestionFormType;

export enum QuestionType {
  SingleVariant = "singleVariant",
  MultipleVariants = "multipleVariants",
}

export interface QuestionVariant {
  id: string;
  name: string;
  isCorrect: boolean;
}

export type QuestionVariantClient = Exclude<QuestionVariant, "isCorrect">;

export type AnswerData = QuestionVariant[];

export type AnswerDataClient = QuestionVariantClient[];
