import {
  type Question,
  QuestionComplexity,
  type QuestionCreateObject,
} from "@/types/question";

const complexityToScoreMap = {
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
