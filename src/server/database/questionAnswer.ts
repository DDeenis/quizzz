import type {
  QuestionAnswer,
  QuestionAnswerCreateObject,
} from "@/types/questionAnswer";
import { supabase } from "./supabase";

export const getQuestionAnswersByTest = async (testId: string) => {
  const response = await supabase
    .from("questionAnswers")
    .select()
    .eq("testId", testId);
  return response.data as QuestionAnswer[] | null;
};

export const createQuestionAnswer = async (
  questionAnswerCreateObj: QuestionAnswerCreateObject
) => {
  const result = await supabase
    .from("questionAnswers")
    .insert(questionAnswerCreateObj)
    .select();
  const questionAnswer = result.data?.[0];

  return questionAnswer as QuestionAnswer | undefined;
};

export const updateQuestionAnswer = async (
  id: string,
  questionAnswerUpdateObj: QuestionAnswerCreateObject
) => {
  const result = await supabase
    .from("questionAnswers")
    .update(questionAnswerUpdateObj)
    .eq("id", id)
    .select();
  const questionAnswer = result.data?.[0];

  return questionAnswer as QuestionAnswer | undefined;
};
