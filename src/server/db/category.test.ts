import { describe, expect, it } from "vitest";
import { createCategory, updateCategory } from "./category";
import fixtures from "@/utils/test/fixtures";

describe("Category DAL", () => {
  it("should create category", async () => {
    const values = {
      id: crypto.randomUUID(),
      name: "History of the twentieth century",
      image: "/some/image/path.jpg",
    };
    const category = await createCategory(values);

    expect(category).toStrictEqual({
      id: values.id,
      name: values.name,
      image: values.image,
      slug: "history-of-the-twentieth-century",
    });
  });

  it("should update category", async () => {
    const category = await fixtures.createCategory();
    const updatedCategory = await updateCategory(category.id, {
      name: "Category 2",
      image: "/image.jpg",
    });

    expect(updatedCategory).toStrictEqual({
      id: category.id,
      name: "Category 2",
      image: "/image.jpg",
      slug: "category-2",
    });
  });
});
