import type { User, UserCreateObject } from "@/types/user";
import { supabase } from "./supabase";

export const getAllUsers = async (excludeId: string) => {
  const result = await supabase.from("users").select().neq("id", excludeId);
  return (result.data ?? []) as User[];
};

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

export const updateUser = async (
  userId: string,
  userUpdateObject: Partial<UserCreateObject>
) => {
  try {
    const result = await supabase
      .from("users")
      .update(userUpdateObject)
      .eq("id", userId)
      .select();

    return result.data?.[0] as User;
  } catch (err) {
    console.error(err);
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const result = await supabase
      .from("users")
      .update({ deletedAt: new Date().toISOString() })
      .eq("id", userId);

    if (result.error) throw result.error;

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const restoreUser = async (userId: string) => {
  try {
    const result = await supabase
      .from("users")
      .update({ deletedAt: null })
      .eq("id", userId);

    if (result.error) throw result.error;

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
