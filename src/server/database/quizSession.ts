import {
  QuizSession,
  QuizSessionCreateObject,
  QuizSessionWithQuiz,
} from "@/types/quizSession";
import { supabase } from "./supabase";
import { getISODate, sortQuizSessions } from "@/utils/questions";

export const getQuizSessions = async (quizId: string, userId: string) => {
  const response = await supabase
    .from("quiz_sessions")
    .select()
    .eq("quizId", quizId)
    .eq("userId", userId);
  return response.data as QuizSession[] | null;
};

export const getUserQuizSessions = async (userId: string) => {
  const response = await supabase
    .from("quiz_sessions")
    .select("*, quizes ( name )")
    .eq("userId", userId);
  return response.data as QuizSessionWithQuiz[] | null;
};

export const getQuizSessionsCount = async (quizId: string, userId: string) => {
  const response = await supabase
    .from("quiz_sessions")
    .select("*", { count: "exact", head: true })
    .eq("quizId", quizId)
    .eq("userId", userId);

  return response.count;
};

export const getLatestQuizSession = async (quizId: string, userId: string) => {
  const response = await supabase
    .from("quiz_sessions")
    .select()
    .eq("quizId", quizId)
    .eq("userId", userId);

  if (!response.data) {
    console.error(response.error);
    return null;
  }

  const quizSessions = sortQuizSessions(response.data as QuizSession[]);

  return quizSessions?.[0] as QuizSession | null;
};

export const getQuizSessionById = async (id: string) => {
  const response = await supabase.from("quiz_sessions").select().eq("id", id);
  return response.data?.[0] as QuizSession | null;
};

export const createQuizSession = async (
  quizId: string,
  userId: string,
  timeInMinutes: number
) => {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + timeInMinutes);
  const result = await supabase
    .from("quiz_sessions")
    .insert<QuizSessionCreateObject>({
      quizId,
      userId,
      createdAt: new Date().toISOString(),
      expires: expires.toISOString(),
    })
    .select();
  const quizSession = result.data?.[0];

  return quizSession as QuizSession | undefined;
};

export const updateQuizSession = async (
  id: string,
  quizSessionUpdateObj: QuizSessionCreateObject
) => {
  const result = await supabase
    .from("quiz_sessions")
    .update(quizSessionUpdateObj)
    .eq("id", id)
    .select();
  const quizSession = result.data?.[0];

  return quizSession as QuizSession | undefined;
};

export const removeQuizSession = async (id: string) => {
  const result = await supabase.from("quiz_sessions").delete().eq("id", id);
  return result.error ? false : true;
};
