"use server";
import React from "react";
import Header from "../Header";
import { getUser } from "@/utils/session";

export default async function DefaultLayout({
  children,
}: React.PropsWithChildren<unknown>) {
  const user = await getUser();

  return (
    <>
      <Header user={user} />
      {children}
      <footer className="mt-16 bg-gray-100 h-10 flex justify-center items-center">
        <p className="text-sm text-gray-400">
          © 2024, TestThing. All rights reserved.
        </p>
      </footer>
    </>
  );
}
