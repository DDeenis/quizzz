import { useProtectedSession } from "@/hooks/session";
import { Question, QuestionType } from "@/types/question";
import { QuestionAnswerCreateObject } from "@/types/questionAnswer";
import { TestResultCreateObject } from "@/types/testResult";
import { api } from "@/utils/api";
import {
  getISODistanceToInSeconds,
  isTestSessionExpired,
} from "@/utils/questions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Radio from "@mui/material/Radio";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { Control, Controller, useForm } from "react-hook-form";

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
  const { mutate } = api.studentTests.remove.useMutation();
  const submitTest = api.studentTests.submitTest.useMutation();
  const form = useForm<QuestionAnswerCreateObject[]>({
    defaultValues: [],
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const expiresInMinutes = useMemo(() => {
    const expires = data?.testSession.expires;
    if (!expires) return 0;
    return Math.floor(getISODistanceToInSeconds(expires) / 60);
  }, [isSuccess]);

  const test = data?.test;
  const currentQuestion = test?.questions?.[currentQuestionIndex];
  const hasPrev = currentQuestionIndex > 0;
  const hasNext = currentQuestionIndex < Number(test?.questions?.length) - 1;

  const removeTestSession = (id: string) => mutate({ testSessionId: id });

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
      removeTestSession(testSession.id);
      router.push(`/test/${testId}/start`);
    }
  }, [isSuccess]);

  const toNextQuestion = () =>
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  const toPrevQuestion = () =>
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  const toQuestion = (index: number) => setCurrentQuestionIndex(index);

  const onSubmit = form.handleSubmit((formValues) => {
    const userId = session?.user.id;
    if (!userId || !test?.questions) return;

    const answers: QuestionAnswerCreateObject[] = [];
    for (let i = 0; i < test.questions.length; i++) {
      console.log(test.questions[i]);

      answers.push({
        userId: session!.user.id,
        questionId: test.questions?.[i]?.id!,
        answerData: formValues[i]!.answerData,
      });
    }

    const testResult: TestResultCreateObject = {
      testId: testId as string,
      randomSeed: testSessionId as string,
      userId: session!.user.id,
      answers,
    };
    submitTest
      .mutateAsync(testResult)
      .then((r) => r && router.push(`/result/${r.id}`));
  });

  const onTimerEnd = () => {
    if (form.formState.isValid) {
      onSubmit();
    }
    removeTestSession(testSessionId as string);
    // TODO: show modal 'your session has expired'
    router.push(`/test/${testId}/start`);
  };

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
        component={"form"}
        onSubmit={onSubmit}
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
            <Timer timeInMinutes={expiresInMinutes} onTimerEnd={onTimerEnd} />
          </Box>
          {currentQuestion && (
            <>
              <Typography variant="h6" mt={2} mb={1}>
                {currentQuestion.questionData.question}
              </Typography>
              <Typography variant="body2" mb={2}>
                {currentQuestion.questionData.description}
              </Typography>
              <QuestionForm
                question={currentQuestion}
                questionIndex={currentQuestionIndex}
                control={form.control}
                getValues={form.getValues}
              />
            </>
          )}
        </CardContent>
        <CardActions>
          <Button
            variant="outlined"
            type="button"
            onClick={toPrevQuestion}
            disabled={!hasPrev}
          >
            Previous
          </Button>
          {hasNext && (
            <Button
              variant="contained"
              type="button"
              onClick={toNextQuestion}
              disabled={!hasNext}
            >
              Next
            </Button>
          )}
          <Button
            variant="contained"
            type="submit"
            disabled={!form.formState.isValid}
            sx={{ display: hasNext ? "none" : "inline" }}
          >
            Finish test
          </Button>
        </CardActions>
      </Card>
      <Box
        display={"flex"}
        justifyContent={"center"}
        flexWrap={"wrap"}
        gap={1}
        mt={2}
      >
        {test.questions?.map((_, i) => {
          return (
            <Chip
              key={i}
              label={i + 1}
              color={i === currentQuestionIndex ? "info" : "default"}
              sx={{ cursor: "pointer" }}
              onClick={() => toQuestion(i)}
            />
          );
        })}
      </Box>
    </Box>
  ) : (
    <Typography variant="body2" color={"red"}>
      Failed to load test or test session
    </Typography>
  );
}

const QuestionForm = ({
  question,
  questionIndex,
  control,
  getValues,
}: {
  question: Question;
  questionIndex: number;
  control: Control<QuestionAnswerCreateObject[], any>;
  getValues: () => QuestionAnswerCreateObject[];
}) => {
  return (
    <Box display={"flex"} flexDirection={"column"}>
      {question.questionData.variants.map((v, i) => (
        <Box display={"flex"} alignItems={"center"} gap={2} key={i}>
          <Controller
            control={control}
            name={`${questionIndex}.answerData.variants`}
            rules={{ required: true }}
            render={({ field: { onBlur, ref, onChange } }) => {
              const variants = question.questionData.variants;
              const variant = question.questionData.variants[i]!;
              const values = getValues()[questionIndex]?.answerData.variants;
              const valueSafe = values
                ? values.filter((v) => variants.includes(v))
                : [];
              const isChecked = valueSafe.includes(variant);

              return question.questionType === QuestionType.SingleVariant ? (
                <Radio
                  onBlur={onBlur}
                  ref={ref}
                  checked={isChecked}
                  onChange={(e, checked) => {
                    checked
                      ? onChange([variant])
                      : onChange(valueSafe.filter((v) => v !== variant));
                  }}
                />
              ) : (
                <Checkbox
                  onBlur={onBlur}
                  ref={ref}
                  checked={isChecked}
                  onChange={(e, checked) => {
                    checked
                      ? onChange([...valueSafe, variant])
                      : onChange(valueSafe.filter((v) => v !== variant));
                  }}
                />
              );
            }}
          />
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

const Timer = React.memo(
  ({
    timeInMinutes,
    onTimerEnd,
  }: {
    timeInMinutes: number;
    onTimerEnd: () => void;
  }) => {
    const targetSeconds = timeInMinutes * 60;
    const [timeInSeconds, setTimeInSeconds] = useState(0);

    useEffect(() => {
      const intervalId = setInterval(() => {
        setTimeInSeconds((t) => t + 1);
      }, 1000);

      const timeotId = setTimeout(() => {
        onTimerEnd();
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
  }
);
