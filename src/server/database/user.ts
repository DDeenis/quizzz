import type { User, UserCreateObject } from "@/types/user";
import { supabase } from "./supabase";

export const getUserById = async (id: string) => {
  const matches = await supabase.from("users").select().eq("id", id);
  const user = matches.data?.[0];

  return user as User | undefined;
};

export const getUserByEmail = async (email: string) => {
  const matches = await supabase
    .from("users")
    .select("id, email, fullName, createdAt, deletedAt, admins ( id )")
    .eq("email", email);
  const user = matches.data?.[0];

  if (!user) return null;

  return { ...user, isAdmin: !!(user.admins as any[])?.length } as
    | User
    | undefined;
};

export const createUser = async (userCreateObj: UserCreateObject) => {
  const result = await supabase.from("users").insert(userCreateObj).select();
  const user = result.data?.[0];

  return user as User | undefined;
};
