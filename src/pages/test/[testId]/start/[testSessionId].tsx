import { useProtectedSession } from "@/hooks/session";
import { Question, QuestionType } from "@/types/question";
import { QuestionAnswerCreateObject } from "@/types/questionAnswer";
import { api } from "@/utils/api";
import { isTestSessionExpired } from "@/utils/questions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function TestPage() {
  const router = useRouter();
  const { data: session } = useProtectedSession();
  const { testId, testSessionId } = router.query;
  const { data, refetch, isSuccess, isLoading } =
    api.studentTests.getTestWithSession.useQuery(
      {
        testId: testId as string,
        testSessionId: testSessionId as string,
      },
      { enabled: false, staleTime: Infinity }
    );
  // TODO: implement this form
  const form = useForm<Pick<QuestionAnswerCreateObject, "answerData">[]>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswerCreateObject[]>([]);

  const test = data?.test;
  const currentQuestion = test?.questions?.[currentQuestionIndex];
  const hasPrev = currentQuestionIndex > 0;
  const hasNext = currentQuestionIndex < Number(test?.questions?.length) - 1;

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    refetch();
  }, [router.isReady]);

  useEffect(() => {
    const testSession = data?.testSession;
    if (!testSession || !isSuccess) return;
    if (isTestSessionExpired(testSession)) {
      // TODO: delete test session
      router.push(`/test/${testId}/start`);
    }
  }, [isSuccess]);

  const toNextQuestion = () =>
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  const toPrevQuestion = () =>
    setCurrentQuestionIndex(currentQuestionIndex - 1);

  return isLoading ? (
    <Typography variant="body2">Loading...</Typography>
  ) : test ? (
    <Box>
      <Typography variant="h3" textAlign={"center"}>
        {test.name}
      </Typography>
      <Card
        sx={{ maxWidth: 900, width: "100%", mt: 3, mx: "auto" }}
        variant="outlined"
      >
        <CardContent>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Typography variant="subtitle1">
              Question {currentQuestionIndex + 1}
            </Typography>
            <Timer timeInMinutes={test.time} />
          </Box>
          {currentQuestion && (
            <>
              <Typography variant="h6" mt={2} mb={1}>
                {currentQuestion.questionData.question}
              </Typography>
              <Typography variant="body2" mb={2}>
                {currentQuestion.questionData.description}
              </Typography>
              <QuestionForm question={currentQuestion} />
            </>
          )}
        </CardContent>
        <CardActions>
          <Button
            variant="outlined"
            onClick={toPrevQuestion}
            disabled={!hasPrev}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={toNextQuestion}
            disabled={!hasNext}
          >
            Next
          </Button>
        </CardActions>
      </Card>
    </Box>
  ) : (
    <Typography variant="body2" color={"red"}>
      Failed to load test or test session
    </Typography>
  );
}

const QuestionForm = ({ question }: { question: Question }) => {
  const { register } = useForm<boolean[]>({
    defaultValues: [],
    shouldUnregister: true,
  });

  return (
    <Box display={"flex"} flexDirection={"column"}>
      {question.questionData.variants.map((v, i) => (
        <Box display={"flex"} alignItems={"center"} gap={2} key={i}>
          {question.questionType === QuestionType.SingleVariant ? (
            <Radio {...register(`${i}`)} />
          ) : (
            <Checkbox {...register(`${i}`)} />
          )}
          <Typography variant="body1">{v}</Typography>
        </Box>
      ))}
    </Box>
  );
};

const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = timeInSeconds - minutes * 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const Timer = ({
  timeInMinutes,
  onTimerEnd,
}: {
  timeInMinutes: number;
  onTimerEnd?: () => void;
}) => {
  const targetSeconds = timeInMinutes * 60;
  const [timeInSeconds, setTimeInSeconds] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeInSeconds((t) => t + 1);
    }, 1000);

    const timeotId = setTimeout(() => {
      onTimerEnd?.();
      clearInterval(intervalId);
    }, targetSeconds * 60 * 1000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeotId);
    };
  }, []);

  return (
    <Typography variant="subtitle1">
      {formatTime(targetSeconds - timeInSeconds)}
    </Typography>
  );
};
