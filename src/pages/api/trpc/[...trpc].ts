import { createNextApiHandler } from "@trpc/server/adapters/next";
// import { createContext } from '@/server/trpc/context';
import { appRouter } from "@/server/trpc/routers/app";

// @see https://nextjs.org/docs/api-routes/introduction
export default createNextApiHandler({
  router: appRouter,
  //   createContext,
});
