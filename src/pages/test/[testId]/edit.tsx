import type { TestCreateObject, TestUpdateObject } from "@/types/test";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { TestForm } from "@/components/TestForm";
import { useEffect } from "react";

export default function EditTest() {
  const router = useRouter();
  const { testId } = router.query;
  const { data: test, refetch } = api.tests.getById.useQuery(
    { testId: (testId as string | undefined) ?? "" },
    { enabled: false, cacheTime: 0, staleTime: 0 }
  );
  const { mutateAsync } = api.tests.updateTest.useMutation();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    refetch();
  }, [testId, router.isReady]);

  const { data } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const onSubmit = (formValues: TestUpdateObject) => {
    mutateAsync({
      testId: testId as string,
      testUpdateObject: formValues,
    }).then((createdSuccessfully) => {
      createdSuccessfully && router.push("/test");
    });
  };

  return test ? <TestForm onSubmit={onSubmit} test={test} /> : null;
}
