import { type RateLimiterImpl } from "./types";

export class RateLimiter<Params = void> {
  constructor(
    private impl: RateLimiterImpl<Params>,
    private getKey: (req: Request) => string
  ) {}

  async rateLimitRequest(req: Request, params: Params) {
    return await this.impl.consume(this.getKey(req), params);
  }

  async resetRequest(req: Request) {
    return await this.impl.reset(this.getKey(req));
  }
}
