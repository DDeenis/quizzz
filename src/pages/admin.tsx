import { TabPanel } from "@/components/TabPanel";
import { useAdminSession } from "@/hooks/session";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Head from "next/head";
import React, { useEffect } from "react";
import { AdminQuizTab } from "@/components/AdminQuizTab";
import { AdminUsersTab } from "@/components/AdminUserTab";
import { AdminSessionsTab } from "@/components/AdminSessionsTab";

export default function AdminPage() {
  const session = useAdminSession();
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box maxWidth={"lg"} mx={"auto"}>
      <Head>
        <title>Admin panel</title>
      </Head>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="basic tabs example"
          centered
        >
          <Tab label="Quiz results" />
          <Tab label="Quiz sessions" />
          <Tab label="Users" />
        </Tabs>
      </Box>
      <TabPanel value={currentTab} index={0}>
        <AdminQuizTab />
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <AdminSessionsTab />
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
        <AdminUsersTab />
      </TabPanel>
    </Box>
  );
}
