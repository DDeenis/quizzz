import type { QuizCreateObject } from "@/types/quiz";
import { useRouter } from "next/router";
import { api } from "@/utils/trpc/client";
import { QuizForm } from "@/components/QuizForm";
import Head from "next/head";
import { getServerSidePropsAdminPreset } from "@/server/auth/ssrPresets";

export const getServerSideProps = getServerSidePropsAdminPreset;

export default function CreateQuiz() {
  const { mutateAsync } = api.quizes.createQuiz.useMutation();
  const { push } = useRouter();

  const onSubmit = (formValues: QuizCreateObject) => {
    void mutateAsync({ quizCreateObject: formValues }).then(
      (createdSuccessfully) => {
        if (createdSuccessfully) {
          void push("/quiz");
        }
      }
    );
  };

  return (
    <>
      <Head>
        <title>Create new quiz</title>
      </Head>
      <QuizForm onSubmit={onSubmit} />
    </>
  );
}
