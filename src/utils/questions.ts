import { type Question } from "@/types/question";
import type { TestSession } from "@/types/testSession";

export const shuffleArray = <T>(array: T[], seed?: number) => {
  const random = seed ? mulberry32(seed) : Math.random;
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = temp;
  }
  return copy;
};

export const isTestSessionExpired = (testSession: TestSession) => {
  if (!testSession.expiresAt) return false;
  const nowISO = getISOnow();
  const expires = getISODate(testSession.expiresAt);
  return nowISO >= expires;
};

function getISOnow() {
  const date = new Date();
  const str = date.toISOString().slice(0, -5);
  return Date.parse(str);
}

export function getISODate(dateISOStr: Date) {
  const str = dateISOStr.toISOString();
  return Date.parse(str);
}

export function getISODistanceToInSeconds(date: Date) {
  const dateMs = getISODate(date);
  const now = getISOnow();
  return (dateMs - now) / 1000;
}

export const hashFromString = (source: string) => {
  let sum = 0;
  for (let i = 0; i < source.length; i++) {
    sum += source.charCodeAt(i);
  }
  return Math.floor((sum * 23) / 16);
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleQuestionsForTest({
  questions,
  questionsCount,
  testSessionId,
}: {
  questions: Question[];
  questionsCount: number;
  testSessionId: string;
}) {
  const randomSeed = hashFromString(testSessionId);
  const questionsShuffled = shuffleArray(questions, randomSeed);
  let questionsForTest: Question[] = [];

  let i = 0;
  while (questionsForTest.length < questionsCount) {
    const question = questionsShuffled[i++];
    // this probably won't happen, but just in case return all questions
    if (!question) {
      console.error(
        `Something went wrong while selecting questions for test session ${testSessionId}`
      );
      questionsForTest = questionsShuffled;
      break;
    }
    questionsForTest.push(question);
  }

  return questionsForTest.map((q) => ({
    ...q,
    answerData: {
      variants: shuffleArray(q.answers),
    },
  }));
}

export const formatDate = (date: Date) => {
  return `${date.toLocaleDateString()} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};
