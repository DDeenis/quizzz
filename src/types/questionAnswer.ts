export interface QuestionAnswer {
  id: string;
  questionId: string;
  userId: string;
  quizResultId: string;
  score: number;
  answerType: AnswerType;
  answerData: DetailedAnswerData[];
}

export interface QuestionAnswerCreateObject {
  questionId: string;
  userId: string;
  answerData: AnswerData;
}

export interface QuestionAnswerUpdateObject extends Omit<QuestionAnswer, "id"> {
  id?: string;
}

export enum AnswerType {
  Correct = "correct",
  Incorrect = "incorrect",
  PartiallyCorrect = "partiallyCorrect",
}

interface AnswerData {
  variants: string[];
}

export interface DetailedAnswerData {
  variant: string;
  answerType: AnswerType;
}
