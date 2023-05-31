export interface QuestionAnswer {
  id: string;
  questionId: string;
  userId: string;
  testSessionId: string;
  answerType: AnswerType;
  answerData: AnswerData;
}

export interface QuestionAnswerCreateObject {
  questionId: string;
  userId: string;
  answerData: AnswerData;
}

export enum AnswerType {
  Correct = "correct",
  Incorrect = "incorrect",
  PartiallyCorrect = "partiallyCorrect",
}

interface AnswerData {
  variants: string[];
}
