import type { TestCreateObject } from "@/types/test";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { TestForm } from "@/components/TestForm";

export default function CreateTest() {
  const { mutateAsync } = api.tests.createTest.useMutation();
  const { push } = useRouter();
  const { data } = useSession({
    required: true,
    onUnauthenticated() {
      push("/");
    },
  });

  const onSubmit = (formValues: TestCreateObject) => {
    mutateAsync({ testCreateObject: formValues }).then(
      (createdSuccessfully) => {
        createdSuccessfully && push("/test");
      }
    );
  };

  return <TestForm onSubmit={onSubmit} />;
}
