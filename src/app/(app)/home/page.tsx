"use server";
import HomePage from "@/components/pages/home/HomePage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getLatestQuizzes, getRecommendations } from "@/server/db/quiz";
import type { QuizPreview } from "@/types/quiz";
import { getLoggedInUser } from "@/utils/session";

export default async function Page() {
  const user = await getLoggedInUser();
  const [recommendations, latestQizzes] = (await Promise.allSettled([
    getRecommendations(user.id),
    getLatestQuizzes(),
  ]).then((res) =>
    res.map((val) => (val.status === "fulfilled" ? val.value : []))
  )) as [QuizPreview[], QuizPreview[]];

  return (
    <ProtectedRoute>
      <HomePage
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
