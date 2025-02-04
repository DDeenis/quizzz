import type { UserCreateObject } from "@/types/user";
import { db } from ".";
import { eq, not, sql } from "drizzle-orm";
import { users } from "./schema";

export const getAllUsers = async (excludeId: string) => {
  return await db.query.users.findMany({ where: not(eq(users.id, excludeId)) });
};

export const getUserById = async (id: string) => {
  return await db.query.users.findFirst({ where: eq(users.id, id) });
};

export const getUserByEmail = async (email: string) => {
  return await db.query.users.findFirst({ where: eq(users.email, email) });
};

export const createUser = async (userCreateObj: UserCreateObject) => {
  const createdUsers = await db
    .insert(users)
    .values({ ...userCreateObj, emailVerified: false })
    .returning();
  return createdUsers[0];
};

export const updateUser = async (
  userId: string,
  userUpdateObject: Partial<UserCreateObject>
) => {
  try {
    const user = await db
      .update(users)
      .set(userUpdateObject)
      .where(eq(users.id, userId))
      .returning();
    return user;
  } catch (err) {
    console.error(err);
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await db
      .update(users)
      .set({ deletedAt: sql`(unixepoch())` })
      .where(eq(users.id, userId));
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const restoreUser = async (userId: string) => {
  try {
    await db.update(users).set({ deletedAt: null }).where(eq(users.id, userId));
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
