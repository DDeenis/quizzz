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

  return isLoading ? (
    <Typography variant="body2">Loading...</Typography>
  ) : test ? (
    <Box
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      height={"100%"}
    >
      <Card sx={{ maxWidth: 700, width: "100%" }} variant="outlined">
        <CardContent>
          <Typography variant="h4" component="div" textAlign={"center"}>
            {test.name}
          </Typography>
          <Box display={"flex"} flexWrap={"wrap"} gap={1} my={2}>
            <Chip color="info" label={`${test.questionsCount} questions`} />
            <Chip color="warning" label={`${test.time} minutes`} />
            <Chip
              color="warning"
              label={`You need to get ${test.minimumScore} points`}
            />
          </Box>
          <Typography variant="body1" mb={2}>
            {test.description}
          </Typography>
          <Typography variant="body2">
            If you close this test before you have completed it, your answers
            will not be saved.
          </Typography>
          {/* <Typography variant="caption">
            You have not passed this test before
          </Typography> */}
        </CardContent>
        <CardActions>
          <Link href={"/test"}>
            <Button>Cancel</Button>
          </Link>
          <Button variant="contained" sx={{ ml: 1 }} onClick={onStartTest}>
            {isLoadingStart ? "Loading..." : "Start test"}
          </Button>
        </CardActions>
      </Card>
    </Box>
  ) : (
    <Typography variant="body2" color={"red"}>
      Failed to load test
    </Typography>
  );
}
