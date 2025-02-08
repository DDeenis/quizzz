import type { CategoryCreate } from "@/types/categories";
import { db } from ".";
import { categories } from "./schema";
import { slugify } from "./utils";

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
