import type { QiuzStatus } from "@/types/quiz";
import { ResultType } from "@/types/quizResult";
import type { QuizSession } from "@/types/quizSession";

export function getQuizStatus(quiz: {
  sessions: (QuizSession & { result: { resultType: ResultType } | null })[];
}): QiuzStatus {
  const latestSession = quiz.sessions[0];

  if (!latestSession) return "none";
  if (!latestSession.result) return "started";

  return ResultType.Correct ? "passed" : "failed";
}
