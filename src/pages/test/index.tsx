import { Test } from "@/types/test";
import { api } from "@/utils/api";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function TestsListPage() {
  const { push } = useRouter();
  const { data: tests, isLoading, refetch } = api.tests.getAll.useQuery();
  const { mutateAsync } = api.tests.deleteTest.useMutation();
  const { data } = useSession({
    required: true,
    onUnauthenticated() {
      push("/");
    },
  });

  const createOnDelete = (testId: string) => () => {
    mutateAsync({ testId }).then(() => refetch());
  };

  return (
    <>
      {data?.user.isAdmin && (
        <Link href={`test/create`}>
          <Button variant="contained" sx={{ mb: 3 }}>
            Create new test
          </Button>
        </Link>
      )}
      <Box display={"flex"} flexWrap={"wrap"} gap={4}>
        {tests?.map((test) => (
          <TestCard
            test={test}
            isAdmin={data?.user.isAdmin}
            onDelete={createOnDelete(test.id)}
            key={test.id}
          />
        ))}
      </Box>
    </>
  );
}

interface TestCardProps {
  test: Test;
  isAdmin?: boolean;
  onDelete: () => void;
}

const TestCard = ({ test, isAdmin, onDelete }: TestCardProps) => {
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
        <Link href={`test/${test.id}`}>
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
          <Button variant="outlined" color="error" fullWidth onClick={onDelete}>
            Delete test
          </Button>
        </>
      )}
    </Box>
  );
};
