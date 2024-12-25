import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormHelperText from "@mui/material/FormHelperText";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "@/server/auth/client";

export const SignInForm = () => {
  const { register, handleSubmit, formState } = useForm<{ email: string }>({
    reValidateMode: "onChange",
  });
  const [error, setError] = useState<{ message?: string } | null>(null);

  const onSubmit = handleSubmit(async (formData) => {
    setError(null);

    const { error } = await signIn.magicLink({
      email: formData.email,
      callbackURL: "/quiz",
    });

    setError(error);
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate>
      <legend>
        <Typography variant="h4" textAlign={"center"} mb={3}>
          Welcome to Quiz App
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
        {error && <FormHelperText error>{error.message}</FormHelperText>}
        <Button type="submit" variant="contained">
          Continue
        </Button>
      </Box>
    </form>
  );
};
