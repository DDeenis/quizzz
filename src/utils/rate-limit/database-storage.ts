import { db } from "@/server/db";
import { rateLimit } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import type { RateLimitCounter, RateLimiterStorage } from "./types";

export class DatabaseStorage implements RateLimiterStorage {
  public async get(key: string) {
    return await db.query.rateLimit.findFirst({
      where: eq(rateLimit.key, key),
    });
  }

  public async set(key: string, value: RateLimitCounter) {
    await db
      .insert(rateLimit)
      .values({ key, ...value })
      .onConflictDoUpdate({
        target: rateLimit.key,
        set: { count: value.count, lastRequest: value.lastRequest },
      });
  }

  public async delete(key: string) {
    await db.delete(rateLimit).where(eq(rateLimit.key, key));
  }
}
