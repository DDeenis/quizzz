import type { QuestionType } from "./question";

export interface QuestionAnswer {
  id: string;
  questionId: string;
  userId: string;
  testResultId: string;
  name: string;
  description: string | null;
  image: string | null;
  questionType: QuestionType;
  answerType: AnswerType;
  answers: DetailedAnswerData[];
}

export interface QuestionAnswerCreateObject {
  questionId: string;
  userId: string;
  answerIds: string[];
}

export interface QuestionAnswerUpdateObject extends Omit<QuestionAnswer, "id"> {
  id?: string;
}

export enum AnswerType {
  Correct = "correct",
  Incorrect = "incorrect",
  PartiallyCorrect = "partially_correct",
  None = "none",
}

export interface DetailedAnswerData {
  id: string;
  name: string;
  isCorrect: boolean;
  answerType: AnswerType;
}
