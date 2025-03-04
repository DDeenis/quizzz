import { type Test, TestStatus } from "@/types/test";
import { ResultType } from "@/types/testResult";
import type { TestSession } from "@/types/testSession";
import type { TestFormType } from "./forms/test-form";

export function getTestStatus(test: {
  sessions: (TestSession & { result: { resultType: ResultType } | null })[];
}): TestStatus {
  const latestSession = test.sessions[0];

  if (!latestSession) return TestStatus.None;
  if (!latestSession.result) return TestStatus.Started;

  return ResultType.Passed ? TestStatus.Passed : TestStatus.Failed;
}

export const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/webp",
  "image/jpeg",
  "image/png",
];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function validateImageSize(image: File) {
  return image.size <= MAX_IMAGE_SIZE;
}

export function validateImageType(file: File) {
  return ACCEPTED_IMAGE_MIME_TYPES.includes(file.type);
}

export function convertTestToFormValues(test: Test): TestFormType {
  return {
    name: test.name,
    description: test.description ?? undefined,
    questionsCount: test.questionsCount,
    autoScore: test.autoScore,
    minimumCorrectAnswers: test.minimumCorrectAnswers,
    attempts: test.attempts ?? undefined,
    timeInMinutes: test.timeInMinutes ?? undefined,
    image: undefined,
    questions: test.questions.map((q) => ({
      ...q,
      description: q.description ?? undefined,
      image: undefined,
    })),
  };
}
