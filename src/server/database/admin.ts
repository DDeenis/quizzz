import { supabase } from "./supabase";

export const isUserAdmin = async (userId: string) => {
  const response = await supabase.from("admins").select().eq("userId", userId);
  return Boolean(response.data?.[0]);
};
