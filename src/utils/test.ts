import { TestStatus } from "@/types/test";
import { ResultType } from "@/types/testResult";
import type { TestSession } from "@/types/testSession";

export function getTestStatus(test: {
  sessions: (TestSession & { result: { resultType: ResultType } | null })[];
}): TestStatus {
  const latestSession = test.sessions[0];

  if (!latestSession) return TestStatus.None;
  if (!latestSession.result) return TestStatus.Started;

  return ResultType.Passed ? TestStatus.Passed : TestStatus.Failed;
}
