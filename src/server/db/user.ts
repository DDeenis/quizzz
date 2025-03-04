import { eq } from "drizzle-orm";
import { db } from ".";
import { users } from "./schema";
import type { User } from "@/types/user";
import { cache } from "react";

export const getUserFromDb = cache(
  (userId: string): Promise<User | undefined> => {
    return db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((r) => r[0]);
  }
);
