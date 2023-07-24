export type Question =
  | {
      id: string;
      quizId: string;
      questionType: (typeof QuestionType)["SingleVariant"];
      complexity: QuestionComplexity;
      questionData: QuestionData;
      createdAt?: string;
    }
  | {
      id: string;
      quizId: string;
      questionType: (typeof QuestionType)["MultipleVariants"];
      complexity: QuestionComplexity;
      questionData: QuestionData;
      createdAt?: string;
    };

export type QuestionClient =
  | {
      id: string;
      quizId: string;
      questionType: (typeof QuestionType)["SingleVariant"];
      complexity: QuestionComplexity;
      questionData: QuestionDataClient;
      createdAt?: string;
    }
  | {
      id: string;
      quizId: string;
      questionType: (typeof QuestionType)["MultipleVariants"];
      complexity: QuestionComplexity;
      questionData: QuestionDataClient;
      createdAt?: string;
    };

export interface QuestionCreateObject {
  questionType: QuestionType;
  complexity: QuestionComplexity;
  questionData: QuestionData;
}

export type QuestionUpdateObject = QuestionCreateObject & {
  id?: string;
};

export enum QuestionType {
  SingleVariant = "singleVariant",
  MultipleVariants = "multipleVariants",
}

export enum QuestionComplexity {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export interface QuestionVariant {
  variant: string;
  isCorrect: boolean;
}

export type QuestionVariantClient = string;

export interface QuestionData {
  question: string;
  description?: string;
  variants: QuestionVariant[];
}

export interface QuestionDataClient {
  question: string;
  description?: string;
  variants: QuestionVariantClient[];
}
