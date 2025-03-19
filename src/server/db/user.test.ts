import fixtures from "@/utils/test/fixtures";
import { describe, expect, it } from "vitest";
import { getUserFromDb } from "./user";

describe("Users DAL", () => {
  describe("getUserFromDb", () => {
    it("should return a user by id", async () => {
      const student = await fixtures.createStudent();

      await expect(getUserFromDb(student.id)).resolves.toMatchObject(student);
    });

    it("should return undefined if user is not found", async () => {
      await expect(getUserFromDb("non-existent")).resolves.toBeUndefined();
    });
  });
});
