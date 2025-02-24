import { getTableColumns, type SQL, sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import slug from "slug";

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

function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface SlugifyConfig {
  maxChars?: number;
  appendRandomNumber?: boolean;
}

export function slugify(str: string, config?: SlugifyConfig) {
  const maxChars = config?.maxChars ?? 128;
  const appendRandomNumber = config?.appendRandomNumber ?? true;

  if (appendRandomNumber) {
    const num = randomInteger(1000, 9999).toString();
    const slugTruncated = slug(str).slice(0, maxChars - (num.length + 1));
    return `${slugTruncated}${slugTruncated.endsWith("-") ? "" : "-"}${num}`;
  }

  return slug(str).slice(0, maxChars);
}
