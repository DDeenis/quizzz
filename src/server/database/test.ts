import type { Test, TestCreateObject } from "@/types/test";
import { supabase } from "./supabase";
import { testFragment } from "./fragments";

export const getAllTests = async () => {
  const response = await supabase.from("tests").select(testFragment);
  console.log(response);
  return response.data as Test[] | null;
};

export const getTestsByAuthor = async (authorId: string) => {
  const response = await supabase
    .from("tests")
    .select()
    .eq("authorId", authorId);
  return response.data as Test[] | null;
};

export const getTestById = async (id: string) => {
  const matches = await supabase.from("tests").select().eq("id", id);
  const test = matches.data?.[0];

  return test as Test | undefined;
};

export const createTest = async (testCreateObj: TestCreateObject) => {
  const result = await supabase.from("tests").insert(testCreateObj).select();
  const test = result.data?.[0];

  return test as Test | undefined;
};

export const updateTest = async (
  id: string,
  testUpdateObj: TestCreateObject
) => {
  const result = await supabase
    .from("tests")
    .update(testUpdateObj)
    .eq("id", id)
    .select();
  const test = result.data?.[0];

  return test as Test | undefined;
};
