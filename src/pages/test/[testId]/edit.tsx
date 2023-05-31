import type { TestCreateObject, TestUpdateObject } from "@/types/test";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { TestForm } from "@/components/TestForm";
import { useEffect, useRef } from "react";
import { QuestionCreateObject, QuestionUpdateObject } from "@/types/question";
import { useAdminSession } from "@/hooks/session";

export default function EditTest() {
  const router = useRouter();
  const { testId } = router.query;
  const { data: test, refetch } = api.tests.getById.useQuery(
    { testId: (testId as string | undefined) ?? "" },
    { enabled: false, cacheTime: 0, staleTime: 0 }
  );
  useAdminSession();
  const { mutateAsync } = api.tests.updateTest.useMutation();
  const deletedQuestionsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    refetch();
  }, [testId, router.isReady]);

  const onSubmit = (formValues: TestUpdateObject) => {
    mutateAsync({
      testId: testId as string,
      testUpdateObject: formValues,
      deletedQuestionIds: deletedQuestionsRef.current,
    }).then((createdSuccessfully) => {
      createdSuccessfully && router.push("/test");
    });
  };

  const onRemoveQuestion = (
    question: QuestionCreateObject | QuestionUpdateObject
  ) => {
    if ("id" in question && question.id) {
      deletedQuestionsRef.current.push(question.id);
    }
  };

  return test ? (
    <TestForm
      onSubmit={onSubmit}
      onRemoveQuestion={onRemoveQuestion}
      test={test}
    />
  ) : null;
}
