import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import React from "react";
import { useForm } from "react-hook-form";
import { api } from "@/utils/api";
import type { UserCreateObject } from "@/types/user";
import { signIn } from "next-auth/react";

export const RegisterForm = () => {
  const { mutateAsync, error } = api.auth.register.useMutation();
  const { register, handleSubmit, formState } = useForm<UserCreateObject>({
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit((formData) => {
    mutateAsync(formData)
      .then((u) => {
        if (!u) throw new Error("Failed to register");
        return signIn("email", { email: u.email });
      })
      .catch((err: Error) => {
        console.error(err.message);
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
          error={!!formState.errors.name}
          {...register("name", {
            required: { value: true, message: "Full Name is required" },
          })}
        />
        {formState.errors.name && (
          <FormHelperText error>{formState.errors.name.message}</FormHelperText>
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
              error.data?.zodError?.fieldErrors.name?.[0] ??
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
  const { mutateAsync, isPending, error } = api.auth.signIn.useMutation();

  const onSubmit = handleSubmit((formData) => {
    mutateAsync(formData)
      .then(() => signIn("email", { email: formData.email }))
      .catch(console.error);
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
          {isPending ? "Loading" : "Sign in"}
        </Button>
      </Box>
    </form>
  );
};
