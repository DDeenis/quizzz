import { useProtectedSession } from "@/hooks/session";
import { Test } from "@/types/test";
import { api } from "@/utils/api";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import Link from "next/link";
import DeleteIcon from "@mui/icons-material/Delete";
import RestoreIcon from "@mui/icons-material/Restore";
import { useMemo } from "react";

export default function TestsListPage() {
  const { data, isLoading, dataUpdatedAt, refetch } =
    api.tests.getAll.useQuery();
  const deleteTest = api.tests.deleteTest.useMutation();
  const restoreTest = api.tests.restoreTest.useMutation();
  const { data: session } = useProtectedSession();

  const tests = useMemo(() => {
    const existing = data?.filter((t) => !t.deletedAt);
    const deleted = data?.filter((t) => t.deletedAt);
    return {
      existing,
      deleted,
    };
  }, [dataUpdatedAt]);

  const createOnDelete = (testId: string) => () => {
    deleteTest
      .mutateAsync({ testId })
      .then((isDeleted) => isDeleted && void refetch());
  };
  const createOnRestore = (testId: string) => () => {
    restoreTest
      .mutateAsync({ testId })
      .then((isRestored) => isRestored && void refetch());
  };

  return (
    <>
      <Head>
        <title>Tests</title>
      </Head>
      {isLoading ? (
        <Typography variant="body2">Loading...</Typography>
      ) : (
        <>
          {session?.user.isAdmin && (
            <Link href={`test/create`}>
              <Button variant="contained" sx={{ mb: 3 }}>
                Create new test
              </Button>
            </Link>
          )}

          <Typography variant="h4" my={2}>
            Available tests
          </Typography>
          <Box display={"flex"} flexWrap={"wrap"} gap={4}>
            {tests.existing?.map((test) => (
              <TestCard
                test={test}
                isAdmin={session?.user.isAdmin}
                onDelete={createOnDelete(test.id)}
                key={test.id}
              />
            ))}
          </Box>
          {!!tests.deleted?.length && (
            <>
              <Typography variant="h4" my={2}>
                Deleted tests
              </Typography>
              <Box display={"flex"} flexWrap={"wrap"} gap={4}>
                {tests.deleted?.map((test) => (
                  <TestCard
                    test={test}
                    isAdmin={session?.user.isAdmin}
                    onDelete={createOnDelete(test.id)}
                    onRestore={createOnRestore(test.id)}
                    key={test.id}
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

interface TestCardProps {
  test: Test;
  isAdmin?: boolean;
  onDelete?: () => void;
  onRestore?: () => void;
}

const TestCard = ({ test, isAdmin, onDelete, onRestore }: TestCardProps) => {
  const isDeleted = Boolean(test.deletedAt);

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
        {test.name}
      </Typography>
      <Box mb={2}>
        <Typography variant="subtitle1">
          • {test.questionsCount} questions
        </Typography>
        <Typography variant="subtitle1">• {test.time} minutes</Typography>
      </Box>
      {!isAdmin && (
        <Link href={`/test/${test.id}/start`}>
          <Button variant="contained" fullWidth>
            Start test
          </Button>
        </Link>
      )}
      {isAdmin && (
        <>
          <Link href={`test/${test.id}/edit`}>
            <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
              Edit test
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
              Delete test
            </Button>
          ) : (
            <Button
              variant="outlined"
              color="info"
              fullWidth
              onClick={onRestore}
            >
              <RestoreIcon sx={{ mr: 1 }} />
              Restore test
            </Button>
          )}
        </>
      )}
    </Box>
  );
};
