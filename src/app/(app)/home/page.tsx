"use server";
import HomePage from "@/components/pages/home/HomePage";
import ProtectedRoute from "@/components/ProtectedRoute";
import { getLatestTests, getRecommendations } from "@/server/db/test";
import type { TestPreview } from "@/types/test";
import { getLoggedInUser } from "@/utils/session";

export default async function Page() {
  const user = await getLoggedInUser();
  const [recommendations, latestQizzes] = (await Promise.allSettled([
    getRecommendations(user.id),
    getLatestTests(),
  ]).then((res) =>
    res.map((val) => (val.status === "fulfilled" ? val.value : []))
  )) as [TestPreview[], TestPreview[]];

  return (
    <ProtectedRoute>
      <HomePage
        userStats={{
          testsStarted: 12,
          testsPassedPercentage: 80,
          streak: 5,
        }}
        recommendations={recommendations}
        latestTests={latestQizzes}
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
