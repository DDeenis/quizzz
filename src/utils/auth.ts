import { db } from "@/server/db";
import { users, sessions, accounts, verifications } from "@/server/db/schema";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import { sendMagicLinkEmail } from "./mail";
import { nextCookies } from "better-auth/next-js";

const __map = new Map();

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
  rateLimit: {
    window: 60,
    max: 15,
    storage: "database",
    modelName: "rateLimit",
    customRules: {
      "/sign-in/magic-link/*": async (req) => {
        console.log(new URL(req.url).searchParams.get("token"));
        return {
          max: 1,
          window: 60,
        };
      },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async (params, req) => {
        await sendMagicLinkEmail({
          ...params,
          origin: new URL(req!.url).origin,
        });
      },
    }),
    nextCookies(), // make sure this is the last plugin in the array
  ],
});

export type Session = typeof auth.$Infer.Session;
