import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { auth } from "@/utils/auth";

export const authRouter = createTRPCRouter({
  signIn: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      return await auth.api.signInMagicLink({
        headers: ctx.headers,
        body: { email: input.email, callbackUrl: "/home" },
      });
    }),
});
