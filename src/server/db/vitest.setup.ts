import { beforeEach, afterAll, beforeAll, vi } from "vitest";
import * as schema from "@/server/db/schema";
import { db } from "@/server/db";
import { createRequire as topLevelCreateRequire } from "module";
const require = topLevelCreateRequire(import.meta.url);

const { pushSQLiteSchema } =
  require("drizzle-kit/api") as typeof import("drizzle-kit/api");

async function pushDbChanges() {
  const { apply } = await pushSQLiteSchema(schema, db);
  await apply();
}

async function clearDb() {
  const result = await db.run(
    "select name from sqlite_master where type='table'"
  );
  const tables = result.rows.map((t) => t.name) as string[];
  await db.transaction(async (tx) => {
    await Promise.all(tables.map((t) => tx.run(`delete from \`${t}\``)));
  });
}

const globalForTests = globalThis as unknown as {
  dbPushCompleted: boolean | undefined;
};

beforeAll(async () => {
  if (!globalForTests.dbPushCompleted) {
    globalForTests.dbPushCompleted = true;
    await pushDbChanges();
  }
});

beforeEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await clearDb();
});

vi.mock("server-only", () => ({}));
