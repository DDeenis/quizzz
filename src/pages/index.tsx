import Head from "next/head";
import Box from "@mui/material/Box";
import { SignInForm } from "@/components/AuthForms";
import React from "react";
import type { GetServerSideProps } from "next";
import { auth } from "@/utils/auth";

export const getServerSideProps = (async ({ req }) => {
  const session = await auth.api.getSession({
    headers: new Headers(req.headers as Record<string, string>),
  });
  console.log(session?.user);

  const isAuthenticated = session !== null;
  return isAuthenticated
    ? { redirect: { permanent: false, destination: "/quiz" }, props: {} }
    : { props: {} };
}) satisfies GetServerSideProps;

export default function Home() {
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
