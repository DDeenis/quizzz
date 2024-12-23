import { getTableColumns, type SQL, sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

export function conflictUpdateAllExcept<
  T extends SQLiteTable,
  E extends (keyof T["$inferInsert"])[]
>(table: T, except: E) {
  const columns = getTableColumns(table);
  const updateColumns = Object.entries(columns).filter(
    ([col]) => !except.includes(col as keyof typeof table.$inferInsert)
  );

  console.log(
    updateColumns.reduce(
      (acc, [colName, table]) => ({
        ...acc,
        [colName]: `excluded.${table.name}`,
      }),
      {}
    )
  );

  return updateColumns.reduce(
    (acc, [colName, table]) => ({
      ...acc,
      [colName]: sql.raw(`excluded.${table.name}`),
    }),
    {}
  ) as Omit<Record<keyof typeof table.$inferInsert, SQL>, E[number]>;
}

export function sqlNow() {
  return sql`(unixepoch())`;
}
