import { QuestionAnswer, QuestionAnswerCreateObject } from "./questionAnswer";

export type Question =
  | {
      id: string;
      testId: string;
      questionType: (typeof QuestionType)["SingleVariant"];
      complexity: QuestionComplexity;
      questionData: SingleVariantData;
      answerData: SingleVariantAnswerData;
      createdAt?: string;
      image?: string;
      // answers?: QuestionAnswer[];
    }
  | {
      id: string;
      testId: string;
      questionType: (typeof QuestionType)["MultipleVariants"];
      complexity: QuestionComplexity;
      questionData: MultipleVariantsData;
      answerData: MultipleVariantsAnswerData;
      createdAt?: string;
      image?: string;
      // answers?: QuestionAnswer[];
    };

// export type QuestionCreateObject = {
//   questionType: QuestionType;
//   complexity: QuestionComplexity;
//   questionData: SingleVariantData;
//   answerData: SingleVariantAnswerData;
// } & {
//   questionType: QuestionType;
//   complexity: QuestionComplexity;
//   questionData: MultipleVariantsData;
//   answerData: MultipleVariantsAnswerData;
// };
export interface QuestionCreateObject {
  questionType: QuestionType;
  complexity: QuestionComplexity;
  questionData: SingleVariantData | MultipleVariantsData;
  answerData: [string] | string[];
}

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

export interface SingleVariantAnswerData {
  answer: string;
}

export interface MultipleVariantsAnswerData {
  answers: string[];
}
