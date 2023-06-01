import type { TestResult, TestResultCreateObject } from "@/types/testResult";
import { supabase } from "./supabase";
import { complexityToScoreMap, getTotalScore } from "@/utils/questions";
import {
  AnswerType,
  DetailedAnswerData,
  QuestionAnswer,
} from "@/types/questionAnswer";
import { QuestionComplexity } from "@/types/question";

export const getTestResults = async (testId: string, userId: string) => {
  const response = await supabase
    .from("testResults")
    .select()
    .eq("testId", testId)
    .eq("userId", userId);
  return response.data as TestResult[] | null;
};

export const getTestResultsByTest = async (testId: string) => {
  const response = await supabase
    .from("testResults")
    .select()
    .eq("testId", testId);
  return response.data as TestResult[] | null;
};

export const getTestResultsByUser = async (userId: string) => {
  const response = await supabase
    .from("testResults")
    .select()
    .eq("userId", userId);
  return response.data as TestResult[] | null;
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
        countIncorrect >= totalAnswers
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
        randomSeed: testResultCreateObj.randomSeed,
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
        randomSeed: testResultCreateObj.randomSeed,
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
    .from("testResults")
    .update(testResultUpdateObj)
    .eq("id", id)
    .select();
  const testResult = result.data?.[0];

  return testResult as TestResult | undefined;
};
