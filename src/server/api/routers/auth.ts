import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getUserByEmail } from "@/server/db/user";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  canSignIn: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await getUserByEmail(input.email);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User with email ${input.email} don't exist`,
        });
      }

      if (user.deletedAt) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User is deleted",
        });
      }

      return true;
    }),
});
