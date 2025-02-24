import type { RateLimitCounter, RateLimiterStorage } from "./types";

export class MemoryStorage implements RateLimiterStorage {
  private storage = new Map<string, RateLimitCounter>();

  public get(key: string) {
    return Promise.resolve(this.storage.get(key));
  }

  public set(key: string, value: RateLimitCounter) {
    this.storage.set(key, value);
    return Promise.resolve();
  }

  public delete(key: string) {
    this.storage.delete(key);
    return Promise.resolve();
  }
}
