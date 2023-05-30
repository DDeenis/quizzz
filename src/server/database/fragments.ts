export const questionAnswerFragment = `
    id,
    questionId,
    userId,
    answerType,
    answerData,
    testSessionId
`;

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
    questions ( 
        ${questionFragment}
    )
`;
