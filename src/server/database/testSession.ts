import { TestSession, TestSessionCreateObject } from "@/types/testSession";
import { supabase } from "./supabase";

export const getTestSession = async (testId: string, userId: string) => {
  const response = await supabase
    .from("test_sessions")
    .select()
    .eq("testId", testId)
    .eq("userId", userId);
  return response.data?.[0] as TestSession | null;
};

export const getTestSessionById = async (id: string) => {
  const response = await supabase.from("test_sessions").select().eq("id", id);
  return response.data?.[0] as TestSession | null;
};

export const createTestSession = async (
  testId: string,
  userId: string,
  timeInMinutes: number
) => {
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + timeInMinutes);
  const result = await supabase
    .from("test_sessions")
    .insert<TestSessionCreateObject>({
      testId,
      userId,
      createdAt: new Date().toISOString(),
      expires: expires.toISOString(),
    })
    .select();
  const testSession = result.data?.[0];

  return testSession as TestSession | undefined;
};

export const updateTestSession = async (
  id: string,
  testSessionUpdateObj: TestSessionCreateObject
) => {
  const result = await supabase
    .from("test_sessions")
    .update(testSessionUpdateObj)
    .eq("id", id)
    .select();
  const testSession = result.data?.[0];

  return testSession as TestSession | undefined;
};
