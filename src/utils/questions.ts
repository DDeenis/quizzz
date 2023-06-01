import {
  type Question,
  QuestionComplexity,
  type QuestionCreateObject,
} from "@/types/question";
import { TestSession } from "@/types/testSession";

export const complexityToScoreMap = {
  [QuestionComplexity.Low]: 1,
  [QuestionComplexity.Medium]: 2,
  [QuestionComplexity.High]: 3,
};

export const getTotalScore = (
  questions: (Question | QuestionCreateObject)[]
) => {
  let totalScore = 0;
  for (let q of questions) {
    totalScore += complexityToScoreMap[q.complexity];
  }
  return totalScore;
};

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
  const nowISO = getISOnow();
  const expires = getISODate(testSession.expires);

  if (nowISO >= expires || testSession.isFinished) {
    return true;
  }

  return false;
};

function getISOnow() {
  const date = new Date();
  const str = date.toISOString().slice(0, -5);
  return Date.parse(str);
}

function getISODate(dateISOStr: string) {
  const str = dateISOStr.slice(0, -10);
  return Date.parse(str);
}

export function getISODistanceToInSeconds(date: string) {
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
