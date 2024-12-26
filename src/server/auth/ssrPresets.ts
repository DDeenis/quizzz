import { auth } from "@/utils/auth";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import SuperJSON from "superjson";

export async function getServerSidePropsProtectedPreset({
  req,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<{ serializedUser: string }>
> {
  const session = await auth.api.getSession({
    headers: new Headers(req.headers as Record<string, string>),
  });

  return session === null
    ? { redirect: { permanent: false, destination: "/" } }
    : { props: { serializedUser: SuperJSON.stringify(session.user) } };
}

export async function getServerSidePropsAdminPreset({
  req,
}: GetServerSidePropsContext): Promise<
  GetServerSidePropsResult<{ serializedUser: string }>
> {
  const session = await auth.api.getSession({
    headers: new Headers(req.headers as Record<string, string>),
  });

  if (session === null) {
    return { redirect: { permanent: false, destination: "/" } };
  }

  return !session.user.isAdmin
    ? { redirect: { permanent: false, destination: "/quiz" } }
    : { props: { serializedUser: SuperJSON.stringify(session.user) } };
}
