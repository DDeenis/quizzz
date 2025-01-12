import {
  DatabaseStorage,
  getIpFingerprint,
  ThrottlerRateLimiter,
} from "../index";

export const magicLinkRateLimiter = new ThrottlerRateLimiter({
  storage: new DatabaseStorage(),
  timeoutSeconds: [0, 30, 60, 60, 90],
  getKey: (req) => `magic-link_${getIpFingerprint(req)}`,
});
