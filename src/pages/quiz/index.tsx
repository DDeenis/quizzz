import { useProtectedSession } from "@/hooks/session";
import { Quiz } from "@/types/quiz";
import { api } from "@/utils/api";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import Link from "next/link";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import { useMemo } from "react";

export default function QuizesListPage() {
  const { data, isLoading, dataUpdatedAt, refetch } =
    api.quizes.getAll.useQuery();
  const deleteQuiz = api.quizes.deleteQuiz.useMutation();
  const restoreQuiz = api.quizes.restoreQuiz.useMutation();
  const { data: session } = useProtectedSession();

  const quizes = useMemo(() => {
    const existing = data?.filter((t) => !t.deletedAt);
    const deleted = data?.filter((t) => t.deletedAt);
    return {
      existing,
      deleted,
    };
  }, [dataUpdatedAt]);

  const createOnDelete = (quizId: string) => () => {
    deleteQuiz
      .mutateAsync({ quizId })
      .then((isDeleted) => isDeleted && void refetch());
  };
  const createOnRestore = (quizId: string) => () => {
    restoreQuiz
      .mutateAsync({ quizId })
      .then((isRestored) => isRestored && void refetch());
  };

  return (
    <>
      <Head>
        <title>Quizes</title>
      </Head>
      {isLoading ? (
        <Typography variant="body2">Loading...</Typography>
      ) : (
        <>
          {session?.user.isAdmin && (
            <Link href={`quiz/create`}>
              <Button variant="contained" sx={{ mb: 3 }}>
                Create new quiz
              </Button>
            </Link>
          )}

          <Typography variant="h4" my={2}>
            Available quizes
          </Typography>
          <Box display={"flex"} flexWrap={"wrap"} gap={4}>
            {quizes.existing?.map((quiz) => (
              <QuizCard
                quiz={quiz}
                isAdmin={session?.user.isAdmin}
                onDelete={createOnDelete(quiz.id)}
                key={quiz.id}
              />
            ))}
          </Box>
          {!!quizes.deleted?.length && (
            <>
              <Typography variant="h4" my={2}>
                Deleted quizes
              </Typography>
              <Box display={"flex"} flexWrap={"wrap"} gap={4}>
                {quizes.deleted?.map((quiz) => (
                  <QuizCard
                    quiz={quiz}
                    isAdmin={session?.user.isAdmin}
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
  quiz: Quiz;
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
          • {quiz.questionsCount} questions
        </Typography>
        <Typography variant="subtitle1">• {quiz.time} minutes</Typography>
        <Typography variant="subtitle1">
          • Attempts: {quiz.attempts ?? "unlimited"}
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
