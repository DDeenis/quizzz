import { cache } from "react";
import { db } from ".";
import { getQuizStatus } from "@/utils/quiz";
import { eq, inArray } from "drizzle-orm";
import { quizResults, quizzes } from "./schema";

export const getRecommendations = cache(async (userId: string) => {
  const categoriesFromPrevQuizzes = await db.query.quizResults.findMany({
    columns: {},
    where: eq(quizResults.userId, userId),
    with: {
      quiz: {
        columns: {},
        with: {
          category: {
            columns: {
              id: true,
            },
          },
        },
      },
    },
    limit: 4,
  });
  const ids = categoriesFromPrevQuizzes
    .map((v) => v.quiz.category?.id)
    .filter((id) => id !== undefined);

  return await db.query.quizzes
    .findMany({
      columns: {
        id: true,
        name: true,
        imageOrPattern: true,
        time: true,
        questionsCount: true,
        slug: true,
      },
      where: inArray(quizzes.categoryId, ids),
      with: {
        sessions: {
          limit: 1,
          orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
          with: {
            result: {
              columns: {
                resultType: true,
              },
            },
          },
        },
      },
      orderBy: (quizzes, { desc }) => [
        desc(quizzes.createdAt),
        desc(quizzes.rating),
      ],
      limit: 8,
    })
    .then((result) => result.map((q) => ({ ...q, status: getQuizStatus(q) })));
});

export const getLatestQuizzes = cache(async () => {
  return await db.query.quizzes
    .findMany({
      columns: {
        id: true,
        name: true,
        imageOrPattern: true,
        time: true,
        questionsCount: true,
        slug: true,
      },
      with: {
        sessions: {
          limit: 1,
          orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
          with: {
            result: {
              columns: {
                resultType: true,
              },
            },
          },
        },
      },
      orderBy: (quizzes, { desc }) => [
        desc(quizzes.rating),
        desc(quizzes.createdAt),
      ],
      limit: 8,
    })
    .then((result) => result.map((q) => ({ ...q, status: getQuizStatus(q) })));
});
