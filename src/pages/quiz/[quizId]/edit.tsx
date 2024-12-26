import type { QuizUpdateObject } from "@/types/quiz";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { QuizForm } from "@/components/QuizForm";
import { useEffect, useRef } from "react";
import type {
  QuestionCreateObject,
  QuestionUpdateObject,
} from "@/types/question";
import Head from "next/head";
import { getServerSidePropsAdminPreset } from "@/server/auth/ssrPresets";

export const getServerSideProps = getServerSidePropsAdminPreset;

export default function EditQuiz() {
  const router = useRouter();
  const { quizId } = router.query;
  const { data: quiz, refetch } = api.quizes.getById.useQuery(
    { quizId: (quizId as string | undefined) ?? "" },
    { enabled: false, staleTime: 0 }
  );
  const { mutateAsync } = api.quizes.updateQuiz.useMutation();
  const deletedQuestionsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!router.isReady || !quizId) {
      return;
    }

    void refetch();
  }, [quizId, router.isReady]);

  const onSubmit = (formValues: QuizUpdateObject) => {
    void mutateAsync({
      quizId: quizId as string,
      quizUpdateObject: formValues,
      deletedQuestionIds: deletedQuestionsRef.current,
    }).then((createdSuccessfully) => {
      if (createdSuccessfully) {
        void router.push("/quiz");
      }
    });
  };

  const onRemoveQuestion = (
    question: QuestionCreateObject | QuestionUpdateObject
  ) => {
    if ("id" in question && question.id) {
      deletedQuestionsRef.current.push(question.id);
    }
  };

  return (
    <>
      <Head>
        <title>Edit {quiz?.name}</title>
      </Head>
      {quiz ? (
        <QuizForm
          onSubmit={onSubmit}
          onRemoveQuestion={onRemoveQuestion}
          quiz={quiz}
        />
      ) : null}
    </>
  );
}
