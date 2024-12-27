import { stringAvatar } from "@/utils/user";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { UserInfo } from "./UserInfo";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import Button from "@mui/material/Button";
import { formatDate } from "@/utils/questions";
import React from "react";
import type { QuizResultAdminData } from "@/types/quizResult";
import { findLastIndex } from "@/utils/general";
import { api } from "@/utils/trpc/client";

export const AdminQuizTab = () => {
  const [selectedQuizId, setSelectedQuizId] = React.useState<string>("");
  const [selectedUserId, setSelectedUserId] = React.useState<string>("");

  const quizOptions = api.admin.getQuizOptions.useQuery();
  const quizResults = api.admin.getResultsForQuiz.useQuery(
    {
      quizId: selectedQuizId,
    },
    { enabled: false }
  );

  const filteredData = React.useMemo(() => {
    return selectedUserId
      ? quizResults.data?.filter((tr) => tr.userId === selectedUserId)
      : quizResults.data;
  }, [quizResults.data, selectedUserId]);

  const userOptions = React.useMemo(() => {
    return quizResults.data
      ?.map((tr) => ({
        id: tr.userId,
        name: tr.user.name,
      }))
      .filter((o, i, arr) => findLastIndex(arr, (t) => t.id === o.id) === i);
  }, [quizResults.data]);

  const handleQuizChange = (event: SelectChangeEvent<string>) => {
    setSelectedQuizId(event.target.value);
  };
  const handleUserChange = (event: SelectChangeEvent<string>) => {
    setSelectedUserId(event.target.value);
  };

  React.useEffect(() => {
    if (selectedQuizId) {
      setSelectedUserId("");
      void quizResults.refetch();
    }
  }, [selectedQuizId]);

  return (
    <>
      <Box display={"flex"} flexWrap={"wrap"} gap={2}>
        <FormControl fullWidth sx={{ maxWidth: 340 }}>
          <InputLabel id={`quiz-select-label`}>Quiz</InputLabel>
          <Select
            labelId={`quiz-select-label`}
            label="Quiz"
            value={selectedQuizId}
            onChange={handleQuizChange}
          >
            {quizOptions.data?.map((o) => (
              <MenuItem value={o.id} key={o.id}>
                {o.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ maxWidth: 340 }}>
          <InputLabel id={`quiz-select-label`}>User</InputLabel>
          <Select
            labelId={`quiz-select-label`}
            label="User"
            value={selectedUserId}
            disabled={!userOptions?.length}
            onChange={handleUserChange}
          >
            <MenuItem value={""}>-- all --</MenuItem>
            {userOptions?.map((o) => {
              const avatarProps = stringAvatar(o.name);
              return (
                <MenuItem value={o.id} key={o.id}>
                  <Box display={"flex"} alignItems={"center"} gap={1}>
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: "0.75rem",
                        ...avatarProps.sx,
                      }}
                    >
                      {avatarProps.children}
                    </Avatar>
                    {o.name}
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
      <Box mt={4}>
        {!selectedQuizId && (
          <Typography variant="subtitle2" textAlign={"center"}>
            Select quiz to see the data
          </Typography>
        )}
        {filteredData && filteredData.length === 0 && (
          <Typography variant="subtitle2" textAlign={"center"}>
            No data to display
          </Typography>
        )}
        {selectedQuizId && quizResults.isLoading && (
          <Typography variant="subtitle2" textAlign={"center"}>
            Loading...
          </Typography>
        )}
        <Box display={"flex"} flexDirection={"column"} gap={2}>
          {filteredData?.map((tr) => (
            <ResultCard quizResult={tr} key={tr.id} />
          ))}
        </Box>
      </Box>
    </>
  );
};

const ResultCard = ({ quizResult }: { quizResult: QuizResultAdminData }) => {
  const isPassed = quizResult.score >= quizResult.quiz.minimumScore;
  const color = isPassed ? "green" : "red";

  return (
    <Box
      border={"1px solid"}
      borderColor={"lightgray"}
      borderRadius={2}
      px={2}
      py={1}
      display={"flex"}
      flexDirection={{ xs: "column", lg: "row" }}
      alignItems={"center"}
      gap={2}
    >
      <UserInfo user={quizResult.user} />
      <Divider orientation="vertical" flexItem />
      <Box textAlign={{ xs: "center", lg: "start" }}>
        <Typography color={color} variant="subtitle1" fontWeight={"bold"}>
          {isPassed ? "Quiz passed" : "Quiz failed"}
        </Typography>
        <Typography variant="body2">
          {quizResult.score} points out of {quizResult.quiz.minimumScore}{" "}
          minimum
        </Typography>
      </Box>
      <Box ml={{ lg: 1 }}>
        <Typography variant="body2">
          • {quizResult.quiz.minimumScore} minimum points
        </Typography>
        <Typography variant="body2">
          • {quizResult.maxScore} maximum points
        </Typography>
      </Box>
      <Box ml={{ lg: 1 }}>
        <Typography variant="body2" color={"green"}>
          • {quizResult.countCorrect} correct answers
        </Typography>
        <Typography variant="body2" color={"red"}>
          • {quizResult.countIncorrect} incorrect answers
        </Typography>
      </Box>
      <Typography variant="body2" ml={{ lg: "auto" }}>
        Passed at {formatDate(quizResult.createdAt)}
      </Typography>
      <Divider orientation="vertical" flexItem />
      <Link href={`/result/${quizResult.id}`}>
        <Button variant="text">Details</Button>
      </Link>
    </Box>
  );
};
