import type {
  Quiz,
  QuizClient,
  QuizCreateObject,
  QuizOption,
  QuizUpdateObject,
} from "@/types/quiz";
import { supabase } from "./supabase";
import { quizFragment } from "./fragments";
import { getTotalScore, shuffleQuestionsForQuiz } from "@/utils/questions";
import { getQuizSessionById } from "./quizSession";

export const getAllQuizesPreview = async () => {
  const response = await supabase.from("quizes").select().is("deletedAt", null);
  return response.data as Omit<Quiz, "questions">[] | null;
};

export const getAllQuizesPreviewWithDeleted = async () => {
  const response = await supabase.from("quizes").select();
  return response.data as Omit<Quiz, "questions">[] | null;
};

export const getQuizesByAuthor = async (authorId: string) => {
  const response = await supabase
    .from("quizes")
    .select(quizFragment)
    .eq("authorId", authorId);
  return response.data as Quiz[] | null;
};

export const getQuizById = async (id: string) => {
  const matches = await supabase
    .from("quizes")
    .select(quizFragment)
    .eq("id", id);
  const quiz = matches.data?.[0];

  return quiz as Quiz | undefined;
};

export const getQuizPreviewById = async (id: string) => {
  const matches = await supabase.from("quizes").select().eq("id", id);
  const quiz = matches.data?.[0];

  return quiz as Omit<Quiz, "questions"> | undefined;
};

export const getQuizWithSession = async (id: string, quizSessionId: string) => {
  const quizSession = await getQuizSessionById(quizSessionId);

  if (!quizSession) return null;

  const matches = await supabase
    .from("quizes")
    .select(quizFragment)
    .eq("id", id);
  const quiz = matches.data?.[0] as Quiz | undefined;

  if (!quiz || !quiz.questions) return;

  const { questionsCount, minimumScore, questions } = quiz;
  const questionsForQuiz = shuffleQuestionsForQuiz({
    questions,
    minimumScore,
    questionsCount,
    quizSessionId,
  });

  return {
    quizSession,
    quiz: {
      ...quiz,
      questions: questionsForQuiz.map((q) => ({
        ...q,
        questionData: {
          ...q.questionData,
          variants: q.questionData.variants.map((v) => v.variant),
        },
      })),
    } as QuizClient,
  };
};

export const getQuizesAsOptions = async () => {
  const result = await supabase.from("quizes").select("id, name");
  return (result.data ?? []) as QuizOption[];
};

export const getQuizAttempts = async (quizId: string) => {
  const result = await supabase
    .from("quizes")
    .select("attempts")
    .eq("id", quizId);

  return result.data?.[0]?.attempts as number | null;
};

export const createQuiz = async (quizCreateObj: QuizCreateObject) => {
  try {
    const resultQuiz = await supabase
      .from("quizes")
      .insert({
        name: quizCreateObj.name,
        description: quizCreateObj.description,
        authorId: quizCreateObj.authorId,
        time: quizCreateObj.time,
        questionsCount: quizCreateObj.questionsCount,
        minimumScore: quizCreateObj.minimumScore,
        maximumScore: getTotalScore(quizCreateObj.questions),
        attempts: quizCreateObj.attempts,
      })
      .select();
    const createdQuiz = resultQuiz.data?.[0];

    if (!createdQuiz) throw resultQuiz.error;

    const { error } = await supabase
      .from("questions")
      .insert(
        quizCreateObj.questions.map((q) => ({ ...q, quizId: createdQuiz.id }))
      );

    if (error) throw error;
  } catch (err) {
    console.error(err);
    return false;
  }

  return true;
};

export const updateQuiz = async (
  id: string,
  quizUpdateObj: QuizUpdateObject,
  deletedQuestionIds?: string[] | null
) => {
  try {
    const { error } = await supabase
      .from("quizes")
      .update({
        name: quizUpdateObj.name,
        description: quizUpdateObj.description,
        authorId: quizUpdateObj.authorId,
        time: quizUpdateObj.time,
        questionsCount: quizUpdateObj.questionsCount,
        minimumScore: quizUpdateObj.minimumScore,
        maximumScore: getTotalScore(quizUpdateObj.questions),
        attempts: quizUpdateObj.attempts,
      })
      .eq("id", id);

    if (error) throw error;

    quizUpdateObj.questions.forEach(async (q) => {
      if (q.id) {
        const { error } = await supabase
          .from("questions")
          .update(q)
          .eq("id", q.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("questions")
          .insert({ ...q, quizId: id });

        if (error) throw error;
      }
    });

    if (deletedQuestionIds) {
      deletedQuestionIds.forEach(async (qId) => {
        await supabase.from("questions").delete().eq("id", qId);
      });
    }
  } catch (err) {
    console.error(err);
    return false;
  }

  return true;
};

export const deleteQuiz = async (id: string) => {
  try {
    const { error } = await supabase
      .from("quizes")
      .update({
        deletedAt: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    console.error(err);
    return false;
  }

  return true;
};

export const restoreQuiz = async (id: string) => {
  try {
    const { error } = await supabase
      .from("quizes")
      .update({
        deletedAt: null,
      })
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    console.error(err);
    return false;
  }

  return true;
};
