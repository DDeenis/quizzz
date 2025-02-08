import { describe, expect, it } from "vitest";
import { createCategory } from "./category";

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
});
