import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "../trpc";
import { getTestsAsOptions } from "@/server/database/test";
import { getTestResultsForAdmin } from "@/server/database/testResult";

export const adminRouter = createTRPCRouter({
  getTestOptions: adminProcedure.query(async () => {
    return await getTestsAsOptions();
  }),

  getResultsForTest: adminProcedure
    .input(z.object({ testId: z.string() }))
    .query(async ({ input }) => {
      return await getTestResultsForAdmin(input.testId);
    }),
});
