import type * as schema from "@/server/db/schema";
import type { InferInsert } from "@/server/db/types";
import { createCategory as baseCreateCategory } from "@/server/db/category";

type InferPartialInsert<T extends keyof typeof schema> = Partial<
  InferInsert<T>
>;

async function createCategory(
  values: Omit<InferPartialInsert<"categories">, "slug">
) {
  return baseCreateCategory({
    id: values.id,
    name: values.name ?? "Category 1",
    image: values.image ?? "",
  });
}

const fixtures = { createCategory };
export default fixtures;
