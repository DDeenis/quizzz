import { type z } from "zod";

type ActionContext<Context> = Context extends undefined
  ? undefined
  : NonNullable<Context>;
type ActionFn<Input extends z.Schema, Context, TReturn> = (
  input: z.infer<Input>,
  context: ActionContext<Context>
) => Promise<TReturn>;
type CreateActionFn<Context> = <
  Input extends z.Schema,
  TReturn
>(safeActionParams: {
  input: Input;
  action: ActionFn<Input, Context, TReturn>;
}) => (input: z.infer<Input>) => Promise<TReturn>;

type MiddlewareFn<Context> = () => Promise<Context>;
type MiddlewareObject = <Context>(fn: MiddlewareFn<Context>) => {
  create: CreateActionFn<Context>;
};

interface SafeAction {
  middleware: MiddlewareObject;
  create: CreateActionFn<undefined>;
}

export const safeAction: SafeAction = {
  middleware: (fn) => ({
    create: createActionWithMiddleware(fn),
  }),
  create: createActionWithMiddleware<undefined>(),
};

function createActionWithMiddleware<Context>(
  middlewareFn?: MiddlewareFn<Context>
): CreateActionFn<Context> {
  return ({ input: inputSchema, action }) => {
    return async (input) => {
      const validatedInput = inputSchema.parse(input) as z.infer<
        typeof inputSchema
      >;

      if (!middlewareFn) {
        return action(validatedInput, undefined as ActionContext<Context>);
      }

      const context = await middlewareFn();
      return action(validatedInput, context as ActionContext<Context>);
    };
  };
}
