import { api } from "@/utils/api";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { stringAvatar } from "@/utils/user";
import Button from "@mui/material/Button";
import Link from "next/link";
import type { QuizResultWithQuizPreview } from "@/types/quizResult";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import type { User, UserCreateObject } from "@/types/user";
import FormHelperText from "@mui/material/FormHelperText";
import Head from "next/head";
import { formatDate } from "@/utils/questions";
import type { QuizSessionWithQuiz } from "@/types/quizSession";
import { useServerSerializedValue } from "@/hooks/useServerSerializedValue";
import type { InferGetServerSidePropsType } from "next";
import { getServerSidePropsProtectedPreset } from "@/server/auth/ssrPresets";

export const getServerSideProps = getServerSidePropsProtectedPreset;

export default function ProfilePage(
  params: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const userFromServer = useServerSerializedValue<User>(params.serializedUser);
  const router = useRouter();
  const { userId } = router.query;
  const user = api.users.getById.useQuery(
    { userId: userId as string },
    {
      initialData: userFromServer,
      enabled: false,
      staleTime: Infinity,
    }
  );
  const quizResults = api.quizResults.getAllByUser.useQuery(
    { userId: userId as string },
    { enabled: false }
  );
  const quizSessions = api.quizResults.getActiveQuizSessions.useQuery();
  const updateUserData = api.users.update.useMutation();
  const [modalOpen, setModalOpen] = useState(false);

  const isPresonalProfile = user.data.id === userId;
  const canViewDetailed = isPresonalProfile || user.data.isAdmin;

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const updateUser = (obj: Partial<UserCreateObject>) => {
    updateUserData
      .mutateAsync({
        userId: userId as string,
        userUpdateObject: obj,
      })
      .then(() => {
        void user.refetch();
        closeModal();
      })
      .catch(console.error);
  };

  const avatarProps = user.data ? stringAvatar(user.data.name) : undefined;

  useEffect(() => {
    if (!router.isReady) return;
    void user.refetch();
  }, [router.isReady]);

  useEffect(() => {
    if (!canViewDetailed) return;
    void quizResults.refetch();
  }, [canViewDetailed]);

  return (
    <>
      <Head>
        <title>Profile: {user.data?.name}</title>
      </Head>
      {user.isLoading ? (
        <Typography variant="body2">Loading...</Typography>
      ) : user.data ? (
        <>
          <Box
            display={"flex"}
            flexDirection={"column"}
            gap={2}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Box maxWidth={"sm"} mb={2}>
              <Avatar
                alt={user.data.name}
                sx={{
                  width: 164,
                  height: 164,
                  fontSize: "4.5rem",
                  mx: "auto",
                  ...avatarProps!.sx,
                }}
              >
                {avatarProps?.children}
              </Avatar>
              <Typography variant="h4" textAlign={"center"} mt={2} mb={1}>
                {user.data.name}
              </Typography>
              {canViewDetailed && (
                <Typography variant="body1" textAlign={"center"}>
                  {user.data.email}
                </Typography>
              )}
              <Typography variant="body1" textAlign={"center"}>
                Member since{" "}
                {new Date(user.data.createdAt).toLocaleDateString()}
              </Typography>
              {isPresonalProfile && (
                <Button
                  variant="contained"
                  sx={{ mx: "auto", mt: 1, display: "flex" }}
                  onClick={openModal}
                >
                  Edit profile
                </Button>
              )}
            </Box>
            {canViewDetailed && Boolean(quizSessions.data?.length) && (
              <Box mb={2}>
                <Typography variant="h5" textAlign={"center"} mb={1}>
                  Active quiz sessions
                </Typography>
                {quizSessions.data?.map((qs) => (
                  <ActiveSessionCard quizSession={qs} key={qs.id} />
                ))}
              </Box>
            )}
            {canViewDetailed && Boolean(quizResults.data?.length) && (
              <Box>
                <Typography variant="h5" textAlign={"center"} mb={1}>
                  Your results
                </Typography>
                <Box display={"flex"} flexWrap={"wrap"} gap={2}>
                  {quizResults.data?.map((tr) => (
                    <ResultCard result={tr} key={tr.id} />
                  ))}
                </Box>
              </Box>
            )}
            <Modal open={modalOpen} onClose={closeModal}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  maxWidth: "400px",
                  width: "100%",
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 4,
                }}
              >
                <EditProfileForm
                  onSubmit={updateUser}
                  onCancel={closeModal}
                  defaultValues={user.data}
                  emailError={updateUserData.error?.message}
                />
              </Box>
            </Modal>
          </Box>
        </>
      ) : (
        <Typography variant="body2" color={"red"}>
          Failed to load user profile
        </Typography>
      )}
    </>
  );
}

const ResultCard = ({ result }: { result: QuizResultWithQuizPreview }) => {
  const isPassed = result.score >= result.quiz.minimumScore;
  const color = isPassed ? "green" : "red";
  return (
    <Box
      p={2}
      width={320}
      border={"1px solid"}
      borderColor={color}
      borderRadius={2}
    >
      <Typography
        variant="subtitle1"
        fontWeight={"bold"}
        textAlign={"center"}
        color={color}
        mb={2}
      >
        {result.quiz.name}
      </Typography>
      <Box component={"ul"}>
        <Box component={"li"}>
          Score:{" "}
          <Typography color={color} fontWeight={"bold"} component={"span"}>
            {result.score}
          </Typography>{" "}
          of{" "}
          <Typography fontWeight={"bold"} component={"span"}>
            {result.quiz.minimumScore}
          </Typography>{" "}
          (maximum {result.maxScore})
        </Box>
        <Box component={"li"}>{result.countCorrect} correct answers</Box>
        <Box component={"li"}>
          {result.countIncorrect} incorrect or partially correct answers
        </Box>
        <Box component={"li"}>Passed at {formatDate(result.createdAt)}</Box>
      </Box>
      <Link href={`/result/${result.id}`}>
        <Button
          variant="outlined"
          color={isPassed ? "success" : "error"}
          fullWidth
        >
          See details
        </Button>
      </Link>
    </Box>
  );
};

const ActiveSessionCard = ({
  quizSession,
}: {
  quizSession: QuizSessionWithQuiz;
}) => {
  return (
    <Box
      p={2}
      width={320}
      border={"1px solid rgba(25, 118, 210, 0.5)"}
      borderRadius={2}
    >
      <Typography
        variant="subtitle1"
        textAlign={"center"}
        mb={2}
        fontSize={"1.25rem"}
      >
        {quizSession.quiz.name}
      </Typography>
      <Link href={`/quiz/${quizSession.quizId}/start/${quizSession.id}`}>
        <Button variant="outlined" fullWidth>
          Continue quiz
        </Button>
      </Link>
    </Box>
  );
};

interface EditProfileFormProps {
  onSubmit: (obj: UserCreateObject) => void;
  onCancel: () => void;
  defaultValues?: UserCreateObject;
  emailError?: string;
}

const EditProfileForm = ({
  onSubmit,
  onCancel,
  defaultValues,
}: EditProfileFormProps) => {
  const { register, handleSubmit, formState } = useForm<UserCreateObject>({
    defaultValues: {
      name: defaultValues?.name,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <legend>
        <Typography variant="h4" textAlign={"center"} mb={3}>
          Edit profile
        </Typography>
      </legend>
      <Box display={"flex"} flexDirection={"column"} gap={2}>
        <TextField
          type="text"
          id="fullName-input"
          label="Full Name"
          variant="outlined"
          fullWidth
          required
          error={!!formState.errors.name}
          {...register("name", {
            required: { value: true, message: "Full Name is required" },
          })}
        />
        {formState.errors.name && (
          <FormHelperText error>{formState.errors.name.message}</FormHelperText>
        )}
        {/* <TextField
          type="email"
          id="email-input"
          label="Email"
          variant="outlined"
          fullWidth
          required
          error={!!formState.errors.email || !!emailError}
          {...register("email", {
            required: { value: true, message: "Email is required" },
          })}
        />
        {formState.errors.email && (
          <FormHelperText error>
            {formState.errors.email.message}
          </FormHelperText>
        )}
        {emailError && <FormHelperText error>{emailError}</FormHelperText>} */}
        <Button type="submit" variant="contained">
          Confirm
        </Button>
        <Button type="reset" variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </form>
  );
};
