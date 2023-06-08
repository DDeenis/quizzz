import Head from "next/head";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { RegisterForm, SignInForm } from "@/components/AuthForms";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { TabPanel } from "@/components/TabPanel";

export default function Home() {
  const [currentTab, setCurrentTab] = React.useState(0);
  const { status } = useSession();
  const { push } = useRouter();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  useEffect(() => {
    if (status === "authenticated") {
      push("/quiz");
    }
  }, [status]);

  return (
    <>
      <Head>
        <title>Sign In</title>
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
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              mb: 3,
              maxWidth: 400,
              width: "100%",
            }}
          >
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              aria-label="basic tabs example"
              centered
            >
              <Tab label="Sign In" />
              <Tab label="Register" />
            </Tabs>
          </Box>
          <TabPanel value={currentTab} index={0}>
            <SignInForm />
          </TabPanel>
          <TabPanel value={currentTab} index={1}>
            <RegisterForm />
          </TabPanel>
        </Box>
      </Box>
    </>
  );
}
