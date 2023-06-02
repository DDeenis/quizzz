export const questionFragment = `
    id,
    testId,
    questionType,
    complexity,
    questionData,
    answerData,
    createdAt,
    image
`;

export const testFragment = `
    id,
    name,
    description,
    authorId,
    createdAt,
    deletedAt,
    time,
    questionsCount,
    minimumScore,
    maximumScore,
    questions ( 
        ${questionFragment}
    )
`;

export const questionAnswerFragment = `
    id,
    questionId,
    userId,
    answerType,
    answerData,
    score,
    testSessionId
`;

export const testResultFragment = `
    id,
    testId,
    userId,
    testSessionId,
    score,
    maxScore,
    countCorrect,
    countIncorrect,
    createdAt,
    question_answers (
        ${questionAnswerFragment}
    )
`;
