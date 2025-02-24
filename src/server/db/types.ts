import type { InferInsertModel } from "drizzle-orm";
import type * as schema from "./schema";

type Schema = typeof schema;
type TableKeys = keyof Omit<Schema, `${string}Relations` | "createTable">;

export type InferInsert<T extends TableKeys> = InferInsertModel<Schema[T]>;
