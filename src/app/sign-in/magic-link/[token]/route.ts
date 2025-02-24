"use server";
import { auth } from "@/utils/auth";
import { magicLinkRateLimiter } from "@/utils/rate-limit/clients/magic-link";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await auth.api.magicLinkVerify({
      headers: req.headers,
      query: { token: (await params).token, callbackURL: "/home" },
    });
  } catch (err) {
    const res = err as {
      status: "FOUND";
      body: BodyInit;
      headers: HeadersInit;
    };
    if (res.status === "FOUND") {
      void magicLinkRateLimiter.resetRequest(req);
      return new Response(res.body, { headers: res.headers, status: 302 });
    }
  }

  return new Response("Internal Server Error", { status: 500 });
}
