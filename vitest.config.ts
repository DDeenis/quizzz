import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import nextEnv from "@next/env";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    env: nextEnv.loadEnvConfig(process.cwd()).combinedEnv,
    isolate: false,
    workspace: [
      {
        extends: true,
        test: {
          name: "All Tests",
          include: ["src/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
          exclude: ["src/server/db/*.{test,spec}.?(c|m)[jt]s?(x)"],
          setupFiles: ["./vitest.setup.ts"],
          environment: "jsdom",
        },
      },
      {
        extends: true,
        test: {
          name: "DB Tests",
          include: ["src/server/db/*.{test,spec}.?(c|m)[jt]s?(x)"],
          setupFiles: ["src/server/db/vitest.setup.ts"],
          environment: "node",
          pool: "forks",
          poolOptions: {
            forks: {
              singleFork: true,
            },
          },
        },
      },
    ],
  },
});
