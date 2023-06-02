import type { Test, TestCreateObject, TestUpdateObject } from "@/types/test";
import { supabase } from "./supabase";
import { testFragment } from "./fragments";
import { getTotalScore, shuffleQuestionsForTest } from "@/utils/questions";
import { getTestSessionById } from "./testSession";

export const getAllTestsPreview = async () => {
  const response = await supabase.from("tests").select().is("deletedAt", null);
  return response.data as Omit<Test, "questions">[] | null;
};

export const getAllTestsPreviewWithDeleted = async () => {
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

export const getTestPreviewById = async (id: string) => {
  const matches = await supabase.from("tests").select().eq("id", id);
  const test = matches.data?.[0];

  return test as Omit<Test, "questions"> | undefined;
};

export const getTestWithSession = async (id: string, testSessionId: string) => {
  const testSession = await getTestSessionById(testSessionId);

  if (!testSession) return null;

  const matches = await supabase
    .from("tests")
    .select(testFragment)
    .eq("id", id);
  const test = matches.data?.[0] as Test | undefined;

  if (!test || !test.questions) return;

  const { questionsCount, minimumScore, questions } = test;
  const questionsForTest = shuffleQuestionsForTest({
    questions,
    minimumScore,
    questionsCount,
    testSessionId,
  });

  return {
    testSession,
    test: {
      ...test,
      questions: questionsForTest,
    } as Test,
  };
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
