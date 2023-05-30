import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import React from "react";
import { useForm } from "react-hook-form";
import { api } from "@/utils/api";
import { UserCreateObject } from "@/types/user";
import { signIn } from "next-auth/react";

export const RegisterForm = () => {
  const { mutateAsync, error } = api.auth.register.useMutation();
  const { register, handleSubmit, formState } = useForm<UserCreateObject>({
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit((formData) => {
    mutateAsync(formData)
      .then((u) => {
        u && signIn("email", { email: u.email });
      })
      .catch((err) => {
        console.log(err.message);
      });
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate>
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
        <TextField
          type="email"
          id="email-input"
          label="Email"
          variant="outlined"
          fullWidth
          required
          error={!!formState.errors.email || !!error}
          {...register("email", {
            required: { value: true, message: "Email is required" },
          })}
        />
        {formState.errors.email && (
          <FormHelperText error>
            {formState.errors.email.message}
          </FormHelperText>
        )}
        {error && (
          <FormHelperText error>
            {error.data?.zodError?.fieldErrors.email?.[0] ??
              error.data?.zodError?.fieldErrors.fullName?.[0] ??
              error.message}
          </FormHelperText>
        )}
        <Button type="submit" variant="contained">
          Register
        </Button>
      </Box>
    </form>
  );
};

export const SignInForm = () => {
  const { register, handleSubmit, formState } = useForm<{ email: string }>();
  const { mutateAsync, isLoading, error } = api.auth.signIn.useMutation();

  const onSubmit = handleSubmit((formData) => {
    mutateAsync(formData)
      .then(() => {
        signIn("email", { email: formData.email });
      })
      .catch(console.log);
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate>
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
          error={!!formState.errors.email || !!error}
          {...register("email", {
            required: { value: true, message: "Email is required" },
          })}
        />
        {formState.errors.email && (
          <FormHelperText error>
            {formState.errors.email.message}
          </FormHelperText>
        )}
        {error && (
          <FormHelperText error>
            {error.data?.zodError?.fieldErrors.email?.[0] ?? error.message}
          </FormHelperText>
        )}
        <Button type="submit" variant="contained">
          {isLoading ? "Loading" : "Sign in"}
        </Button>
      </Box>
    </form>
  );
};
