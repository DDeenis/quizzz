import { Timer } from "@/components/Timer";
import { useServerSerializedValue } from "@/hooks/useServerSerializedValue";
import { getServerSidePropsProtectedPreset } from "@/server/auth/ssrPresets";
import { type QuestionClient, QuestionType } from "@/types/question";
import { type QuestionAnswerCreateObject } from "@/types/questionAnswer";
import { type QuizResultCreateObject } from "@/types/quizResult";
import type { User } from "@/types/user";
import { api } from "@/utils/trpc/client";
import {
  getISODistanceToInSeconds,
  isQuizSessionExpired,
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
import type { InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { type Control, Controller, useForm } from "react-hook-form";

export const getServerSideProps = getServerSidePropsProtectedPreset;

export default function QuizPage(
  params: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const router = useRouter();
  const user = useServerSerializedValue<User>(params.serializedUser);
  const { quizId, quizSessionId } = router.query;
  const { data, refetch, isSuccess, isLoading } =
    api.studentQuizes.getQuizWithSession.useQuery(
      {
        quizId: quizId as string,
        quizSessionId: quizSessionId as string,
      },
      { enabled: false, staleTime: Infinity }
    );

  const submitQuiz = api.studentQuizes.submitQuiz.useMutation();
  const form = useForm<QuestionAnswerCreateObject[]>({
    defaultValues: [],
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const expiresInSeconds = useMemo(() => {
    const expires = data?.quizSession.expires;
    if (!expires) return 0;
    return getISODistanceToInSeconds(expires);
  }, [isSuccess, data?.quizSession.expires]);

  const quiz = data?.quiz;
  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const hasPrev = currentQuestionIndex > 0;
  const hasNext = currentQuestionIndex < Number(quiz?.questions?.length) - 1;

  useEffect(() => {
    if (!router.isReady || !quizId || !quizSessionId) {
      return;
    }

    void refetch();
  }, [router.isReady, quizId, quizSessionId]);

  useEffect(() => {
    const quizSession = data?.quizSession;
    if (!quizSession || !isSuccess) return;
    const isExpired = isQuizSessionExpired(quizSession);
    if (isExpired) {
      void router.push(`/quiz/${quizId as string}/start`);
    }
  }, [isSuccess, data?.quizSession, quizId]);

  const toNextQuestion = () =>
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  const toPrevQuestion = () =>
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  const toQuestion = (index: number) => setCurrentQuestionIndex(index);

  const onSubmit = form.handleSubmit((formValues) => {
    const userId = user.id;
    if (!userId || !quiz?.questions) return;

    const answers: QuestionAnswerCreateObject[] = [];
    for (let i = 0; i < quiz.questions.length; i++) {
      const answerData = formValues[i]?.answerData;
      const questionId = quiz.questions?.[i]?.id;
      if (!answerData || !questionId) return;

      answers.push({
        userId: user.id,
        questionId,
        answerData,
      });
    }

    const quizResult: QuizResultCreateObject = {
      quizId: quizId as string,
      quizSessionId: quizSessionId as string,
      userId: user.id,
      answers,
    };
    submitQuiz
      .mutateAsync(quizResult)
      .then((r) => r && router.push(`/result/${r.id}`))
      .catch(console.error);
  });

  const onTimerEnd = () => {
    if (form.formState.isValid) {
      void onSubmit();
    }

    // TODO: show modal 'your session has expired'
    void router.push(`/quiz/${quizId as string}/start`);
  };

  const onCancelQuiz = () => {
    void router.push(`/quiz`);
  };

  return (
    <>
      <Head>
        <title>Question {currentQuestionIndex + 1}</title>
      </Head>
      {isLoading ? (
        <Typography variant="body2">Loading...</Typography>
      ) : quiz ? (
        <Box>
          <Typography variant="h3" textAlign={"center"}>
            {quiz.name}
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
                <Timer
                  timeInSeconds={expiresInSeconds}
                  onTimerEnd={onTimerEnd}
                />
              </Box>
              {currentQuestion && (
                <>
                  <Typography variant="h6" mt={2} mb={1}>
                    {currentQuestion.questionData.question}
                  </Typography>
                  <Typography variant="body2" whiteSpace={"pre-line"} mb={2}>
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
                {submitQuiz.isPending ? "Loading..." : "Finish quiz"}
              </Button>
              <Button
                variant="text"
                type="button"
                style={{ marginLeft: "auto" }}
                onClick={onCancelQuiz}
              >
                Cancel quiz
              </Button>
            </CardActions>
          </Card>
          <Box
            display={"flex"}
            justifyContent={"center"}
            flexWrap={"wrap"}
            gap={1}
            mt={2}
            // maxWidth={900}
          >
            {quiz.questions?.map((_, i) => {
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
          Failed to load quiz or quiz session
        </Typography>
      )}
    </>
  );
}

const QuestionForm = ({
  question,
  questionIndex,
  control,
  getValues,
}: {
  question: QuestionClient;
  questionIndex: number;
  control: Control<QuestionAnswerCreateObject[], unknown>;
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
                    if (checked) {
                      onChange([variant]);
                    } else {
                      onChange(valueSafe.filter((v) => v !== variant));
                    }
                  }}
                />
              ) : (
                <Checkbox
                  onBlur={onBlur}
                  ref={ref}
                  checked={isChecked}
                  onChange={(e, checked) => {
                    if (checked) {
                      onChange([...valueSafe, variant]);
                    } else {
                      onChange(valueSafe.filter((v) => v !== variant));
                    }
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
