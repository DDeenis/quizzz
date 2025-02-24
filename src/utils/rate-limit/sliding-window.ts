import type { RateLimiterImpl, RateLimiterStorage } from "./types";

export class SlidingWindow implements RateLimiterImpl {
  private window: number;
  private max: number;

  constructor(
    private storage: RateLimiterStorage,
    { window, max }: { window: number; max: number }
  ) {
    this.window = window;
    this.max = max;
  }

  async consume(key: string): Promise<boolean> {
    let counter = (await this.storage.get(key)) ?? null;
    const now = Date.now();

    if (!counter) {
      counter = {
        count: 1,
        lastRequest: now,
      };
      await this.storage.set(key, counter);
      return true;
    }

    const isNextWindow = now - counter.lastRequest >= this.window * 1000;
    counter.lastRequest = now;

    if (isNextWindow) {
      counter.count = 1;
      await this.storage.set(key, counter);
      return true;
    }

    if (counter.count >= this.max) {
      await this.storage.set(key, counter);
      return false;
    }

    counter.count += 1;
    await this.storage.set(key, counter);
    return true;
  }

  async reset(key: string) {
    await this.storage.delete(key);
  }
}
