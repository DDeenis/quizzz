import { useSession } from "@/server/auth/client";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const useProtectedSession = () => {
  const { push } = useRouter();
  const session = useSession();
  const isAuthenticated = session.data && !session.isPending;

  useEffect(() => {
    if (!isAuthenticated) {
      void push("/");
    }
  }, [isAuthenticated]);

  return session;
};

export const useAdminSession = () => {
  const { push } = useRouter();
  const session = useSession();
  const isAuthenticated = session.data && !session.isPending;
  const isAuthorized = isAuthenticated && session.data?.user.isAdmin;

  useEffect(() => {
    if (!isAuthenticated || !isAuthorized) {
      void push("/");
    }
  }, [isAuthenticated, isAuthorized]);

  return session;
};
