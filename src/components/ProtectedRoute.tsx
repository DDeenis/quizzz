"use server";

import { auth } from "@/utils/auth";
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
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/");
  }

  if (roles?.includes("admin") && !session.user.isAdmin) {
    redirect("/");
  }

  return children;
}
