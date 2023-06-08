import type {
  QuizResult,
  QuizResultAdminData,
  QuizResultCreateObject,
  QuizResultPreview,
} from "@/types/quizResult";
import { supabase } from "./supabase";
import {
  complexityToScoreMap,
  shuffleQuestionsForQuiz,
} from "@/utils/questions";
import {
  AnswerType,
  DetailedAnswerData,
  QuestionAnswer,
} from "@/types/questionAnswer";
import { QuestionComplexity } from "@/types/question";
import { questionAnswerFragment } from "./fragments";
import { Quiz } from "@/types/quiz";
import { getQuizById } from "./quiz";

export const getQuizResults = async (quizId: string, userId: string) => {
  const response = await supabase
    .from("quiz_results")
    .select()
    .eq("quizId", quizId)
    .eq("userId", userId);
  return response.data as QuizResult[] | null;
};

export const getQuizResultsByQuiz = async (quizId: string) => {
  const response = await supabase
    .from("quiz_results")
    .select()
    .eq("quizId", quizId);
  return response.data as QuizResult[] | null;
};

export const getQuizResultsByUser = async (userId: string) => {
  const response = await supabase
    .from("quiz_results")
    .select("*, quizes ( * )")
    .eq("userId", userId);
  return response.data as QuizResultPreview[] | null;
};

export const getQuizResultById = async (id: string) => {
  const response = await supabase.from("quiz_results").select().eq("id", id);
  return response.data?.[0] as QuizResult | null;
};

export const getQuizResultWithQuiz = async (id: string) => {
  const quizResult = await getQuizResultById(id);
  if (!quizResult) return null;

  const quiz = await getQuizById(quizResult.quizId);
  if (!quiz || !quiz.questions) return null;

  const { questions, minimumScore, questionsCount } = quiz;
  const questionShuffled = shuffleQuestionsForQuiz({
    questions,
    minimumScore,
    questionsCount,
    quizSessionId: quizResult.quizSessionId,
  });

  const questionAnswersResponse = await supabase
    .from("question_answers")
    .select(questionAnswerFragment)
    .eq("quizSessionId", quizResult.quizSessionId);
  const questionAnswers = questionAnswersResponse.data as
    | QuestionAnswer[]
    | null;
  if (!questionAnswers) return;

  return {
    quizResult: {
      ...quizResult,
      answers: questionAnswers,
    } as QuizResult,
    quiz: {
      ...quiz,
      questions: questionShuffled,
    } as Quiz,
  };
};

export const getQuizResultsForAdmin = async (quizId: String) => {
  const result = await supabase
    .from("quiz_results")
    .select(
      "*, quizes ( id, name, authorId, questionsCount, minimumScore ), users ( * )"
    )
    .eq("quizId", quizId);
  return (result.data ?? []) as QuizResultAdminData[];
};

export const createQuizResult = async (
  quizResultCreateObj: QuizResultCreateObject
) => {
  const { answers } = quizResultCreateObj;

  try {
    const questions = await supabase
      .from("questions")
      .select("id, complexity, answerData, questionData")
      .filter(
        "id",
        "in",
        `(${answers.map((a) => `${a.questionId}`).join(",")})`
      );

    if (questions.error) throw questions.error;

    const questionAnswers: Omit<QuestionAnswer, "id">[] = [];
    let totalMaxScore = 0;

    for (let question of questions.data) {
      const answer = answers.find((a) => a.questionId === question.id);
      if (!answer) throw `No answer for question ${question.id}`;

      const detailedAnswer: DetailedAnswerData[] = [];
      let countCorrect = 0;
      let countIncorrect = 0;
      const totalAnswers = question.answerData.length;
      for (let variant of answer.answerData.variants) {
        const type = question.answerData.includes(variant)
          ? AnswerType.Correct
          : AnswerType.Incorrect;
        detailedAnswer.push({
          variant,
          answerType: type,
        });
        type === AnswerType.Correct ? ++countCorrect : ++countIncorrect;
      }

      const questionAnswerType =
        countIncorrect >= totalAnswers || countCorrect < totalAnswers / 2
          ? AnswerType.Incorrect
          : countCorrect === totalAnswers && countIncorrect === 0
          ? AnswerType.Correct
          : AnswerType.PartiallyCorrect;
      const maxScore =
        complexityToScoreMap[question.complexity as QuestionComplexity];
      const score =
        questionAnswerType === AnswerType.Correct
          ? maxScore
          : questionAnswerType === AnswerType.Incorrect
          ? 0
          : maxScore / 2;
      totalMaxScore += maxScore;
      questionAnswers.push({
        userId: answer.userId,
        questionId: question.id,
        quizSessionId: quizResultCreateObj.quizSessionId,
        answerData: detailedAnswer,
        answerType: questionAnswerType,
        score,
      });
    }

    const result = await supabase
      .from("quiz_results")
      .insert({
        quizId: quizResultCreateObj.quizId,
        userId: quizResultCreateObj.userId,
        quizSessionId: quizResultCreateObj.quizSessionId,
        score: questionAnswers.reduce((acc, qa) => acc + qa.score, 0),
        maxScore: totalMaxScore,
        countCorrect: questionAnswers.filter(
          (qa) => qa.answerType === AnswerType.Correct
        ).length,
        countIncorrect: questionAnswers.filter(
          (qa) =>
            qa.answerType === AnswerType.Incorrect ||
            qa.answerType === AnswerType.PartiallyCorrect
        ).length,
      })
      .select();

    if (result.error) throw result.error;

    const answersResult = await supabase
      .from("question_answers")
      .insert(questionAnswers);
    if (answersResult.error) throw answersResult.error;

    const quizResult = result.data?.[0];
    return quizResult as QuizResult | undefined;
  } catch (err) {
    console.error(err);
    return;
  }
};

export const updateQuizResult = async (
  id: string,
  quizResultUpdateObj: QuizResultCreateObject
) => {
  const result = await supabase
    .from("quiz_results")
    .update(quizResultUpdateObj)
    .eq("id", id)
    .select();
  const quizResult = result.data?.[0];

  return quizResult as QuizResult | undefined;
};
