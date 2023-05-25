import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { createUser } from "@/server/database/user";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        fullName: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      return await createUser(input);
    }),
});
