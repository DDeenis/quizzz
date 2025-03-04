import "server-only";
import { cache } from "react";
import { auth } from "../auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const getSession = cache(async (headers: Headers) => {
  return await auth.api.getSession({ headers });
});

export const getUser = async () => {
  const session = await getSession(await headers());
  return session?.user;
};

export const getLoggedInUser = async () => {
  const user = await getUser();

  if (!user) redirect("/");

  return user;
};
