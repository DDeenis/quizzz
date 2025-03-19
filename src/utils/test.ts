import { TestStatus } from "@/types/test";
import { ResultType } from "@/types/testResult";
import type { TestSession } from "@/types/testSession";

export function getTestStatus(test: {
  sessions: (TestSession & { result: { resultType: ResultType } | null })[];
}): TestStatus {
  const latestSession = test.sessions[0];

  if (!latestSession) return TestStatus.None;
  if (!latestSession.result) return TestStatus.Started;

  return latestSession.result.resultType === ResultType.Passed
    ? TestStatus.Passed
    : TestStatus.Failed;
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
