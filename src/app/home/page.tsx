"use server";
import HomePage from "@/components/pages/home/HomePage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { db } from "@/server/db";
import { AnswerType } from "@/types/questionAnswer";
import type { QuizSession } from "@/types/quizSession";

const mockUser = {
  id: "1",
  name: "John Doe",
  email: "johndoe@example.com",
  emailVerified: true,
  isAdmin: false,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

type QiuzStatus = "none" | "started" | "passed" | "failed";

function getQuizStatus(quiz: {
  sessions: (QuizSession & { result: { resultType: AnswerType } | null })[];
}): QiuzStatus {
  const latestSession = quiz.sessions[0];

  if (!latestSession) return "none";
  if (!latestSession.result) return "started";

  switch (latestSession.result.resultType) {
    case AnswerType.Correct:
    case AnswerType.PartiallyCorrect:
      return "passed";
    case AnswerType.Incorrect:
      return "failed";
  }
}

export default async function Page() {
  // TODO: implement recommendations based on rating and categories (from )
  const recommendations = await db.query.quizzes
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
      orderBy: (quizzes, { desc }) => [desc(quizzes.createdAt)],
      limit: 8,
    })
    .then((result) => result.map((q) => ({ ...q, status: getQuizStatus(q) })));
  const latestQizzes = await db.query.quizzes
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
      orderBy: (quizzes, { desc }) => [desc(quizzes.createdAt)],
      limit: 8,
    })
    .then((result) => result.map((q) => ({ ...q, status: getQuizStatus(q) })));

  return (
    <ProtectedRoute>
      <HomePage
        user={mockUser}
        userStats={{
          quizzesStarted: 12,
          quizzesPassedPercentage: 80,
          streak: 5,
        }}
        recommendations={recommendations}
        latestQuizzes={latestQizzes}
        categories={[]}
        quoteOfTheDay={{
          quote:
            "To know, is to know that you know nothing. That is the meaning of true knowledge.",
          author: "Socrates",
        }}
      />
    </ProtectedRoute>
  );
}
