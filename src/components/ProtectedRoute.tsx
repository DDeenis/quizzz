"use server";

import { UserRole } from "@/types/user";
import { getSession } from "@/utils/user/session";
import { isAdmin, isTeacher } from "@/utils/user/authorization";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";

export default async function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactElement;
  roles?: UserRole[];
}) {
  const session = await getSession(await headers());

  if (!session) {
    redirect("/");
  }

  if (roles?.includes(UserRole.Teacher) && !isTeacher(session.user)) {
    redirect("/");
  }

  if (roles?.includes(UserRole.Admin) && !isAdmin(session.user)) {
    redirect("/");
  }

  return children;
}
