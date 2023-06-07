import type { TestCreateObject } from "@/types/test";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { TestForm } from "@/components/TestForm";
import { useAdminSession } from "@/hooks/session";
import Head from "next/head";

export default function CreateTest() {
  const { mutateAsync } = api.tests.createTest.useMutation();
  const { push } = useRouter();
  useAdminSession();

  const onSubmit = (formValues: TestCreateObject) => {
    mutateAsync({ testCreateObject: formValues }).then(
      (createdSuccessfully) => {
        createdSuccessfully && push("/test");
      }
    );
  };

  return (
    <>
      <Head>
        <title>Create new test</title>
      </Head>
      <TestForm onSubmit={onSubmit} />
    </>
  );
}
