export interface RateLimitCounter {
  count: number;
  lastRequest: number;
}

export interface RateLimiterStorage {
  set: (key: string, value: RateLimitCounter) => Promise<void>;
  get: (key: string) => Promise<RateLimitCounter | undefined>;
  delete: (key: string) => Promise<void>;
}

// export interface RateLimiterImpl {
//   consume: (key: string) => Promise<boolean>;
//   reset: (key: string) => Promise<void>;
// }
