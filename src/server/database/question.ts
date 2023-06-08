import type { Question, QuestionCreateObject } from "@/types/question";
import { supabase } from "./supabase";

export const getQuestionsByQuiz = async (quizId: string) => {
  const response = await supabase
    .from("questions")
    .select()
    .eq("quizId", quizId);
  return response.data as Question[] | null;
};

export const getQuestionById = async (id: string) => {
  const matches = await supabase.from("questions").select().eq("id", id);
  const question = matches.data?.[0];

  return question as Question | undefined;
};

export const createQuestion = async (
  questionCreateObj: QuestionCreateObject
) => {
  const result = await supabase
    .from("questions")
    .insert(questionCreateObj)
    .select();
  const question = result.data?.[0];

  return question as Question | undefined;
};

export const updateQuestion = async (
  id: string,
  questionUpdateObj: QuestionCreateObject
) => {
  const result = await supabase
    .from("questions")
    .update(questionUpdateObj)
    .eq("id", id)
    .select();
  const question = result.data?.[0];

  return question as Question | undefined;
};
