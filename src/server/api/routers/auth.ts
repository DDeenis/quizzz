import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { createUser, getUserByEmail } from "@/server/database/user";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        fullName: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const existingUser = await getUserByEmail(input.email);

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `User with email ${input.email} already exist`,
        });
      }

      return await createUser(input);
    }),

  signIn: publicProcedure
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

      return true;
    }),
});
