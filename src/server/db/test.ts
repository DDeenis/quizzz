import { cache } from "react";
import { db } from ".";
import { getTestStatus } from "@/utils/test";
import { eq, inArray } from "drizzle-orm";
import { testResults, tests } from "./schema";

export const getRecommendations = cache(async (userId: string) => {
  const categoriesFromPrevTests = await db.query.testResults.findMany({
    columns: {},
    where: eq(testResults.userId, userId),
    with: {
      test: {
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
  const ids = categoriesFromPrevTests
    .map((v) => v.test.category?.id)
    .filter((id) => id !== undefined);

  return await db.query.tests
    .findMany({
      columns: {
        id: true,
        name: true,
        imageOrPattern: true,
        time: true,
        questionsCount: true,
        slug: true,
      },
      where: inArray(tests.categoryId, ids),
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
      orderBy: (tests, { desc }) => [desc(tests.createdAt), desc(tests.rating)],
      limit: 8,
    })
    .then((result) => result.map((q) => ({ ...q, status: getTestStatus(q) })));
});

export const getLatestTests = cache(async () => {
  return await db.query.tests
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
      orderBy: (tests, { desc }) => [desc(tests.rating), desc(tests.createdAt)],
      limit: 8,
    })
    .then((result) => result.map((q) => ({ ...q, status: getTestStatus(q) })));
});
