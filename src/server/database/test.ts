import type { Test, TestCreateObject, TestUpdateObject } from "@/types/test";
import { supabase } from "./supabase";
import { testFragment } from "./fragments";
import { getTotalScore, hashFromString, shuffleArray } from "@/utils/questions";
import { Question } from "@/types/question";
import { getTestSessionById } from "./testSession";

export const getAllTests = async () => {
  const response = await supabase.from("tests").select().is("deletedAt", null);
  return response.data as Omit<Test, "questions">[] | null;
};

export const getAllTestsWithDeleted = async () => {
  const response = await supabase.from("tests").select();
  return response.data as Omit<Test, "questions">[] | null;
};

export const getTestsByAuthor = async (authorId: string) => {
  const response = await supabase
    .from("tests")
    .select(testFragment)
    .eq("authorId", authorId);
  return response.data as Test[] | null;
};

export const getTestById = async (id: string) => {
  const matches = await supabase
    .from("tests")
    .select(testFragment)
    .eq("id", id);
  const test = matches.data?.[0];

  return test as Test | undefined;
};

export const getTestWithSession = async (id: string, testSessionId: string) => {
  const testSession = await getTestSessionById(testSessionId);

  if (!testSession) return null;

  const randomSeed = hashFromString(testSessionId);

  const matches = await supabase
    .from("tests")
    .select(testFragment)
    .eq("id", id);
  const test = matches.data?.[0] as Test | undefined;

  if (!test || !test.questions) return;

  const { questionsCount, minimumScore, questions } = test;
  const questionsShuffled = shuffleArray(questions, randomSeed);
  let questionsForTest: Question[] = [];

  let i = 0;
  while (
    getTotalScore(questionsForTest) < minimumScore ||
    questionsForTest.length < questionsCount
  ) {
    const question = questionsShuffled[i++];
    // this probably won't happen, but just in case return all questions
    if (!question) {
      console.error(
        `Something went wrong while selecting questions for test ${test.id}`
      );
      questionsForTest = questionsShuffled;
      break;
    }
    questionsForTest.push(question);
  }

  return {
    testSession,
    test: {
      ...test,
      questions: questionsForTest.map((q) => ({
        ...q,
        questionData: {
          ...q.questionData,
          variants: shuffleArray(q.questionData.variants),
        },
      })),
    } as Test,
  };
};

export const getTestForStudent = async (id: string) => {
  const matches = await supabase
    .from("tests")
    .select(testFragment)
    .eq("id", id);
  const test = matches.data?.[0] as Test | undefined;

  if (!test || !test.questions) return;

  const { questionsCount, minimumScore, questions } = test;
  const questionsShuffled = shuffleArray(questions);
  // const questionsSorted = questions.sort((q1, q2) => q1.complexity === );
  let questionsForTest: Question[] = [];

  let i = 0;
  while (
    getTotalScore(questionsForTest) < minimumScore ||
    questionsForTest.length < questionsCount
  ) {
    const question = questionsShuffled[i++];
    // this probably won't happen, but just in case return all questions
    if (!question) {
      console.error(
        `Something went wrong while selecting questions for test ${test.id}`
      );
      questionsForTest = questionsShuffled;
      break;
    }
    questionsForTest.push(question);
  }

  return {
    ...test,
    questions: questionsForTest.map((q) => ({
      ...q,
      questionData: {
        ...q.questionData,
        variants: shuffleArray(q.questionData.variants),
      },
    })),
  } as Test;
};

export const createTest = async (testCreateObj: TestCreateObject) => {
  try {
    const resultTest = await supabase
      .from("tests")
      .insert({
        name: testCreateObj.name,
        description: testCreateObj.description,
        authorId: testCreateObj.authorId,
        time: testCreateObj.time,
        questionsCount: testCreateObj.questionsCount,
        minimumScore: testCreateObj.minimumScore,
        maximumScore: getTotalScore(testCreateObj.questions),
      })
      .select();
    const createdTest = resultTest.data?.[0];

    if (!createdTest) throw resultTest.error;

    const { error } = await supabase
      .from("questions")
      .insert(
        testCreateObj.questions.map((q) => ({ ...q, testId: createdTest.id }))
      );

    if (error) throw error;
  } catch (err) {
    console.log(err);
    return false;
  }

  return true;
};

export const updateTest = async (
  id: string,
  testUpdateObj: TestUpdateObject,
  deletedQuestionIds?: string[] | null
) => {
  try {
    const { error } = await supabase
      .from("tests")
      .update({
        name: testUpdateObj.name,
        description: testUpdateObj.description,
        authorId: testUpdateObj.authorId,
        time: testUpdateObj.time,
        questionsCount: testUpdateObj.questionsCount,
        minimumScore: testUpdateObj.minimumScore,
        maximumScore: getTotalScore(testUpdateObj.questions),
      })
      .eq("id", id);

    if (error) throw error;

    testUpdateObj.questions.forEach(async (q) => {
      if (q.id) {
        const { error } = await supabase
          .from("questions")
          .update(q)
          .eq("id", q.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("questions")
          .insert({ ...q, testId: id });

        if (error) throw error;
      }
    });

    if (deletedQuestionIds) {
      deletedQuestionIds.forEach(async (qId) => {
        await supabase.from("questions").delete().eq("id", qId);
      });
    }
  } catch (err) {
    console.log(err);
    return false;
  }

  return true;
};

export const deleteTest = async (id: string) => {
  try {
    const { error } = await supabase
      .from("tests")
      .update({
        deletedAt: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    console.log(err);
    return false;
  }

  return true;
};

export const restoreTest = async (id: string) => {
  try {
    const { error } = await supabase
      .from("tests")
      .update({
        deletedAt: null,
      })
      .eq("id", id);

    if (error) throw error;
  } catch (err) {
    console.log(err);
    return false;
  }

  return true;
};
