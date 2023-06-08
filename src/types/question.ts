export type Question =
  | {
      id: string;
      quizId: string;
      questionType: (typeof QuestionType)["SingleVariant"];
      complexity: QuestionComplexity;
      questionData: SingleVariantData;
      answerData: SingleVariantAnswerData;
      createdAt?: string;
      image?: string;
    }
  | {
      id: string;
      quizId: string;
      questionType: (typeof QuestionType)["MultipleVariants"];
      complexity: QuestionComplexity;
      questionData: MultipleVariantsData;
      answerData: MultipleVariantsAnswerData;
      createdAt?: string;
      image?: string;
    };

export interface QuestionCreateObject {
  questionType: QuestionType;
  complexity: QuestionComplexity;
  questionData: SingleVariantData | MultipleVariantsData;
  answerData: SingleVariantAnswerData | MultipleVariantsAnswerData;
  image?: string;
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

interface VariantData {
  question: string;
  description?: string;
}

export interface SingleVariantData extends VariantData {
  variants: string[];
}

export interface MultipleVariantsData extends VariantData {
  variants: string[];
}

export type SingleVariantAnswerData = [string];

export type MultipleVariantsAnswerData = string[];
