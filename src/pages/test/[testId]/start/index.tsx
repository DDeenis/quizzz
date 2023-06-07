import { TestInfoCard } from "@/components/TestInfoCard";
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

export default function StartTestPage() {
  const router = useRouter();
  const { testId } = router.query;
  const { data } = useProtectedSession();
  const {
    data: test,
    isLoading,
    refetch,
  } = api.tests.getById.useQuery(
    { testId: (testId as string | undefined) ?? "" },
    { enabled: false }
  );
  const { mutateAsync, isLoading: isLoadingStart } =
    api.studentTests.createTestSession.useMutation();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    refetch();
  }, [testId, router.isReady]);

  const onStartTest = () =>
    mutateAsync({ testId: testId as string, timeInMinutes: test?.time! }).then(
      (s) => s && router.push(`/test/${test?.id}/start/${s.id}`)
    );

  return (
    <>
      <Head>
        <title>Start test {test?.name}</title>
      </Head>
      {isLoading ? (
        <Typography variant="body2">Loading...</Typography>
      ) : test ? (
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          height={"100%"}
        >
          <TestInfoCard
            testInfo={test}
            contentSection={
              <Typography variant="body2">
                If you close this test before you have completed it, your
                answers will not be saved.
              </Typography>
            }
            actionsSection={
              <>
                <Link href={"/test"}>
                  <Button>Cancel</Button>
                </Link>
                <Button
                  variant="contained"
                  sx={{ ml: 1 }}
                  onClick={onStartTest}
                >
                  {isLoadingStart ? "Loading..." : "Start test"}
                </Button>
              </>
            }
          />
        </Box>
      ) : (
        <Typography variant="body2" color={"red"}>
          Failed to load test
        </Typography>
      )}
    </>
  );
}
