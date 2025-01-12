import type { RateLimiterStorage } from "./types";

export class SlidingWindow {
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

export class SlidingWindowRateLimiter {
  private impl: SlidingWindow;
  private getKey: (req: Request) => string;

  constructor({
    storage,
    window,
    max,
    getKey,
  }: {
    storage: RateLimiterStorage;
    window: number;
    max: number;
    getKey: (req: Request) => string;
  }) {
    this.impl = new SlidingWindow(storage, { window, max });
    this.getKey = getKey;
  }

  async rateLimitRequest(req: Request) {
    return await this.impl.consume(this.getKey(req));
  }

  async resetRequest(req: Request) {
    return await this.impl.reset(this.getKey(req));
  }
}
