import { Quiz, type QuizPreview } from "@/types/quiz";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

interface QuizInfoCardProps {
  borderColor?: string;
  quizInfo: QuizPreview;
  contentSection?: React.ReactNode;
  actionsSection?: React.ReactNode;
}

export const QuizInfoCard = ({
  quizInfo,
  borderColor,
  contentSection,
  actionsSection,
}: QuizInfoCardProps) => {
  return (
    <Card sx={{ maxWidth: 700, width: "100%", borderColor }} variant="outlined">
      <CardContent>
        <Typography variant="h4" component="div" textAlign={"center"}>
          {quizInfo.name}
        </Typography>
        <Box display={"flex"} flexWrap={"wrap"} gap={1} my={2}>
          <Chip color="info" label={`${quizInfo.questionsCount} questions`} />
          <Chip color="info" label={`${quizInfo.time} minutes`} />
          <Chip
            color="info"
            label={`Attempts: ${quizInfo.attempts ?? "unlimited"}`}
          />
          <Chip
            color="warning"
            label={`Minimum ${quizInfo.minimumScore} points to pass`}
          />
        </Box>
        <Typography variant="body1" mb={2}>
          {quizInfo.description}
        </Typography>
        {contentSection}
      </CardContent>
      {actionsSection && <CardActions>{actionsSection}</CardActions>}
    </Card>
  );
};
