import type { InferInsert } from "@/server/db/types";
import { createCategory as baseCreateCategory } from "@/server/db/category";

async function createCategory(
  values?: Omit<InferInsert<"categories">, "slug">
) {
  return baseCreateCategory({
    id: values?.id,
    name: values?.name ?? "Category 1",
    image: values?.image ?? "https://example.com/image.jpg",
  });
}

const fixtures = { createCategory };
export default fixtures;
