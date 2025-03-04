import { db } from "@/server/db";
import { users, sessions, accounts, verifications } from "@/server/db/schema";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { sendMagicLinkEmail } from "./mail";
import { nextCookies } from "better-auth/next-js";
import { getBaseUrl } from "./trpc/utils";
import { UserRole } from "@/types/user";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  user: {
    additionalFields: {
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
        input: false,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.Student,
        input: false,
      },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async (params) => {
        await sendMagicLinkEmail({
          ...params,
          origin: new URL(getBaseUrl()).origin,
        });
      },
    }),
    nextCookies(), // make sure this is the last plugin in the array
  ],
});

export type Session = typeof auth.$Infer.Session;
