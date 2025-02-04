import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getUserByEmail, getUserById, updateUser } from "@/server/db/user";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await getUserById(input.userId);

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return user;
    }),

  update: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        userUpdateObject: z
          .object({ email: z.string().email(), name: z.string() })
          .partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(input);
      if (input.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      if (
        input.userUpdateObject.email &&
        input.userUpdateObject.email !== ctx.session.user.email
      ) {
        const existingUser = await getUserByEmail(input.userUpdateObject.email);
        if (existingUser && existingUser.id !== ctx.session.user.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Email ${input.userUpdateObject.email} is already registered`,
          });
        }
      }

      const result = await updateUser(input.userId, input.userUpdateObject);

      if (!result) {
        throw new TRPCError({
          code: "UNPROCESSABLE_CONTENT",
        });
      }

      return result;
    }),
});
