import type { InferInsert } from "@/server/db/types";

export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string;
}

export type CategoryCreate = Omit<InferInsert<"categories">, "slug">;
