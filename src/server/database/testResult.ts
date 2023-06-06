import type {
  TestResult,
  TestResultAdminData,
  TestResultCreateObject,
  TestResultPreview,
} from "@/types/testResult";
import { supabase } from "./supabase";
import {
  complexityToScoreMap,
  shuffleQuestionsForTest,
} from "@/utils/questions";
import {
  AnswerType,
  DetailedAnswerData,
  QuestionAnswer,
} from "@/types/questionAnswer";
import { QuestionComplexity } from "@/types/question";
import { questionAnswerFragment } from "./fragments";
import { Test } from "@/types/test";
import { getTestById } from "./test";

export const getTestResults = async (testId: string, userId: string) => {
  const response = await supabase
    .from("test_results")
    .select()
    .eq("testId", testId)
    .eq("userId", userId);
  return response.data as TestResult[] | null;
};

export const getTestResultsByTest = async (testId: string) => {
  const response = await supabase
    .from("test_results")
    .select()
    .eq("testId", testId);
  return response.data as TestResult[] | null;
};

export const getTestResultsByUser = async (userId: string) => {
  const response = await supabase
    .from("test_results")
    .select("*, tests ( * )")
    .eq("userId", userId);
  return response.data as TestResultPreview[] | null;
};

export const getTestResultById = async (id: string) => {
  const response = await supabase.from("test_results").select().eq("id", id);
  return response.data?.[0] as TestResult | null;
};

export const getTestResultWithTest = async (id: string) => {
  const testResult = await getTestResultById(id);
  if (!testResult) return null;

  const test = await getTestById(testResult.testId);
  if (!test || !test.questions) return null;

  const { questions, minimumScore, questionsCount } = test;
  const questionShuffled = shuffleQuestionsForTest({
    questions,
    minimumScore,
    questionsCount,
    testSessionId: testResult.testSessionId,
  });

  const questionAnswersResponse = await supabase
    .from("question_answers")
    .select(questionAnswerFragment)
    .eq("testSessionId", testResult.testSessionId);
  const questionAnswers = questionAnswersResponse.data as
    | QuestionAnswer[]
    | null;
  if (!questionAnswers) return;

  return {
    testResult: {
      ...testResult,
      answers: questionAnswers,
    } as TestResult,
    test: {
      ...test,
      questions: questionShuffled,
    } as Test,
  };
};

export const getTestResultsForAdmin = async (testId: String) => {
  const result = await supabase
    .from("test_results")
    .select(
      "*, tests ( id, name, authorId, questionsCount, minimumScore ), users ( * )"
    )
    .eq("testId", testId);
  return (result.data ?? []) as TestResultAdminData[];
};

export const createTestResult = async (
  testResultCreateObj: TestResultCreateObject
) => {
  const { answers } = testResultCreateObj;

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
        testSessionId: testResultCreateObj.testSessionId,
        answerData: detailedAnswer,
        answerType: questionAnswerType,
        score,
      });
    }

    const result = await supabase
      .from("test_results")
      .insert({
        testId: testResultCreateObj.testId,
        userId: testResultCreateObj.userId,
        testSessionId: testResultCreateObj.testSessionId,
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

    const testResult = result.data?.[0];
    return testResult as TestResult | undefined;
  } catch (err) {
    console.error(err);
    return;
  }
};

export const updateTestResult = async (
  id: string,
  testResultUpdateObj: TestResultCreateObject
) => {
  const result = await supabase
    .from("test_results")
    .update(testResultUpdateObj)
    .eq("id", id)
    .select();
  const testResult = result.data?.[0];

  return testResult as TestResult | undefined;
};
