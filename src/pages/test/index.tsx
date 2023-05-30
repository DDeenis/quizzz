import { QuestionType } from "@/types/question";
import { QuestionComplexity } from "@/types/question";
import { Test } from "@/types/test";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

const mockTests: Test[] = [
  {
    id: "1",
    authorId: "36cfcdbd-7343-4e32-b37d-9c5f2f3cea35",
    name: "Test of test",
    description: "abobus",
    time: 1 * 60 * 60,
    questionsCount: 4,
    questions: [
      {
        id: "1",
        testId: "1",
        questionData: {
          question: "Who is test",
          variants: ["idk", "test", "amogus"],
        },
        answerData: {
          answer: "idk",
        },
        complexity: QuestionComplexity.Low,
        questionType: QuestionType.SingleVariant,
      },
      {
        id: "2",
        testId: "1",
        questionData: {
          question: "Who is the best",
          variants: ["you", "me", "amogus"],
        },
        answerData: {
          answer: "amogus",
        },
        complexity: QuestionComplexity.Low,
        questionType: QuestionType.SingleVariant,
      },
      {
        id: "3",
        testId: "1",
        questionData: {
          question: "Who is multiple1",
          variants: ["idk", "test", "amogus"],
        },
        answerData: {
          answers: ["amogus", "idk"],
        },
        complexity: QuestionComplexity.Medium,
        questionType: QuestionType.MultipleVariants,
      },
      {
        id: "4",
        testId: "1",
        questionData: {
          question: "Who is multiple2",
          variants: ["idk", "test", "amogus"],
        },
        answerData: {
          answers: ["idk", "test"],
        },
        complexity: QuestionComplexity.High,
        questionType: QuestionType.MultipleVariants,
      },
    ],
  },
];

export default function TestsListPage() {
  const { push } = useRouter();
  const tests = mockTests;
  const { data } = useSession({
    required: true,
    onUnauthenticated() {
      push("/");
    },
  });

  return (
    <>
      {data?.user.isAdmin && (
        <Link href={`test/create`}>
          <Button variant="contained" sx={{ mb: 3 }}>
            Create new test
          </Button>
        </Link>
      )}
      <Box display={"flex"} flexWrap={"wrap"} gap={4}>
        {tests.map((test) => (
          <TestCard test={test} isAdmin={data?.user.isAdmin} key={test.id} />
        ))}
      </Box>
    </>
  );
}

const TestCard = ({ test, isAdmin }: { test: Test; isAdmin?: boolean }) => {
  return (
    <Box
      p={2}
      maxWidth={"300px"}
      width={"100%"}
      border={1}
      borderColor={"lightgray"}
      borderRadius={2}
    >
      <Typography variant="h4" textAlign={"center"} mb={2}>
        {test.name}
      </Typography>
      <Box mb={2}>
        <Typography variant="subtitle1">
          • {test.questionsCount} questions
        </Typography>
        <Typography variant="subtitle1">• {test.time / 60} minutes</Typography>
      </Box>
      {!isAdmin && (
        <Link href={`test/${test.id}`}>
          <Button variant="contained" fullWidth>
            Start test
          </Button>
        </Link>
      )}
      {isAdmin && (
        <>
          <Link href={`test/${test.id}/edit`}>
            <Button variant="outlined" fullWidth sx={{ mb: 1 }}>
              Edit test
            </Button>
          </Link>
          <Button variant="outlined" color="error" fullWidth>
            Delete test
          </Button>
        </>
      )}
    </Box>
  );
};
