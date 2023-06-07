import { useProtectedSession } from "@/hooks/session";
import { api } from "@/utils/api";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { stringAvatar } from "@/utils/user";
import Button from "@mui/material/Button";
import Link from "next/link";
import { TestResultPreview } from "@/types/testResult";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import { UserCreateObject } from "@/types/user";
import FormHelperText from "@mui/material/FormHelperText";
import Head from "next/head";

export default function ProfilePage() {
  const router = useRouter();
  const { userId } = router.query;
  const userData = api.users.getById.useQuery(
    { userId: userId as string },
    { enabled: false, staleTime: Infinity }
  );
  const testResultsData = api.testResults.getAllByUser.useQuery(
    { userId: userId as string },
    { enabled: false }
  );
  const updateUserData = api.users.update.useMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const session = useProtectedSession();

  const isPresonalProfile = session.data?.user.id === userId;
  const canViewDetailed = isPresonalProfile || session.data?.user.isAdmin;

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const updateUser = (obj: Partial<UserCreateObject>) => {
    updateUserData
      .mutateAsync({
        userId: userId as string,
        userUpdateObject: obj,
      })
      .then(() => {
        userData.refetch({ stale: false });
        closeModal();
      })
      .catch(console.log);
  };

  const avatarProps = userData.data
    ? stringAvatar(userData.data.fullName)
    : undefined;

  useEffect(() => {
    if (!router.isReady) return;
    userData.refetch();
  }, [router.isReady]);

  useEffect(() => {
    if (!canViewDetailed) return;
    testResultsData.refetch();
  }, [canViewDetailed]);

  return (
    <>
      <Head>
        <title>Profile: {userData.data?.fullName}</title>
      </Head>
      {userData.isLoading ? (
        <Typography variant="body2">Loading...</Typography>
      ) : userData.data ? (
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
                children={avatarProps?.children}
                alt={userData.data.fullName}
                sx={{
                  width: 164,
                  height: 164,
                  fontSize: "4.5rem",
                  mx: "auto",
                  ...avatarProps!.sx,
                }}
              />
              <Typography variant="h4" textAlign={"center"} mt={2} mb={1}>
                {userData.data.fullName}
              </Typography>
              {canViewDetailed && (
                <Typography variant="body1" textAlign={"center"}>
                  {userData.data.email}
                </Typography>
              )}
              <Typography variant="body1" textAlign={"center"}>
                Member since {new Date(userData.data.createdAt).toDateString()}
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
            {canViewDetailed && Boolean(testResultsData.data?.length) && (
              <>
                <Typography variant="h5" textAlign={"center"}>
                  Your results
                </Typography>
                <Box display={"flex"} flexWrap={"wrap"} gap={2}>
                  {testResultsData.data?.map((tr) => (
                    <ResultCard result={tr} key={tr.id} />
                  ))}
                </Box>
              </>
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
                  defaultValues={userData.data}
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

const ResultCard = ({ result }: { result: TestResultPreview }) => {
  const isPassed = result.score >= result.tests.minimumScore;
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
        {result.tests.name}
      </Typography>
      <Box component={"ul"}>
        <Box component={"li"}>
          Score:{" "}
          <Typography color={color} fontWeight={"bold"} component={"span"}>
            {result.score}
          </Typography>{" "}
          of{" "}
          <Typography fontWeight={"bold"} component={"span"}>
            {result.tests.minimumScore}
          </Typography>{" "}
          (maximum {result.maxScore})
        </Box>
        <Box component={"li"}>{result.countCorrect} correct answers</Box>
        <Box component={"li"}>
          {result.countIncorrect} incorrect or partially correct answers
        </Box>
        <Box component={"li"}>
          Passed at {new Date(result.createdAt).toLocaleDateString()}
        </Box>
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
  emailError,
}: EditProfileFormProps) => {
  const { register, handleSubmit, formState } = useForm<UserCreateObject>({
    defaultValues: {
      fullName: defaultValues?.fullName,
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
          error={!!formState.errors.fullName}
          {...register("fullName", {
            required: { value: true, message: "Full Name is required" },
          })}
        />
        {formState.errors.fullName && (
          <FormHelperText error>
            {formState.errors.fullName.message}
          </FormHelperText>
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
