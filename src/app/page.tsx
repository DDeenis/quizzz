"use server";
import SignInPage from "@/components/pages/auth/SignInPage";
import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    return redirect("/home");
  }

  return <SignInPage />;
}
