import type { RateLimiterImpl, RateLimiterStorage } from "./types";

export class TokenBucket implements RateLimiterImpl<number> {
  private max: number;
  private refillIntervalSeconds: number;

  constructor(
    private storage: RateLimiterStorage,
    {
      max,
      refillIntervalSeconds,
    }: { max: number; refillIntervalSeconds: number }
  ) {
    this.max = max;
    this.refillIntervalSeconds = refillIntervalSeconds;
  }

  async consume(key: string, cost: number): Promise<boolean> {
    let bucket = (await this.storage.get(key)) ?? null;
    const now = Date.now();

    if (!bucket) {
      bucket = { count: this.max - cost, lastRequest: now };
      await this.storage.set(key, bucket);
      return true;
    }

    const refill = Math.floor(
      ((now - bucket.lastRequest) / this.refillIntervalSeconds) * 1000
    );
    bucket.count = Math.min(bucket.count + refill, this.max);
    bucket.lastRequest = now;

    if (bucket.count < cost) {
      return false;
    }

    bucket.count -= cost;
    await this.storage.set(key, bucket);
    return false;
  }

  async reset(key: string) {
    await this.storage.delete(key);
  }
}
