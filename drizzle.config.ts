import { type Config } from "drizzle-kit";

import { env } from "@/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DATABASE_URL,
    token: env.DATABASE_AUTH_TOKEN,
  },
  tablesFilter: ["step-quiz_*"],
} satisfies Config;
