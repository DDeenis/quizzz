import { db } from "@/server/db";
import { users, sessions, accounts, verifications } from "@/server/db/schema";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { sendMagicLinkEmail } from "./mail";
import { nextCookies } from "better-auth/next-js";
import { getBaseUrl } from "./trpc/utils";

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
      isAdmin: {
        type: "boolean",
        required: true,
        defaultValue: false,
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
