export const questionFragment = `
    id,
    quizId,
    questionType,
    complexity,
    questionData,
    answerData,
    createdAt,
    image
`;

export const quizFragment = `
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
    attempts,
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
    quizSessionId
`;

export const quizResultFragment = `
    id,
    quizId,
    userId,
    quizSessionId,
    score,
    maxScore,
    countCorrect,
    countIncorrect,
    createdAt,
    question_answers (
        ${questionAnswerFragment}
    )
`;
