import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useLayoutEffect } from "react";

export const useProtectedSession = () => {
  const { push } = useRouter();
  const session = useSession({
    required: true,
    onUnauthenticated() {
      push("/");
    },
  });
  return session;
};

export const useAdminSession = () => {
  const { push } = useRouter();
  const session = useSession({
    required: true,
    onUnauthenticated() {
      push("/");
    },
  });

  useLayoutEffect(() => {
    if (!session.data?.user.isAdmin) {
      push("/");
    }
  }, []);

  return session;
};
