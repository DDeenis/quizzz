import { QuizInfoCard } from "@/components/QuizInfoCard";
import { getServerSidePropsProtectedPreset } from "@/server/auth/ssrPresets";
import { type Question, QuestionType } from "@/types/question";
import { AnswerType } from "@/types/questionAnswer";
import type { QuestionAnswer } from "@/types/questionAnswer";
import { api } from "@/utils/trpc/client";
import { formatDate } from "@/utils/questions";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Radio from "@mui/material/Radio";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const getServerSideProps = getServerSidePropsProtectedPreset;

export default function QuizPage() {
  const router = useRouter();
  const { resultId } = router.query;
  const { data, refetch, isLoading } = api.quizResults.getWithQuiz.useQuery(
    {
      quizResultId: resultId as string,
    },
    { enabled: false, staleTime: Infinity, retry: false }
  );

  const isQuizPassed = (data?.score ?? 0) >= (data?.quiz.minimumScore ?? 0);
  const passedColor = isQuizPassed ? "green" : "red";

  useEffect(() => {
    if (!router.isReady || !resultId) {
      return;
    }

    void refetch();
  }, [resultId, router.isReady]);

  return (
    <>
      <Head>
        {isLoading ? (
          <title>Results: Loading...</title>
        ) : (
          <title>
            Results: {data?.quiz.name} - {isQuizPassed ? "Passed" : "Failed"}
          </title>
        )}
      </Head>
      {isLoading ? (
        <Typography variant="body2">Loading...</Typography>
      ) : data ? (
        <Box>
          <Typography
            variant="h3"
            color={passedColor}
            textAlign={"center"}
            mb={3}
          >
            {isQuizPassed
              ? "You have passed the quiz!"
              : "You failed to pass the quiz"}
          </Typography>
          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            height={"100%"}
          >
            <QuizInfoCard
              quizInfo={data.quiz}
              borderColor={passedColor}
              contentSection={
                <Box component={"figure"} m={0}>
                  <Typography
                    variant="subtitle1"
                    mb={2}
                    fontWeight={"bold"}
                    component={"figcaption"}
                  >
                    Your results:
                  </Typography>
                  <Box component={"ul"}>
                    <Box component={"li"}>
                      Score:{" "}
                      <Typography
                        color={passedColor}
                        fontWeight={"bold"}
                        component={"span"}
                      >
                        {data.score}
                      </Typography>{" "}
                      of{" "}
                      <Typography fontWeight={"bold"} component={"span"}>
                        {data.quiz.minimumScore}
                      </Typography>{" "}
                      (maximum {data.maxScore})
                    </Box>
                    <Box component={"li"}>
                      {data.countCorrect} correct answers
                    </Box>
                    <Box component={"li"}>
                      {data.countIncorrect} incorrect or partially correct
                      answers
                    </Box>
                    <Box component={"li"}>
                      Passed at {formatDate(data.createdAt)}
                    </Box>
                  </Box>
                </Box>
              }
            />
          </Box>
          {data.quiz.questions?.map((q, i) => {
            const answer = data.answers?.find((a) => a.questionId === q.id);
            if (!answer) {
              return (
                <Typography color={"red"} key={"error"}>
                  Failed to load answer
                </Typography>
              );
            }
            return (
              <QuestionComponent
                question={q}
                answer={answer}
                questionIndex={i}
                key={i}
              />
            );
          })}
        </Box>
      ) : (
        <Typography variant="body2" color={"red"}>
          Failed to load result or quiz
        </Typography>
      )}
    </>
  );
}

const QuestionComponent = ({
  question,
  answer,
  questionIndex,
}: {
  question: Question;
  answer: QuestionAnswer;
  questionIndex: number;
}) => {
  const color = getAnswerTypeColor(answer.answerType);
  const questionAnswerData = question.questionData.variants
    .filter((v) => v.isCorrect)
    .map((v) => v.variant);

  return (
    <Card
      sx={{
        maxWidth: 900,
        width: "100%",
        mt: 3,
        mx: "auto",
        borderColor: color,
      }}
      variant="outlined"
    >
      <CardContent>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Typography variant="subtitle1" color={color} fontWeight={"bold"}>
            Question {questionIndex + 1}{" "}
          </Typography>
          <Typography color={color} fontWeight={"bold"}>
            {answer.score} points
          </Typography>
        </Box>
        <Typography variant={"caption"} textTransform={"capitalize"}>
          Complexity: {question.complexity}
        </Typography>
        {" | "}
        <Typography variant={"caption"}>
          Answers count: {questionAnswerData.length}
        </Typography>
        <Typography variant="h6" mt={2} mb={1}>
          {question.questionData.question}
        </Typography>
        <Typography variant="body2" mb={2}>
          {question.questionData.description}
        </Typography>
        <Box display={"flex"} flexDirection={"column"}>
          {question.questionData.variants.map((v, i) => {
            const answerData = answer.answerData.find(
              (a) => a.variant === v.variant
            );
            const questionColor = answerData
              ? getAnswerTypeColor(answerData.answerType)
              : questionAnswerData.includes(v.variant)
              ? "green"
              : undefined;
            return (
              <Box display={"flex"} alignItems={"center"} gap={2} key={i}>
                {question.questionType === QuestionType.SingleVariant ? (
                  <Radio defaultChecked={Boolean(answerData)} disabled />
                ) : (
                  <Checkbox defaultChecked={Boolean(answerData)} disabled />
                )}
                <Typography
                  variant="body1"
                  color={questionColor}
                  fontWeight={questionColor ? "bold" : "inherit"}
                >
                  {v.variant}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

function getAnswerTypeColor(answerType: AnswerType) {
  return answerType === AnswerType.Correct
    ? "green"
    : answerType === AnswerType.Incorrect
    ? "red"
    : "orange";
}
