import { auth } from "@/utils/auth";
import { magicLinkRateLimiter } from "@/utils/rate-limit/clients/magic-link";

export async function POST(req: Request) {
  const isAllowed = await magicLinkRateLimiter.rateLimitRequest(req);

  if (!isAllowed) {
    return new Response(
      JSON.stringify({
        message: "Too many requests. Please, try again later.",
      }),
      { status: 429, statusText: "Too Many Requests" }
    );
  }

  const res = await auth.api.signInMagicLink({
    headers: req.headers,
    body: (await req.json()) as {
      email: string;
      callbackURL?: string;
    },
    req,
  });

  return Response.json(res);
}
