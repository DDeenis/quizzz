import { type QuestionAnswer } from "./questionAnswer";

export interface Question {
  id: string;
  testId: string;
  questionType: QuestionType;
  answerData: AnswerData;
  createdAt: Date;
  answers?: QuestionAnswer[];
}

type StrictOmit<T, K extends keyof T> = Omit<T, K>;

export type QuestionClient = StrictOmit<Question, "answerData" | "answers"> & {
  answerData: AnswerDataClient;
};

export type QuestionCreateObject = Pick<
  Question,
  "testId" | "questionType" | "answers"
>;

export type QuestionUpdateObject = QuestionCreateObject & {
  id?: string;
};

export enum QuestionType {
  SingleVariant = "singleVariant",
  MultipleVariants = "multipleVariants",
}

export interface QuestionVariant {
  variant: string;
  isCorrect: boolean;
}

export type QuestionVariantClient = string;

export interface AnswerData {
  variants: QuestionVariant[];
}

export interface AnswerDataClient {
  variants: QuestionVariantClient[];
}
