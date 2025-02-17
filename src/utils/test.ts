import type { QiuzStatus } from "@/types/test";
import { ResultType } from "@/types/testResult";
import type { TestSession } from "@/types/testSession";

export function getTestStatus(test: {
  sessions: (TestSession & { result: { resultType: ResultType } | null })[];
}): QiuzStatus {
  const latestSession = test.sessions[0];

  if (!latestSession) return "none";
  if (!latestSession.result) return "started";

  return ResultType.Correct ? "passed" : "failed";
}
