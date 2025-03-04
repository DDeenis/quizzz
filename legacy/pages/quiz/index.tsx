import type { QuizPreview } from "@/types/quiz";
import { api } from "@/utils/trpc/client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import Link from "next/link";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import BalanceIcon from "@mui/icons-material/Balance";
import { useMemo } from "react";
import type { InferGetServerSidePropsType } from "next";
import { type User } from "@/types/user";
import { useServerSerializedValue } from "@/hooks/useServerSerializedValue";
import { getServerSidePropsProtectedPreset } from "@/server/auth/ssrPresets";

export const getServerSideProps = getServerSidePropsProtectedPreset;

export default function QuizzesListPage(
  params: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const user = useServerSerializedValue<User>(params.serializedUser);
  const { data, isLoading, refetch } = api.quizzes.getAll.useQuery();
  const deleteQuiz = api.quizzes.deleteQuiz.useMutation();
  const restoreQuiz = api.quizzes.restoreQuiz.useMutation();

  const quizzes = useMemo(() => {
    const existing = data?.filter((t) => !t.deletedAt);
    const deleted = data?.filter((t) => t.deletedAt);
    return {
      existing,
      deleted,
    };
  }, [data]);

  const createOnDelete = (quizId: string) => () => {
    void deleteQuiz
      .mutateAsync({ quizId })
      .then((isDeleted) => isDeleted && void refetch());
  };
  const createOnRestore = (quizId: string) => () => {
    void restoreQuiz
      .mutateAsync({ quizId })
      .then((isRestored) => isRestored && void refetch());
  };

  return (
    <>
      <Head>
        <title>Quizzes</title>
      </Head>
      {isLoading ? (
        <Typography variant="body2">Loading...</Typography>
      ) : (
        <>
          {user.isAdmin && (
            <Link href={`quiz/create`}>
              <Button variant="contained" sx={{ mb: 3 }}>
                Create new quiz
              </Button>
            </Link>
          )}

          <Typography variant="h4" my={2}>
            Available quizzes
          </Typography>
          <Box display={"flex"} flexWrap={"wrap"} gap={4}>
            {quizzes.existing?.map((quiz) => (
              <QuizCard
                quiz={quiz}
                isAdmin={user.isAdmin}
                onDelete={createOnDelete(quiz.id)}
                key={quiz.id}
              />
            ))}
          </Box>
          {!!quizzes.deleted?.length && (
            <>
              <Typography variant="h4" my={2}>
                Deleted quizzes
              </Typography>
              <Box display={"flex"} flexWrap={"wrap"} gap={4}>
                {quizzes.deleted?.map((quiz) => (
                  <QuizCard
                    quiz={quiz}
                    isAdmin={user.isAdmin}
                    onDelete={createOnDelete(quiz.id)}
                    onRestore={createOnRestore(quiz.id)}
                    key={quiz.id}
                  />
                ))}
              </Box>
            </>
          )}
        </>
      )}
    </>
  );
}

interface QuizCardProps {
  quiz: QuizPreview;
  isAdmin?: boolean;
  onDelete?: () => void;
  onRestore?: () => void;
}

const QuizCard = ({ quiz, isAdmin, onDelete, onRestore }: QuizCardProps) => {
  const isDeleted = Boolean(quiz.deletedAt);

  return (
    <Box
      p={2}
      maxWidth={"300px"}
      width={"100%"}
      border={1}
      borderColor={"lightgray"}
      borderRadius={2}
    >
      <Typography variant="h4" textAlign={"center"} mb={2}>
        {quiz.name}
      </Typography>
      <Box mb={2}>
        <Typography variant="subtitle1">
          <HelpOutlineIcon /> {quiz.questionsCount} questions
        </Typography>
        <Typography variant="subtitle1">
          <HourglassEmptyIcon /> {quiz.time} minutes
        </Typography>
        <Typography variant="subtitle1">
          <BalanceIcon /> Attempts: {quiz.attempts ?? "unlimited"}
        </Typography>
      </Box>
      {!isAdmin && (
        <Link href={`/quiz/${quiz.id}/start`}>
          <Button variant="contained" fullWidth>
            Start quiz
          </Button>
        </Link>
      )}
      {isAdmin && (
        <>
          <Link href={`quiz/${quiz.id}/edit`}>
            <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
              Edit quiz
            </Button>
          </Link>
          {!isDeleted ? (
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={onDelete}
            >
              <DeleteIcon sx={{ mr: 1 }} />
              Delete quiz
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="info"
              fullWidth
              onClick={onRestore}
            >
              <RestoreIcon sx={{ mr: 1 }} />
              Restore quiz
            </Button>
          )}
        </>
      )}
    </Box>
  );
};
