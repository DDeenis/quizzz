import type { User, UserCreateObject } from "@/utils/types";
import { supabase } from "./supabase";
import { log } from "console";

export const getUserById = async (id: string): Promise<User | undefined> => {
  const matches = await supabase.from("users").select().eq("id", id);
  const user = matches.data?.[0];

  return user as User;
};

export const createUser = async (userCreateObj: UserCreateObject) => {
  const result = await supabase
    .from("users")
    .insert({ email: userCreateObj.email, fullName: userCreateObj.fullName })
    .select();
  const user = result.data?.[0] as User | undefined;

  if (!user) return null;

  return user;
};
