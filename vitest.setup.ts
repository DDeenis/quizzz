import "@testing-library/jest-dom/vitest";
import { beforeEach, afterAll } from "vitest";
import * as schema from "@/server/db/schema";
import { db } from "@/server/db";
import { createRequire as topLevelCreateRequire } from "module";
const require = topLevelCreateRequire(import.meta.url);

const { pushSQLiteSchema } =
  require("drizzle-kit/api") as typeof import("drizzle-kit/api");

async function clearDb() {
  const result = await db.run(
    "select name from sqlite_master where type='table'"
  );
  const tables = result.rows.map((t) => t.name) as string[];
  await Promise.all(tables.map((t) => db.run(`delete from '${t}'`)));
}

const { statementsToExecute } = await pushSQLiteSchema(schema, db);
await Promise.all(statementsToExecute.map((statement) => db.run(statement)));

beforeEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await clearDb();
});
