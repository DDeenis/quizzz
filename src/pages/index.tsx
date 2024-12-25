import Head from "next/head";
import Box from "@mui/material/Box";
import { SignInForm } from "@/components/AuthForms";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "@/server/auth/client";

export default function Home() {
  const { data, isPending } = useSession();
  const { push } = useRouter();

  useEffect(() => {
    if (data && !isPending) {
      void push("/quiz");
    }
  }, [data, isPending]);

  return (
    <>
      <Head>
        <title>Quiz App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        height={"100%"}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Box maxWidth={400} width={"100%"}>
          <SignInForm />
        </Box>
      </Box>
    </>
  );
}
