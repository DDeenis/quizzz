import type { TestResult, TestResultCreateObject } from "@/types/testResult";
import { supabase } from "./supabase";

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
  const result = await supabase
    .from("testResults")
    .insert(testResultCreateObj)
    .select();
  const testResult = result.data?.[0];

  return testResult as TestResult | undefined;
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
