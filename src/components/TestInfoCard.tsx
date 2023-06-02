import { Test } from "@/types/test";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

interface TestInfoCardProps {
  borderColor?: string;
  testInfo: Omit<Test, "questions">;
  contentSection?: React.ReactNode;
  actionsSection?: React.ReactNode;
}

export const TestInfoCard = ({
  testInfo,
  borderColor,
  contentSection,
  actionsSection,
}: TestInfoCardProps) => {
  return (
    <Card sx={{ maxWidth: 700, width: "100%", borderColor }} variant="outlined">
      <CardContent>
        <Typography variant="h4" component="div" textAlign={"center"}>
          {testInfo.name}
        </Typography>
        <Box display={"flex"} flexWrap={"wrap"} gap={1} my={2}>
          <Chip color="info" label={`${testInfo.questionsCount} questions`} />
          <Chip color="info" label={`${testInfo.time} minutes`} />
          <Chip
            color="warning"
            label={`Minimum ${testInfo.minimumScore} points to pass`}
          />
        </Box>
        <Typography variant="body1" mb={2}>
          {testInfo.description}
        </Typography>
        {contentSection}
      </CardContent>
      {actionsSection && <CardActions>{actionsSection}</CardActions>}
    </Card>
  );
};
