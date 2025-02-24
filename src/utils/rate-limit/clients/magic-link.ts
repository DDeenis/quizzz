import { DatabaseStorage, getIpFingerprint, Throttler } from "../index";
import { RateLimiter } from "../rate-limiter";

export const magicLinkRateLimiter = new RateLimiter(
  new Throttler(new DatabaseStorage(), [0, 30, 60, 60, 90]),
  (req) => `magic-link_${getIpFingerprint(req)}`
);
