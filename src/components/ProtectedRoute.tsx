"use server";

import { getSession } from "@/utils/session";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";

export default async function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactElement;
  roles?: ("user" | "admin")[];
}) {
  const session = await getSession(await headers());

  if (!session) {
    redirect("/");
  }

  if (roles?.includes("admin") && !session.user.isAdmin) {
    redirect("/");
  }

  return children;
}
