import { QuizInfoCard } from "@/components/QuizInfoCard";
import { useProtectedSession } from "@/hooks/session";
import { api } from "@/utils/api";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function StartQuizPage() {
  const router = useRouter();
  const { quizId } = router.query;
  const { data } = useProtectedSession();
  const quiz = api.quizes.getPreviewById.useQuery(
    { quizId: (quizId as string | undefined) ?? "" },
    { enabled: false }
  );
  const createQuizSession = api.studentQuizes.createQuizSession.useMutation();
  const canStartQuiz = api.studentQuizes.canStartQuiz.useQuery(
    {
      quizId: quizId as string,
    },
    { enabled: false }
  );

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    void quiz.refetch();
    void canStartQuiz.refetch();
  }, [quizId, router.isReady]);

  const onStartQuiz = () => {
    if (!canStartQuiz.data?.canStart || !quiz.data) return;

    createQuizSession
      .mutateAsync({
        quizId: quizId as string,
        timeInMinutes: quiz.data.time,
      })
      .then((s) => s && router.push(`/quiz/${quiz.data?.id}/start/${s.id}`))
      .catch(console.error);
  };

  return (
    <>
      <Head>
        <title>Start quiz {quiz.data?.name}</title>
      </Head>
      {quiz.isLoading ? (
        <Typography variant="body2">Loading...</Typography>
      ) : quiz.data ? (
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          height={"100%"}
        >
          <QuizInfoCard
            quizInfo={quiz.data}
            contentSection={
              canStartQuiz.data?.canStart ? (
                <>
                  <Typography variant="body2">
                    Attempts left:{" "}
                    {canStartQuiz.data.attempts === null
                      ? "unlimited"
                      : canStartQuiz.data.attempts -
                        Number(canStartQuiz.data.currentAttemptsCount)}
                  </Typography>
                  <Typography variant="body2">
                    If you close this quiz before you have completed it, your
                    answers will not be saved.
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color={"red"}>
                  You have used all attempts to pass the quiz
                </Typography>
              )
            }
            actionsSection={
              <>
                <Link href={"/quiz"}>
                  <Button>Cancel</Button>
                </Link>
                <Button
                  variant="contained"
                  sx={{ ml: 1 }}
                  onClick={onStartQuiz}
                  disabled={!canStartQuiz.data?.canStart}
                >
                  {createQuizSession.isPending ? "Loading..." : "Start quiz"}
                </Button>
              </>
            }
          />
        </Box>
      ) : (
        <Typography variant="body2" color={"red"}>
          Failed to load quiz
        </Typography>
      )}
    </>
  );
}
