import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { getTestResultWithTest } from "@/server/database/testResult";

export const testResultRouter = createTRPCRouter({
  getWithTest: protectedProcedure
    .input(z.object({ testResultId: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await getTestResultWithTest(input.testResultId);

      if (
        result?.testResult.userId !== ctx.session.user.id &&
        !ctx.session.user.isAdmin
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
        });
      }

      return result;
    }),
});
