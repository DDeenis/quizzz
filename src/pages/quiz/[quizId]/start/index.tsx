import { QuizInfoCard } from "@/components/QuizInfoCard";
import { useProtectedSession } from "@/hooks/session";
import { api } from "@/utils/api";
import { getTotalScore } from "@/utils/questions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function StartQuizPage() {
  const router = useRouter();
  const { quizId } = router.query;
  const { data } = useProtectedSession();
  const {
    data: quiz,
    isLoading,
    refetch,
  } = api.quizes.getById.useQuery(
    { quizId: (quizId as string | undefined) ?? "" },
    { enabled: false }
  );
  const { mutateAsync, isLoading: isLoadingStart } =
    api.studentQuizes.createQuizSession.useMutation();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    refetch();
  }, [quizId, router.isReady]);

  const onStartQuiz = () =>
    mutateAsync({ quizId: quizId as string, timeInMinutes: quiz?.time! }).then(
      (s) => s && router.push(`/quiz/${quiz?.id}/start/${s.id}`)
    );

  return (
    <>
      <Head>
        <title>Start quiz {quiz?.name}</title>
      </Head>
      {isLoading ? (
        <Typography variant="body2">Loading...</Typography>
      ) : quiz ? (
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          height={"100%"}
        >
          <QuizInfoCard
            quizInfo={quiz}
            contentSection={
              <Typography variant="body2">
                If you close this quiz before you have completed it, your
                answers will not be saved.
              </Typography>
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
                >
                  {isLoadingStart ? "Loading..." : "Start quiz"}
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
