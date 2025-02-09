import type { CategoryCreate, CategoryUpdate } from "@/types/categories";
import { db } from ".";
import { categories } from "./schema";
import { slugify } from "./utils";
import { eq } from "drizzle-orm";

export async function createCategory(values: CategoryCreate) {
  const res = await db
    .insert(categories)
    .values({
      id: values.id,
      name: values.name,
      slug: slugify(values.name, { appendRandomNumber: false }),
      image: values.image,
    })
    .returning();
  return res[0]!;
}

export async function updateCategory(
  categoryId: string,
  values: CategoryUpdate
) {
  if (values.name === undefined && values.image === undefined) return;
  const res = await db
    .update(categories)
    .set({
      name: values.name,
      slug: values.name
        ? slugify(values.name, { appendRandomNumber: false })
        : undefined,
      image: values.image,
    })
    .where(eq(categories.id, categoryId))
    .returning();
  return res[0];
}
