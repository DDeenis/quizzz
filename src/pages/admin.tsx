import { TabPanel } from "@/components/TabPanel";
import { useAdminSession } from "@/hooks/session";
import { TestResultAdminData } from "@/types/testResult";
import { api } from "@/utils/api";
import { stringAvatar } from "@/utils/user";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

export default function AdminPage() {
  const session = useAdminSession();
  const [currentTab, setCurrentTab] = React.useState(0);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const testOptions = api.admin.getTestOptions.useQuery();
  const testResults = api.admin.getResultsForTest.useQuery(
    {
      testId: selectedTestId,
    },
    { enabled: false }
  );

  const filteredData = useMemo(() => {
    return selectedUserId
      ? testResults.data?.filter((tr) => tr.userId === selectedUserId)
      : testResults.data;
  }, [testResults.dataUpdatedAt, selectedUserId]);

  const userOptions = useMemo(() => {
    return testResults.data
      ?.map((tr) => ({
        id: tr.userId,
        name: tr.users.fullName,
      }))
      .filter((o, i, arr) => arr.findLastIndex((t) => t.id === o.id) === i);
  }, [testResults.dataUpdatedAt]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleTestChange = (event: SelectChangeEvent<string>) => {
    setSelectedTestId(event.target.value);
  };
  const handleUserChange = (event: SelectChangeEvent<string>) => {
    setSelectedUserId(event.target.value);
  };

  useEffect(() => {
    if (selectedTestId) {
      setSelectedUserId("");
      testResults.refetch();
    }
  }, [selectedTestId]);

  return (
    <Box>
      <Head>
        <title>Admin panel</title>
      </Head>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 3,
          maxWidth: "lg",
          width: "100%",
          mx: "auto",
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="basic tabs example"
          centered
        >
          <Tab label="Test results" />
          <Tab label="Users" />
        </Tabs>
      </Box>
      <TabPanel value={currentTab} index={0}>
        <Box
          display={"flex"}
          flexWrap={"wrap"}
          gap={2}
          maxWidth={"lg"}
          mx={"auto"}
        >
          <FormControl fullWidth sx={{ maxWidth: 340 }}>
            <InputLabel id={`test-select-label`}>Test</InputLabel>
            <Select
              labelId={`test-select-label`}
              label="Test"
              value={selectedTestId}
              onChange={handleTestChange}
            >
              {testOptions.data?.map((o) => (
                <MenuItem value={o.id} key={o.id}>
                  {o.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ maxWidth: 340 }}>
            <InputLabel id={`test-select-label`}>User</InputLabel>
            <Select
              labelId={`test-select-label`}
              label="User"
              value={selectedUserId}
              disabled={!userOptions?.length}
              onChange={handleUserChange}
            >
              <MenuItem value={""}>-- all --</MenuItem>
              {userOptions?.map((o) => (
                <MenuItem value={o.id} key={o.id}>
                  {o.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box mt={4} maxWidth={"lg"} mx={"auto"}>
          {!selectedTestId && (
            <Typography variant="subtitle2" textAlign={"center"}>
              Select test to see the data
            </Typography>
          )}
          {filteredData && filteredData.length === 0 && (
            <Typography variant="subtitle2" textAlign={"center"}>
              No data to display
            </Typography>
          )}
          {selectedTestId && testResults.isLoading && (
            <Typography variant="subtitle2" textAlign={"center"}>
              Loading...
            </Typography>
          )}
          <Box display={"flex"} flexDirection={"column"} gap={2}>
            {filteredData?.map((tr) => (
              <ResultCard testResult={tr} key={tr.id} />
            ))}
          </Box>
        </Box>
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        not implemented
      </TabPanel>
    </Box>
  );
}

const ResultCard = ({ testResult }: { testResult: TestResultAdminData }) => {
  const isPassed = testResult.score >= testResult.tests.minimumScore;
  const color = isPassed ? "green" : "red";

  return (
    <Box
      border={"1px solid"}
      borderColor={"lightgray"}
      borderRadius={2}
      px={2}
      py={1}
      display={"flex"}
      flexDirection={{ xs: "column", lg: "row" }}
      alignItems={"center"}
      gap={2}
    >
      <Box
        display={"flex"}
        alignItems={"center"}
        gap={1}
        alignSelf={{ xs: "flex-start", lg: "inherit" }}
        maxWidth={220}
        width={"100%"}
      >
        <Link href={`/user/${testResult.userId}`}>
          <Avatar {...stringAvatar(testResult.users.fullName)} />
        </Link>
        <div>
          <Link href={`/user/${testResult.userId}`}>
            <Typography variant="body1">{testResult.users.fullName}</Typography>
          </Link>
          <Typography variant="caption">{testResult.users.email}</Typography>
        </div>
      </Box>
      <Divider orientation="vertical" flexItem />
      <Box>
        <Typography color={color} variant="subtitle1" fontWeight={"bold"}>
          {isPassed ? "Test passed" : "Test failed"}
        </Typography>
        <Typography variant="body2">
          {testResult.score} points out of {testResult.tests.minimumScore}{" "}
          minimum
        </Typography>
      </Box>
      <Box ml={{ lg: 1 }}>
        <Typography variant="body2">
          • {testResult.tests.minimumScore} minimum points
        </Typography>
        <Typography variant="body2">
          • {testResult.maxScore} maximum points
        </Typography>
      </Box>
      <Box ml={{ lg: 1 }}>
        <Typography variant="body2" color={"green"}>
          • {testResult.countCorrect} correct answers
        </Typography>
        <Typography variant="body2" color={"red"}>
          • {testResult.countIncorrect} incorrect answers
        </Typography>
      </Box>
      <Typography variant="body2" ml={"auto"}>
        Passed at {formatDate(testResult.createdAt)}
      </Typography>
      <Divider orientation="vertical" flexItem />
      <Link href={`/result/${testResult.id}`}>
        <Button variant="text">Details</Button>
      </Link>
    </Box>
  );
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.toLocaleDateString()} ${date.getHours()}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};
