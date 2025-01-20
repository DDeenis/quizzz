import Box from "@mui/material/Box";
import Header from "./Header";
import Head from "next/head";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box display={"flex"} flexDirection={"column"} height={"100%"}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* @ts-expect-error legacy code that does not work and will be removed */}
      <Header />
      <Box p={4} flexGrow={1}>
        {children}
      </Box>
    </Box>
  );
}
