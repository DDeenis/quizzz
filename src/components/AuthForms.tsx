import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React from "react";
import { useForm } from "react-hook-form";
import { api } from "@/utils/api";
import { UserCreateObject } from "@/utils/types";
import { signIn } from "next-auth/react";

export const RegisterForm = () => {
  const { mutateAsync } = api.auth.register.useMutation();
  const { register, handleSubmit } = useForm<UserCreateObject>();

  const onSubmit = handleSubmit((formData) => {
    mutateAsync(formData).then((u) => {
      u && signIn("email", { email: u.email });
    });
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)}>
      <legend>
        <Typography variant="h4" textAlign={"center"} mb={3}>
          Register
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
          {...register("fullName", { required: true })}
        />
        <TextField
          type="email"
          id="email-input"
          label="Email"
          variant="outlined"
          fullWidth
          required
          {...register("email", { required: true })}
        />
        <Button type="submit" variant="contained">
          Register
        </Button>
      </Box>
    </form>
  );
};

export const SignInForm = () => {
  const { register, handleSubmit } = useForm<{ email: string }>();

  const onSubmit = handleSubmit(({ email }) => {
    signIn("email", { email });
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)}>
      <legend>
        <Typography variant="h4" textAlign={"center"} mb={3}>
          Sign In
        </Typography>
      </legend>
      <Box display={"flex"} flexDirection={"column"} gap={2}>
        <TextField
          type="email"
          id="email-input"
          label="Email"
          variant="outlined"
          fullWidth
          required
          {...register("email", { required: true })}
        />
        <Button type="submit" variant="contained">
          Sign in
        </Button>
      </Box>
    </form>
  );
};
