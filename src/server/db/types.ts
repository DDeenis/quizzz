/* eslint-disable @typescript-eslint/no-explicit-any */
import type { InferInsertModel } from "drizzle-orm";
import type { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import type * as schema from "./schema";

export type InferInsert<T extends keyof typeof schema> =
  (typeof schema)[T] extends SQLiteTableWithColumns<any>
    ? InferInsertModel<(typeof schema)[T]>
    : never;
