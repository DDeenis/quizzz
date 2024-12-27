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
import Button from "@mui/material/Button";
import { formatDate, isQuizSessionExpired } from "@/utils/questions";
import React from "react";
import type { QuizSessionFull } from "@/types/quizSession";
import DeleteIcon from "@mui/icons-material/Delete";
import { findLastIndex } from "@/utils/general";
import { api } from "@/utils/trpc/client";

export const AdminSessionsTab = () => {
  const [selectedQuizId, setSelectedQuizId] = React.useState<string>("");
  const [selectedUserId, setSelectedUserId] = React.useState<string>("");

  const quizOptions = api.admin.getQuizOptions.useQuery();
  const quizResults = api.admin.getQuizSessions.useQuery(
    {
      quizId: selectedQuizId,
    },
    { enabled: false }
  );
  const deleteSession = api.studentQuizes.removeQuizSession.useMutation();

  const filteredData = React.useMemo(() => {
    return selectedUserId
      ? quizResults.data?.filter((tr) => tr.userId === selectedUserId)
      : quizResults.data;
  }, [selectedUserId, quizResults.data]);

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
  const onDelete = (quizSessionId: string) => {
    void deleteSession
      .mutateAsync({ quizSessionId })
      .then((isDeleted) => isDeleted && void quizResults.refetch());
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
          {filteredData?.map((qs) => (
            <SessionCard quizSession={qs} onDelete={onDelete} key={qs.id} />
          ))}
        </Box>
      </Box>
    </>
  );
};

const SessionCard = ({
  quizSession,
  onDelete,
}: {
  quizSession: QuizSessionFull;
  onDelete: (sessionId: string) => void;
}) => {
  const isExpired = isQuizSessionExpired(quizSession);
  const color = isExpired ? "red" : "green";

  const handleDelete = () => onDelete(quizSession.id);

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
      bgcolor={isExpired ? "lightgray" : "transparent"}
    >
      <UserInfo user={quizSession.user} />
      <Divider orientation="vertical" flexItem />
      <Box textAlign={{ xs: "center", lg: "start" }}>
        <Typography variant="subtitle1" fontWeight={"bold"}>
          {quizSession.quiz.name}
        </Typography>
        <Typography variant="body2" color={color}>
          {isExpired ? "Session expired" : "Session is life"}
        </Typography>
      </Box>
      <Box ml={{ lg: 1 }}>
        <Typography variant="body2">
          Started at {formatDate(quizSession.createdAt)}
        </Typography>
        <Typography variant="body2">
          Expires at {formatDate(quizSession.expires)}
        </Typography>
      </Box>
      {isExpired && (
        <Typography variant="body2" ml={{ lg: "auto" }}>
          Expired at {formatDate(quizSession.expires)}
        </Typography>
      )}
      <Divider
        orientation="vertical"
        flexItem
        sx={{ ml: isExpired ? 0 : "auto" }}
      />
      <Button color="error" onClick={handleDelete}>
        <DeleteIcon sx={{ mr: 1 }} />
        Delete
      </Button>
    </Box>
  );
};
